import api from "./api";

export const loginReq = async (password: string) => {
    const response = await api.post("/api/get-user", { login: password });
    return response.data;
};