import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { isAdminEmail } from "../config/adminAccount";
import { ROLE_IDS } from "../constants/roles";
import { getFirebaseDb } from "../lib/firebase";

const USERS_COLLECTION = "users";

const defaultMemberRoles = () => [{ id: 1, name: "GREEN" }];

const defaultAdminRoles = () => [{ id: ROLE_IDS.RED, name: "RED" }];

export const getFirestoreUserProfile = async (uid) => {
  const ref = doc(getFirebaseDb(), USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
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
  const existing = await getFirestoreUserProfile(uid);
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

  return { id: uid, ...record };
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
