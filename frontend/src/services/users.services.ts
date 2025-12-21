import Axios from "@/axios/instance";

interface UpdateUserPayload {
  name?: string;
  mobile_no?: string;
  onboarding?: boolean;
  profession?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  language?: string;
  avatar_url?: string;
}

interface FetchUsersParams {
  page?: number;
  limit?: number;
  role?: "user" | "admin" | "superadmin";
  is_active?: boolean;
  search?: string;
}

export const UsersServices = {
  updateUser: async (payload: UpdateUserPayload) => {
    const response = await Axios.put("/users/me", payload);
    return response.data;
  },

  fetchUsers: async (params: FetchUsersParams) => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.role) searchParams.append("role", params.role);
    if (typeof params.is_active === "boolean") {
      searchParams.append("is_active", params.is_active.toString());
    }
    if (params.search) searchParams.append("search", params.search);

    const response = await Axios.get(`/users?${searchParams.toString()}`);
    return response.data;
  },
};
