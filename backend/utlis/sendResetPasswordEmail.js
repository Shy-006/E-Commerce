import transporter from "./emailTransporter.js";

const sendResetPasswordEmail = async (email, resetUrl) => {
	await transporter.sendMail({
		from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
		to: email,
		subject: "🔐 Reset Your Password",
		html: `
			<h2>Password Reset</h2>
			<p>Click the link below (valid for 15 minutes):</p>
			<a href="${resetUrl}">${resetUrl}</a>
			<p>If this wasn’t you, ignore this email.</p>
		`,
	});
};

export default sendResetPasswordEmail;
