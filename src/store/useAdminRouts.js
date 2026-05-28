import { create } from "zustand";

export const useAdminRouts = create((set)=>({
    activeRoute:'blogs',
    setActiveRoute: (route)=>set({activeRoute:route})
})) 