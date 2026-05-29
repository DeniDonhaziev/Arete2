import {
  doc,
  enableNetwork,
  getDoc,
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

  try {
    return await getDoc(ref);
  } catch (err) {
    if (!isFirestoreOfflineError(err)) throw err;
    await enableNetwork(db);
    return getDoc(ref);
  }
};

/** Быстрое создание профиля при регистрации — без лишних чтений из Firestore */
export const createFirestoreUserProfile = async ({
  uid,
  email,
  firstName = "",
  lastName = "",
}) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const roles = isAdminEmail(normalizedEmail)
    ? defaultAdminRoles()
    : defaultMemberRoles();

  const record = {
    email: normalizedEmail,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    roles,
    createdAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(getFirebaseDb(), USERS_COLLECTION, uid), record, {
    merge: true,
  });

  return { id: uid, ...record, updatedAt: undefined };
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

  return { id: uid, ...record, updatedAt: undefined };
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
