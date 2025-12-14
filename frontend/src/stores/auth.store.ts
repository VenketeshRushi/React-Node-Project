import { create } from "zustand";
import { persist } from "zustand/middleware";
import { removeCookies } from "@/utils/ext";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "superadmin";
  avatar_url?: string;
  onboarding?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  error: string | null;

  setUser: (user: AuthUser) => void;
  clear: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      error: null,

      setUser: (user: AuthUser) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
        }),

      clear: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        }),

      logout: () => {
        removeCookies(["accessToken", "user"]);
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        window.location.href = "/";
      },
    }),
    {
      name: "auth-storage",
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
