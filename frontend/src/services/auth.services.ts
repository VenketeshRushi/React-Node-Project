import Axios from "@/axios/instance";

export const AuthServices = {
  googlePkceInit: (payload: any) => {
    return Axios.post("/auth/google/pkce/init", payload);
  },
  googleCallback: (payload: any) => {
    return Axios.post("/auth/google/callback", payload);
  },
};
