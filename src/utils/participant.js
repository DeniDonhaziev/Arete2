/** Отображаемое имя участника (ник) */
export const getParticipantDisplayName = (participant) => {
  if (!participant) return "Участник";

  const first = String(participant.firstName || "").trim();
  const last = String(participant.lastName || "").trim();
  const full = [first, last].filter(Boolean).join(" ");

  if (full) return full;

  const email = String(participant.email || "").trim();
  if (email.includes("@")) return email.split("@")[0];

  const id = String(participant.id || "");
  if (id.length > 4) return `Участник ${id.slice(0, 6)}…`;

  return "Участник";
};

export const getParticipantInitials = (participant) => {
  const first = String(participant?.firstName || "").trim();
  const last = String(participant?.lastName || "").trim();

  if (first || last) {
    return `${last.charAt(0)}${first.charAt(0)}`.toUpperCase() || "?";
  }

  const nick = getParticipantDisplayName(participant);
  return nick.slice(0, 2).toUpperCase();
};

export const buildJoinPayloadFromUser = (user) => {
  if (!user?.id) return null;

  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    roles: user.roles || [],
  };
};
