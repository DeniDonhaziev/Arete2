const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => EMAIL_RE.test(String(email || "").trim());

export const validateRegistrationForm = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}) => {
  const trimmedFirst = String(firstName || "").trim();
  const trimmedLast = String(lastName || "").trim();
  const trimmedEmail = String(email || "").trim();

  if (!trimmedFirst || !trimmedLast) {
    return "Укажите имя и фамилию";
  }

  if (!trimmedEmail) {
    return "Укажите email";
  }

  if (!isValidEmail(trimmedEmail)) {
    return "Введите корректный email";
  }

  if (!password) {
    return "Укажите пароль";
  }

  if (password.length < 8) {
    return "Пароль должен содержать минимум 8 символов";
  }

  if (password !== confirmPassword) {
    return "Пароли не совпадают";
  }

  return null;
};

export const validateLoginForm = ({ email, password }) => {
  const trimmedEmail = String(email || "").trim();

  if (!trimmedEmail) {
    return "Укажите email";
  }

  if (!isValidEmail(trimmedEmail)) {
    return "Введите корректный email";
  }

  if (!password) {
    return "Укажите пароль";
  }

  return null;
};
