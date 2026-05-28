export const ROLE_IDS = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  RED: 4,
};

export const ROLE_PRIORITY = {
  ROLE_BRONZE: 1,
  ROLE_SILVER: 2,
  ROLE_GOLD: 3,
  ROLE_RED: 4,
};

export const ROLE_LABELS = {
  ROLE_BRONZE: "BRONZE",
  ROLE_SILVER: "SILVER",
  ROLE_GOLD: "GOLD",
  ROLE_RED: "RED",
};

export const ROLE_COLORS = {
  ROLE_BRONZE: {
    background: "rgba(205, 127, 50, 0.2)",
    border: "rgba(205, 127, 50, 0.65)",
    text: "#cd7f32",
  },
  ROLE_SILVER: {
    background: "rgba(169, 169, 169, 0.2)",
    border: "rgba(169, 169, 169, 0.65)",
    text: "#b7b7b7",
  },
  ROLE_GOLD: {
    background: "rgba(255, 215, 0, 0.18)",
    border: "rgba(255, 215, 0, 0.7)",
    text: "#ffd700",
  },
  ROLE_RED: {
    background: "rgba(255, 76, 76, 0.2)",
    border: "rgba(255, 76, 76, 0.72)",
    text: "#ff5c5c",
  },
};

export const ROLE_OPTIONS = [
  { id: ROLE_IDS.BRONZE, name: "ROLE_BRONZE", label: ROLE_LABELS.ROLE_BRONZE },
  { id: ROLE_IDS.SILVER, name: "ROLE_SILVER", label: ROLE_LABELS.ROLE_SILVER },
  { id: ROLE_IDS.GOLD, name: "ROLE_GOLD", label: ROLE_LABELS.ROLE_GOLD },
  { id: ROLE_IDS.RED, name: "ROLE_RED", label: ROLE_LABELS.ROLE_RED },
];
