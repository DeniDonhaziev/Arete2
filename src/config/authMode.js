import { USE_FIREBASE_AUTH } from "./firebaseEnv";

/** Подсказка на странице входа (режим задаётся при сборке на Render) */
export const getLoginHint = () => {
  if (USE_FIREBASE_AUTH) {
    return (
      "Вход через Firebase: используйте тот же email и пароль, что при регистрации на сайте. " +
      "Админ — только учётка из Firebase Console → Authentication → Users."
    );
  }

  return (
    "Сейчас сайт работает в локальном режиме (без Firebase). " +
    "Вход возможен только для аккаунтов, созданных в этом браузере. " +
    "Чтобы включить Firebase: добавьте VITE_FIREBASE_* в Render и пересоберите проект."
  );
};

export const isFirebaseAuthEnabled = () => USE_FIREBASE_AUTH;
