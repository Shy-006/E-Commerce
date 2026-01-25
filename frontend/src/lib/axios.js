import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.NODE_ENV === "development"
		?  "/api"
      : `${import.meta.env.VITE_BACKEND_LINK}/api`,
  withCredentials: true,
});

export default axiosInstance;
