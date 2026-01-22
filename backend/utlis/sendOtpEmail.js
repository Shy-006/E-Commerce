import nodemailer from "nodemailer";

const sendOtpEmail = async (email, otp) => {
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
