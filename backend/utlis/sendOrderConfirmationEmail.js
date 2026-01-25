import transporter from "./emailTransporter.js";

const sendOrderConfirmationEmail = async (email, order, userName) => {
	try {
		await transporter.sendMail({
			from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
			to: email,
			subject: `✅ Order Confirmed - ${order._id}`,
			html: `
				<h2>Order Placed Successfully 🎉</h2>
				<p>Hi ${userName},</p>
				<p>Your order has been placed.</p>
				<hr/>
				<p><b>Order ID:</b> ${order._id}</p>
				<p><b>Total Amount:</b> $${order.totalAmount}</p>
				<p><b>Payment Status:</b> Paid</p>
				<hr/>
				<p>Thank you for shopping with us ❤️</p>
			`,
		});
	} catch (err) {
		console.error("Order email failed:", err.message);
	}
};

export default sendOrderConfirmationEmail;
