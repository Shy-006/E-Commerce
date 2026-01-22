import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const { resetPassword, loading } = useUserStore();

	const token = searchParams.get("token");

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!token) {
			return toast.error("Invalid reset link");
		}

		resetPassword(token, password, navigate);
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<form
				onSubmit={handleSubmit}
				className="bg-gray-800 p-6 rounded w-96"
			>
				<h2 className="text-xl mb-4">Reset Password</h2>

				<input
					type="password"
					placeholder="New password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-2 mb-4 bg-gray-700 rounded"
				/>

				<button
					disabled={loading}
					className="w-full bg-emerald-600 p-2 rounded disabled:opacity-50"
				>
					Reset Password
				</button>
			</form>
		</div>
	);
};

export default ResetPasswordPage;
