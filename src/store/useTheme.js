import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTheme = create(
  persist(
    (set) => ({
      // Начальное значение — будет использовано, если нет данных в localStorage
      theme: 'black',

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'black' ? 'white' : 'black';
          return { theme: newTheme };
        }),
    }),
    {
      name: 'theme-storage', // имя ключа в localStorage
    }
  )
);