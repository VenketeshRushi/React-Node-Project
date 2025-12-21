import { create } from "zustand";
import { persist } from "zustand/middleware";
import { removeCookies } from "@/utils/ext";
import { AuthServices } from "@/services/auth.services";
import { UsersServices } from "@/services/users.services";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "superadmin";
  is_active: boolean;
  is_banned: boolean;

  mobile_no?: string;
  avatar_url?: string;
  onboarding?: boolean;

  profession?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  language?: string;

  login_method?: string;

  created_at?: string;
  updated_at?: string;
}

interface LogoutOptions {
  redirect?: boolean;
  redirectUrl?: string;
}

interface AuthState {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthUser) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
  logout: (options?: LogoutOptions) => Promise<void>;

  // Helper methods
  isOnboardingComplete: () => boolean;
  hasRole: (role: AuthUser["role"]) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: user =>
        set({
          user,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        }),

      updateUser: async (updates: Partial<AuthUser>) => {
        try {
          set({ isLoading: true });
          const currentUser = get().user;

          if (!currentUser) {
            removeCookies(["user", "accessToken", "refreshToken"]);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            useAuthStore.persist.clearStorage();
            window.location.href = "/login";
            return;
          }

          const response = await UsersServices.updateUser(updates);

          console.log("response", response);

          set({
            user: response.data || null,
            error: null,
          });

          window.location.replace("/dashboard");
        } catch (error) {
          console.log("error", error);
        } finally {
          set({
            isLoading: false,
            error: null,
          });
        }
      },

      setLoading: loading =>
        set({
          isLoading: loading,
        }),

      setError: error =>
        set({
          error,
          isLoading: false,
        }),

      clear: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),

      logout: async ({ redirect = true, redirectUrl = "/" } = {}) => {
        try {
          set({ isLoading: true });

          await AuthServices.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          removeCookies(["user", "accessToken", "refreshToken"]);

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          useAuthStore.persist.clearStorage();

          if (redirect) {
            window.location.replace(redirectUrl);
          }
        }
      },

      isOnboardingComplete: () => {
        const user = get().user;
        return user ? user.onboarding === false : false;
      },

      hasRole: role => {
        const user = get().user;
        return user?.role === role;
      },

      isAdmin: () => {
        const user = get().user;
        return user?.role === "admin" || user?.role === "superadmin";
      },

      isSuperAdmin: () => {
        const user = get().user;
        return user?.role === "superadmin";
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

export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated && state.user?.is_active);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useUserRole = () => useAuthStore(state => state.user?.role);
export const useIsOnboardingComplete = () =>
  useAuthStore(state => state.isOnboardingComplete());
