import { useState } from "react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		await axios.post("/auth/forgot-password", { email });
		toast.success("If account exists, reset email sent");
	};

	return (
		<form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
			<h2 className="text-xl mb-4">Forgot Password</h2>
			<input
				type="email"
				placeholder="Enter your email"
				required
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="w-full p-2 mb-4 bg-gray-700"
			/>
			<button className="w-full bg-emerald-600 p-2 rounded">
				Send Reset Link
			</button>
		</form>
	);
};

export default ForgotPasswordPage;
