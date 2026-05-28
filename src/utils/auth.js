export const normalizeAuthResponse = (data) => {
  const token = data?.token;
  const user =
    data?.user ??
    (data?.id
      ? {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          roles: data.roles,
        }
      : null);

  return { token, user };
};
