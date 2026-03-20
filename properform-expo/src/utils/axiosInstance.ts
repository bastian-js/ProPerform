import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "https://api.properform.app",
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401) throw error;

    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (!refreshToken) throw new Error("SESSION EXPIRED");

    const { data } = await axios.post(
      "https://api.properform.app/auth/refresh",
      {
        refresh_token: refreshToken,
      },
    );

    await SecureStore.setItemAsync("access_token", data.access_token);

    error.config.headers.Authorization = `Bearer ${data.access_token}`;
    return axios(error.config);
  },
);
export default api;
