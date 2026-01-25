import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.BREVO_SMTP_HOST,
	port: process.env.BREVO_SMTP_PORT,
	secure: false, // TLS
	auth: {
		user: process.env.BREVO_SMTP_USER,
		pass: process.env.BREVO_SMTP_PASS,
	},
});

export default transporter;
