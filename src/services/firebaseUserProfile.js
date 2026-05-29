import {
  doc,
  enableNetwork,
  getDoc,
  getDocFromServer,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { isAdminEmail } from "../config/adminAccount";
import { ROLE_IDS } from "../constants/roles";
import { getFirebaseDb } from "../lib/firebase";

const USERS_COLLECTION = "users";

const defaultMemberRoles = () => [{ id: 1, name: "GREEN" }];

const defaultAdminRoles = () => [{ id: ROLE_IDS.RED, name: "RED" }];

export const isFirestoreOfflineError = (err) => {
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("offline") ||
    err?.code === "unavailable" ||
    err?.code === "failed-precondition"
  );
};

const readProfileSnapshot = async (ref) => {
  const db = getFirebaseDb();

  const tryRead = async (readFn) => {
    try {
      return await readFn(ref);
    } catch (err) {
      if (!isFirestoreOfflineError(err)) throw err;
      await enableNetwork(db);
      return readFn(ref);
    }
  };

  try {
    return await tryRead(getDocFromServer);
  } catch (err) {
    if (!isFirestoreOfflineError(err)) throw err;
    return tryRead(getDoc);
  }
};

export const getFirestoreUserProfile = async (uid) => {
  const ref = doc(getFirebaseDb(), USERS_COLLECTION, uid);
  const snap = await readProfileSnapshot(ref);
  if (!snap.exists()) return null;
  return { id: uid, ...snap.data() };
};

export const ensureFirestoreUserProfile = async ({
  uid,
  email,
  firstName = "",
  lastName = "",
}) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  let existing = null;
  try {
    existing = await getFirestoreUserProfile(uid);
  } catch (err) {
    if (!isFirestoreOfflineError(err)) throw err;
    console.warn("Firestore offline, профиль создаётся без чтения:", err.message);
  }

  const roles = isAdminEmail(normalizedEmail)
    ? defaultAdminRoles()
    : existing?.roles?.length
      ? existing.roles
      : defaultMemberRoles();

  const record = {
    email: normalizedEmail,
    firstName: String(firstName || existing?.firstName || "").trim(),
    lastName: String(lastName || existing?.lastName || "").trim(),
    roles,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid), record, {
    merge: true,
  });

  try {
    const saved = await getFirestoreUserProfile(uid);
    return saved || { id: uid, ...record, updatedAt: undefined };
  } catch (err) {
    if (!isFirestoreOfflineError(err)) throw err;
    return { id: uid, ...record, updatedAt: undefined };
  }
};

export const updateFirestoreUserProfile = async (uid, patch) => {
  const ref = doc(getFirebaseDb(), USERS_COLLECTION, uid);
  await setDoc(
    ref,
    {
      ...patch,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return getFirestoreUserProfile(uid);
};
