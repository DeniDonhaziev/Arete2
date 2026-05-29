import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { isAdminEmail } from "../config/adminAccount";
import { getFirebaseAuth, initFirebaseAnalytics } from "../lib/firebase";
import { completeAuth, useAuthStore } from "../store/authStore";
import { isAdmin } from "../utils/roles";
import {
  ensureFirestoreUserProfile,
  getFirestoreUserProfile,
} from "./firebaseUserProfile";
import { syncUserRecordToServer } from "./syncUserToServer";

const mapFirebaseAuthError = (err) => {
  const code = err?.code || "";
  const error = new Error(err?.message || "Ошибка Firebase Auth");
  error.code = code;

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    error.message = "Неверный email или пароль";
    error.status = 401;
  } else if (code === "auth/email-already-in-use") {
    error.message = "Пользователь с таким email уже зарегистрирован";
    error.status = 409;
  } else if (code === "auth/weak-password") {
    error.message = "Пароль слишком простой (минимум 6 символов)";
    error.status = 400;
  } else if (code === "auth/invalid-email") {
    error.message = "Некорректный email";
    error.status = 400;
  } else if (code === "auth/too-many-requests") {
    error.message = "Слишком много попыток. Попробуйте позже";
    error.status = 429;
  }

  return error;
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

const syncProfileToClubServer = async (user) => {
  await syncUserRecordToServer({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    passwordHash: "",
    roles: user.roles,
    createdAt: user.createdAt,
  });
};

export const firebaseRegister = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  try {
    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    );

    const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    const profile = await ensureFirestoreUserProfile({
      uid: credential.user.uid,
      email: credential.user.email,
      firstName,
      lastName,
    });

    const user = buildAppUser(credential.user, profile);
    const token = await credential.user.getIdToken();
    await syncProfileToClubServer(user);

    return { token, user };
  } catch (err) {
    throw mapFirebaseAuthError(err);
  }
};

export const firebaseLogin = async ({ email, password }) => {
  try {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    );

    let profile = await getFirestoreUserProfile(credential.user.uid);
    if (!profile) {
      profile = await ensureFirestoreUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
      });
    } else if (isAdminEmail(credential.user.email)) {
      profile = await ensureFirestoreUserProfile({
        uid: credential.user.uid,
        email: credential.user.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    }

    const user = buildAppUser(credential.user, profile);
    const token = await credential.user.getIdToken();
    await syncProfileToClubServer(user);

    return { token, user };
  } catch (err) {
    throw mapFirebaseAuthError(err);
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
