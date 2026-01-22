import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	
	user: null,
	loading: false,
	checkingAuth: true,

	// 🔐 OTP STATE
	otpPending: false,
	pendingEmail: null,

	
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
			otpPending: true,
			pendingEmail: res.data.email,
			user: null,
		});

		toast.success("OTP sent to your email");
	} catch (error) {
		set({ loading: false });
		toast.error(error.response?.data?.message || "Signup failed");
	}
},


	
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({
				user: res.data,
				loading: false,
				otpPending: false,
				pendingEmail: null,
			});

			toast.success("Login successful");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Login failed");
		}
	},

	
	googleLogin: async (token) => {
	set({ loading: true });

	try {
		const res = await axios.post("/auth/google", { token });

		set({
			user: res.data,
			loading: false,
			otpPending: false,
			pendingEmail: null,
		});

		toast.success("Login successful");
	} catch (error) {
		set({ loading: false });
		toast.error("Google login failed");
	}
},

	
	verifyOtp: async (email, otp) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/verify-otp", { email, otp });

			set({
				user: res.data.user,
				otpPending: false,
				pendingEmail: null,
				loading: false,
			});

			toast.success("Verification successful");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response?.data?.message || "Invalid OTP");
		}
	},

	resetPassword: async (token, password, navigate) => {
	set({ loading: true });

	try {
		await axios.post("/auth/reset-password", {
			token,
			password,
		});

		set({ loading: false });
		toast.success("Password reset successful");
		navigate("/login");
	} catch (error) {
		set({ loading: false });
		toast.error(error.response?.data?.message || "Reset failed");
	}
},


	
	logout: async () => {
		try {
			await axios.post("/auth/logout");
		} catch {
			
		}

		set({
			user: null,
			otpPending: false,
			pendingEmail: null,
		});
	},

	
	checkAuth: async () => {
		const { otpPending } = get();
		if (otpPending) {
			set({ checkingAuth: false });
			return;
		}

		set({ checkingAuth: true });

		try {
			const res = await axios.get("/auth/profile");
			set({ user: res.data, checkingAuth: false });
		} catch {
			set({ user: null, checkingAuth: false });
		}
	},

	
	refreshToken: async () => {
		const { checkingAuth, otpPending } = get();
		if (checkingAuth || otpPending) return;

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

let refreshPromise = null;

axios.interceptors.response.use(
	(res) => res,
	async (error) => {
		const originalRequest = error.config;
		const { otpPending } = useUserStore.getState();

		
		if (otpPending) {
			return Promise.reject(error);
		}

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
