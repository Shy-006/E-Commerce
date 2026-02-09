import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";

import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/LoadingSpinner";

import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();
	const { getCartItems } = useCartStore();

	/* ===================== AUTH CHECK ===================== */
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	/* ===================== LOAD CART ===================== */
	useEffect(() => {
		if (user) {
			getCartItems();
		}
	}, [user, getCartItems]);

	/* ===================== LOADING ===================== */
	if (checkingAuth) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute inset-0">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
				</div>
			</div>

			<div className="relative z-50 pt-20">
				<Navbar />

				<Routes>
					{/* PUBLIC */}
					<Route path="/" element={<HomePage />} />

					<Route
						path="/signup"
						element={!user ? <SignUpPage /> : <Navigate to="/" replace />}
					/>

					<Route
						path="/login"
						element={!user ? <LoginPage /> : <Navigate to="/" replace />}
					/>

					{/* ADMIN */}
					<Route
						path="/secret-dashboard"
						element={
							user?.role === "admin"
								? <AdminPage />
								: <Navigate to="/login" replace />
						}
					/>

					{/* SHOP */}
					<Route path="/category/:category" element={<CategoryPage />} />

					<Route
						path="/cart"
						element={user ? <CartPage /> : <Navigate to="/login" replace />}
					/>

					<Route
						path="/purchase-success"
						element={
							user ? <PurchaseSuccessPage /> : <Navigate to="/login" replace />
						}
					/>

					<Route
						path="/purchase-cancel"
						element={
							user ? <PurchaseCancelPage /> : <Navigate to="/login" replace />
						}
					/>
				</Routes>
			</div>

			<Toaster />
		</div>
	);
}

export default App;
