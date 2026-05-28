import { create } from "zustand";
import apiCall from "./apiClient";
import { fetchPublicEvents } from "../hooks/usePublicEvents";

export const useSliderEvents = create((set) => ({
  numberMas: 0,
  slaiderTime: [],
  loading: false,
  error: null,

  fetchSliderEvents: async () => {
    set({ loading: true, error: null });

    try {
      const list = await fetchPublicEvents();

      set({
        slaiderTime: list,
        numberMas: 0,
        loading: false,
        error: null,
      });

      return list;
    } catch (err) {
      console.error("Ошибка загрузки мероприятий:", err);

      set({
        numberMas: 0,
        slaiderTime: [],
        loading: false,
        error: err.message || "Не удалось загрузить мероприятия",
      });

      throw err;
    }
  },

  setEventsPlus: () =>
    set((state) =>
      state.numberMas < state.slaiderTime.length - 1
        ? { numberMas: state.numberMas + 1 }
        : { numberMas: 0 }
    ),
  setEventsMinus: () =>
    set((state) =>
      state.numberMas <= 0
        ? { numberMas: state.slaiderTime.length - 1 }
        : { numberMas: state.numberMas - 1 }
    ),
}));

export const useSliderPoem = create((set) => ({
  neumbersPoem: 0,
  slaiderPoem: [],
  loading: false,
  error: null,

  fetchSliderPoem: async () => {
    set({ loading: true, error: null });

    try {
      const data = await apiCall("/posts");
      const list = Array.isArray(data) ? data : [];

      set({
        slaiderPoem: list,
        neumbersPoem: 0,
        loading: false,
        error: null,
      });

      return list;
    } catch (err) {
      console.error("Ошибка загрузки стихов:", err);

      const errorMessage = err.message || "Не удалось загрузить стихи";

      set({
        slaiderPoem: [],
        neumbersPoem: 0,
        loading: false,
        error: errorMessage,
      });

      throw err;
    }
  },

  setPoemPlus: () =>
    set((state) =>
      state.neumbersPoem < state.slaiderPoem.length - 1
        ? { neumbersPoem: state.neumbersPoem + 1 }
        : { neumbersPoem: 0 }
    ),
  setPoemMinus: () =>
    set((state) =>
      state.neumbersPoem <= 0
        ? { neumbersPoem: state.slaiderPoem.length - 1 }
        : { neumbersPoem: state.neumbersPoem - 1 }
    ),
}));
