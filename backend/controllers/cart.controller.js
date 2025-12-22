import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
	try {
		const user = req.user;

		const productIds = user.cartItems.map((item) => item.product);

		const products = await Product.find({ _id: { $in: productIds } });

		const cartItems = products.map((product) => {
			const cartItem = user.cartItems.find(
				(item) => item.product.toString() === product._id.toString()
			);

			return {
				...product.toObject(),
				quantity: cartItem.quantity,
			};
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find(
			(item) => item.product.toString() === productId
		);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push({
				product: productId,
				quantity: 1,
			});
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		if (!productId) {
			user.cartItems = [];
		} else {
			user.cartItems = user.cartItems.filter(
				(item) => item.product.toString() !== productId
			);
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in removeAllFromCart controller", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find(
			(item) => item.product.toString() === productId
		);

		if (!existingItem) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (quantity === 0) {
			user.cartItems = user.cartItems.filter(
				(item) => item.product.toString() !== productId
			);
		} else {
			existingItem.quantity = quantity;
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in updateQuantity controller", error);
		res.status(500).json({ message: "Server error" });
	}
};
