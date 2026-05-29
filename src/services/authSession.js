import { USE_FIREBASE_AUTH } from "../config/firebaseEnv";
import { useAuthStore } from "../store/authStore";
import { firebaseSignOut } from "./firebaseAuthService";

export const logoutSession = async () => {
  if (USE_FIREBASE_AUTH) {
    await firebaseSignOut();
  }
  useAuthStore.getState().logout();
};
