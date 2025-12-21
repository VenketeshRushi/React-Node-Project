import Axios from "@/axios/instance";

export const UsersServices = {
  fetchUsers: async (params: URLSearchParams) => {
    const response = await Axios.get(`/users?${params.toString()}`);
    return response.data;
  },
};
