export const hasValidSession = (state) =>
  Boolean(state?.isAuthenticated && state?.token && state?.user?.id != null);
