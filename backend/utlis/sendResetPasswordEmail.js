import nodemailer from "nodemailer";

const sendResetPasswordEmail = async (email, resetUrl) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	await transporter.sendMail({
		from: `"E-Commerce Support" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "🔐 Reset Your Password",
		html: `
			<h2>Password Reset</h2>
			<p>You requested to reset your password.</p>
			<p>Click the link below (valid for 15 minutes):</p>
			<a href="${resetUrl}">${resetUrl}</a>
			<p>If this wasn’t you, ignore this email.</p>
		`,
	});
};

export default sendResetPasswordEmail;
