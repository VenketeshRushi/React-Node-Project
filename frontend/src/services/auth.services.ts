import Axios from "@/axios/instance";

export const AuthServices = {
  googleCallback: async (payload: { code: string; codeVerifier: string }) => {
    const response = await Axios.post("/auth/google/callback", payload);
    return response.data;
  },

  logout: () => {
    return Axios.post("/auth/logout").catch(() => {});
  },
};
