/** По умолчанию пусто — мероприятия добавляет только админ */
export const initialMockEvents = [];

/** По умолчанию пусто — стихи добавляют участники, админ одобряет */
export const initialMockPosts = [];

export const initialMockUsers = [
  {
    id: 1,
    firstName: "Админ",
    lastName: "Клуба",
    email: "admin@arete.local",
    roles: [{ id: 4, name: "RED" }],
  },
  {
    id: 2,
    firstName: "Иван",
    lastName: "Иванов",
    email: "ivan@arete.local",
    roles: [{ id: 2, name: "YELLOW" }],
  },
  {
    id: 3,
    firstName: "Мария",
    lastName: "Петрова",
    email: "maria@arete.local",
    roles: [{ id: 1, name: "GREEN" }],
  },
  {
    id: 4,
    firstName: "Алексей",
    lastName: "Смирнов",
    email: "alex@arete.local",
    roles: [{ id: 1, name: "GREEN" }],
  },
  {
    id: 5,
    firstName: "Елена",
    lastName: "Козлова",
    email: "elena@arete.local",
    roles: [{ id: 1, name: "GREEN" }],
  },
];

export const createMockToken = (userId) => {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      exp: 4102444800,
      sub: String(userId ?? "mock-user"),
    })
  );
  return `${header}.${payload}.mock-signature`;
};
