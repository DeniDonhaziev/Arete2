import { loadUserRecords } from "./usersStore.js";

const normalizeParticipantId = (participant) => {
  if (participant == null) return null;
  if (typeof participant === "object") return participant.id ?? null;
  return participant;
};

export const findUserRecordById = async (id) => {
  if (id == null || id === "") return null;
  const records = await loadUserRecords();
  return (
    records.find((user) => String(user.id) === String(id)) ||
    records.find(
      (user) =>
        String(user.email || "").trim().toLowerCase() ===
        String(id).trim().toLowerCase()
    ) ||
    null
  );
};

export const enrichParticipant = async (participant) => {
  const id = normalizeParticipantId(participant);
  if (id == null) return participant;

  const base =
    typeof participant === "object" && participant !== null
      ? { ...participant, id }
      : { id };

  const record = await findUserRecordById(id);

  return {
    id: base.id,
    firstName: base.firstName || record?.firstName || "",
    lastName: base.lastName || record?.lastName || "",
    email: base.email || record?.email || "",
    roles: base.roles?.length ? base.roles : record?.roles || [],
  };
};

export const enrichEventParticipants = async (event) => {
  const participants = Array.isArray(event?.participants)
    ? await Promise.all(event.participants.map(enrichParticipant))
    : [];

  return { ...event, participants };
};

export const buildParticipantOnJoin = async (uid, body = {}) => {
  const fromBody = {
    id: uid,
    firstName: String(body.firstName || "").trim(),
    lastName: String(body.lastName || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    roles: Array.isArray(body.roles) ? body.roles : [],
  };

  if (fromBody.firstName || fromBody.lastName || fromBody.email) {
    return enrichParticipant(fromBody);
  }

  return enrichParticipant({ id: uid });
};
