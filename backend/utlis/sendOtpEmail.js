import transporter from "./emailTransporter.js";

const sendOtpEmail = async (email, otp) => {
	await transporter.sendMail({
		from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
		to: email,
		subject: "Your Login OTP",
		html: `
			<h2>Email Verification</h2>
			<p>Your OTP is:</p>
			<h1>${otp}</h1>
			<p>Valid for 5 minutes</p>
		`,
	});
};

export default sendOtpEmail;
