import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { isAdminEmail } from "../config/adminAccount";
import { ROLE_IDS } from "../constants/roles";
import { getFirebaseAuth, initFirebaseAnalytics } from "../lib/firebase";
import { completeAuth, useAuthStore } from "../store/authStore";
import { isAdmin } from "../utils/roles";
import {
  createFirestoreUserProfile,
  ensureFirestoreUserProfile,
  getFirestoreUserProfile,
  isFirestoreOfflineError,
} from "./firebaseUserProfile";
import { syncUserRecordToServer } from "./syncUserToServer";

const AUTH_TIMEOUT_MS = 20000;

const withTimeout = (promise, ms, message) => {
  let timeoutId;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), ms);
    }),
  ]).finally(() => clearTimeout(timeoutId));
};

const buildRegistrationProfile = ({ uid, email, firstName, lastName }) => ({
  id: uid,
  email: String(email || "").trim().toLowerCase(),
  firstName: String(firstName || "").trim(),
  lastName: String(lastName || "").trim(),
  roles: isAdminEmail(email)
    ? [{ id: ROLE_IDS.RED, name: "RED" }]
    : [{ id: 1, name: "GREEN" }],
  createdAt: new Date().toISOString(),
});

const mapFirebaseAuthError = (err) => {
  const code = err?.code || "";
  const error = new Error(err?.message || "Ошибка Firebase Auth");
  error.code = code;

  if (code === "auth/user-not-found") {
    error.message =
      "Пользователь с таким email не найден. Зарегистрируйтесь на /registration или создайте пользователя в Firebase Console → Authentication.";
    error.status = 401;
  } else if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password"
  ) {
    error.message =
      "Неверный пароль или email. Проверьте раскладку и Caps Lock. Для админа — пароль из Firebase Authentication, не из подсказки на сайте.";
    error.status = 401;
  } else if (code === "auth/invalid-email") {
    error.message = "Некорректный email";
    error.status = 400;
  } else if (code === "auth/email-already-in-use") {
    error.message = "Пользователь с таким email уже зарегистрирован";
    error.status = 409;
  } else if (code === "auth/weak-password") {
    error.message = "Пароль слишком простой (минимум 6 символов)";
    error.status = 400;
  } else if (code === "auth/operation-not-allowed") {
    error.message =
      "Вход по email отключён. В Firebase: Authentication → Sign-in method → включите Email/Password.";
    error.status = 403;
  } else if (code === "auth/too-many-requests") {
    error.message = "Слишком много попыток. Попробуйте позже";
    error.status = 429;
  } else if (code === "permission-denied") {
    error.message =
      "Нет доступа к Firestore. Проверьте правила базы в Firebase Console.";
    error.status = 403;
  } else if (
    String(err?.message || "")
      .toLowerCase()
      .includes("offline")
  ) {
    error.message =
      "Нет связи с Firestore. Проверьте интернет, отключите блокировщик рекламы для сайта и убедитесь, что Firestore Database создана в Firebase Console.";
    error.status = 503;
  }

  return error;
};

const mapProfileError = (err) => {
  if (isFirestoreOfflineError(err)) {
    const error = new Error(
      "Нет связи с Firestore. Проверьте интернет и что в Firebase включена Firestore Database."
    );
    error.status = 503;
    return error;
  }
  return mapFirebaseAuthError(err);
};

export const buildAppUser = (firebaseUser, profile) => ({
  id: firebaseUser.uid,
  email: profile?.email || firebaseUser.email,
  firstName: profile?.firstName || firebaseUser.displayName?.split(" ")[0] || "",
  lastName:
    profile?.lastName ||
    firebaseUser.displayName?.split(" ").slice(1).join(" ") ||
    "",
  roles: profile?.roles || [],
});

export const getFirebaseIdToken = async (forceRefresh = false) => {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
};

const syncProfileToClubServer = async (user, { required = false } = {}) => {
  await syncUserRecordToServer(
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: "",
      roles: user.roles,
      createdAt: user.createdAt,
    },
    { throwOnError: required }
  );
};

export const firebaseRegister = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  try {
    const credential = await withTimeout(
      createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password
      ),
      AUTH_TIMEOUT_MS,
      "Регистрация заняла слишком долго. Проверьте интернет и попробуйте снова."
    );

    const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (displayName) {
      void updateProfile(credential.user, { displayName }).catch(() => {});
    }

    const profile = buildRegistrationProfile({
      uid: credential.user.uid,
      email: credential.user.email,
      firstName,
      lastName,
    });

    const token = await withTimeout(
      credential.user.getIdToken(),
      AUTH_TIMEOUT_MS,
      "Не удалось получить токен входа. Попробуйте войти через /login."
    );

    const user = buildAppUser(credential.user, profile);

    void createFirestoreUserProfile({
      uid: credential.user.uid,
      email: credential.user.email,
      firstName,
      lastName,
    }).catch((err) => {
      console.warn("Firestore profile (background):", err?.message || err);
    });

    void syncProfileToClubServer(user);

    return { token, user };
  } catch (err) {
    throw mapProfileError(err);
  }
};

export const firebaseLogin = async ({ email, password }) => {
  try {
    const credential = await withTimeout(
      signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password),
      AUTH_TIMEOUT_MS,
      "Вход занял слишком долго. Проверьте интернет и попробуйте снова."
    );

    let profile = null;
    try {
      profile = await withTimeout(
        getFirestoreUserProfile(credential.user.uid),
        8000,
        "Firestore timeout"
      );
    } catch (err) {
      if (!isFirestoreOfflineError(err) && err?.message !== "Firestore timeout") {
        throw err;
      }
    }

    if (!profile) {
      void ensureFirestoreUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
      }).catch(() => {});

      profile = buildRegistrationProfile({
        uid: credential.user.uid,
        email: credential.user.email,
        firstName: credential.user.displayName?.split(" ")[0] || "",
        lastName:
          credential.user.displayName?.split(" ").slice(1).join(" ") || "",
      });
    } else if (isAdminEmail(credential.user.email)) {
      void ensureFirestoreUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }).catch(() => {});
    }

    const user = buildAppUser(credential.user, profile);
    const token = await credential.user.getIdToken();
    void syncProfileToClubServer(user);

    return { token, user };
  } catch (err) {
    throw mapProfileError(err);
  }
};

export const firebaseLoginAdmin = async ({ email, password }) => {
  const { token, user } = await firebaseLogin({ email, password });

  if (!isAdmin(user)) {
    await signOut(getFirebaseAuth());
    const error = new Error("Доступ только для администратора клуба");
    error.status = 403;
    throw error;
  }

  return { token, user };
};

export const firebaseSignOut = async () => {
  try {
    await signOut(getFirebaseAuth());
  } catch {
    /* уже вышли */
  }
};

let authListenerStarted = false;

export const startFirebaseAuthListener = () => {
  if (authListenerStarted) return;
  authListenerStarted = true;

  void initFirebaseAnalytics();

  onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
    if (!firebaseUser) {
      const state = useAuthStore.getState();
      if (state.token && !String(state.token).includes("mock-signature")) {
        state.logout();
      }
      return;
    }

    try {
      const profile =
        (await getFirestoreUserProfile(firebaseUser.uid)) ||
        (await ensureFirestoreUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        }));

      const token = await firebaseUser.getIdToken();
      const user = buildAppUser(firebaseUser, profile);
      completeAuth(token, user);
    } catch (err) {
      console.warn("Firebase auth listener:", err?.message || err);
    }
  });
};
