import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	/* ===================== SIGNUP ===================== */
	signup: async ({ name, email, password }) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/signup", {
				name,
				email,
				password,
			});

			set({
				loading: false,
				user: res.data.user,
			});

			toast.success("Signup successful");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Signup failed");
			return false;
		}
	},

	/* ===================== LOGIN ===================== */
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({
				user: res.data,
				loading: false,
			});

			toast.success("Login successful");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Login failed");
			return false;
		}
	},

	/* ===================== GOOGLE LOGIN ===================== */
	googleLogin: async (token) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/google", { token });

			set({
				user: res.data,
				loading: false,
			});

			toast.success("Login successful");
			return true;
		} catch (error) {
			set({ loading: false });
			toast.error("Google login failed");
			return false;
		}
	},

	/* ===================== LOGOUT ===================== */
	logout: async () => {
		try {
			await axios.post("/auth/logout");
		} catch {
			// ignore
		}

		set({
			user: null,
		});
	},

	/* ===================== CHECK AUTH ===================== */
	checkAuth: async () => {
		set({ checkingAuth: true });

		try {
			const res = await axios.get("/auth/profile");
			set({ user: res.data, checkingAuth: false });
		} catch {
			set({ user: null, checkingAuth: false });
		}
	},

	/* ===================== REFRESH TOKEN ===================== */
	refreshToken: async () => {
		const { checkingAuth } = get();
		if (checkingAuth) return;

		set({ checkingAuth: true });

		try {
			await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
		} catch {
			set({
				user: null,
				checkingAuth: false,
			});
			throw new Error("Refresh failed");
		}
	},
}));

/* ===================== AXIOS INTERCEPTOR ===================== */
let refreshPromise = null;

axios.interceptors.response.use(
	(res) => res,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch {
				useUserStore.getState().logout();
			}
		}

		return Promise.reject(error);
	}
);
