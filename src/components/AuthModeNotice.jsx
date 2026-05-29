import { isFirebaseAuthEnabled } from "../config/authMode";
import { getFirebaseConfig } from "../config/firebaseEnv";

/**
 * На проде без VITE_FIREBASE_* при сборке регистрация идёт только в localStorage,
 * в Firebase Console пользователей не будет.
 */
const AuthModeNotice = () => {
  if (!import.meta.env.PROD) return null;

  if (isFirebaseAuthEnabled()) {
    const projectId = getFirebaseConfig().projectId;
    if (!projectId) return null;
    return (
      <p
        style={{
          fontSize: "0.8rem",
          opacity: 0.7,
          margin: "0.75rem 0 0",
          textAlign: "center",
          maxWidth: "28rem",
        }}
      >
        Вход через Firebase · проект <strong>{projectId}</strong>
      </p>
    );
  }

  return (
    <div
      role="alert"
      style={{
        margin: "1rem auto 0",
        padding: "0.75rem 1rem",
        maxWidth: "32rem",
        fontSize: "0.85rem",
        lineHeight: 1.45,
        borderRadius: "8px",
        border: "1px solid rgba(255, 180, 80, 0.6)",
        background: "rgba(255, 180, 80, 0.12)",
        color: "inherit",
      }}
    >
      <strong>Firebase не подключён на этом сайте.</strong> Регистрация сохраняется
      только в этом браузере, в Firebase Console пользователей не будет. В Render →
      Environment добавьте <code>VITE_FIREBASE_*</code> и сделайте{" "}
      <strong>Deploy latest commit</strong>.
    </div>
  );
};

export default AuthModeNotice;
