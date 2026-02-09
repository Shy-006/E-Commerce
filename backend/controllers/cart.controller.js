import Product from "../models/product.model.js";
import User from "../models/user.model.js";

/* ===================== GET CART ===================== */
export const getCartProducts = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("cartItems.product");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const cartItems = user.cartItems.map((item) => ({
			...item.product.toObject(),
			quantity: item.quantity,
		}));

		res.json(cartItems);
	} catch (error) {
		console.error("Error in getCartProducts:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/* ===================== ADD TO CART ===================== */
export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const userId = req.user._id;

		const user = await User.findOne({
			_id: userId,
			"cartItems.product": productId,
		});

		if (user) {
			await User.updateOne(
				{ _id: userId, "cartItems.product": productId },
				{ $inc: { "cartItems.$.quantity": 1 } }
			);
		} else {
			await User.updateOne(
				{ _id: userId },
				{ $push: { cartItems: { product: productId, quantity: 1 } } }
			);
		}

		const updatedUser = await User.findById(userId);
		res.json(updatedUser.cartItems);
	} catch (error) {
		console.error("Error in addToCart:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/* ===================== REMOVE FROM CART (FIXED) ===================== */
export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.params;
		const userId = req.user._id;

		await User.updateOne(
			{ _id: userId },
			{ $pull: { cartItems: { product: productId } } }
		);

		const updatedUser = await User.findById(userId);
		res.json(updatedUser.cartItems);
	} catch (error) {
		console.error("❌ Error in removeAllFromCart:", error);
		res.status(500).json({ message: "Server error" });
	}
};

/* ===================== UPDATE QUANTITY ===================== */
export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const userId = req.user._id;

		if (quantity <= 0) {
			await User.updateOne(
				{ _id: userId },
				{ $pull: { cartItems: { product: productId } } }
			);
		} else {
			await User.updateOne(
				{ _id: userId, "cartItems.product": productId },
				{ $set: { "cartItems.$.quantity": quantity } }
			);
		}

		const updatedUser = await User.findById(userId);
		res.json(updatedUser.cartItems);
	} catch (error) {
		console.error("Error in updateQuantity:", error);
		res.status(500).json({ message: "Server error" });
	}
};
