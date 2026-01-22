import nodemailer from "nodemailer";

const sendOrderConfirmationEmail = async (email, order, userName) => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		await transporter.sendMail({
			from: `"E-Commerce" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: `✅ Order Confirmed - ${order._id}`,
			html: `
				<h2>Order Placed Successfully 🎉</h2>
				<p>Hi ${userName},</p>

				<p>Your order has been successfully placed.</p>

				<hr/>
				<p><b>Order ID:</b> ${order._id}</p>
				<p><b>Total Amount:</b> $${order.totalAmount}</p>
				<p><b>Payment Status:</b> Paid</p>
				<hr/>

				<p>Thank you for shopping with us ❤️</p>
				<p><b>E-Commerce Team</b></p>
			`,
		});

		console.log("✅ Order confirmation email sent");
	} catch (error) {
		console.error("❌ Failed to send order confirmation email:", error.message);
	}
};

export default sendOrderConfirmationEmail;
