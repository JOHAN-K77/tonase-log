import axios from "axios";

export const loginReq = async (password: string) => {
    const response = await axios.post("/api/get-user", { login: password });
    return response.data;
};