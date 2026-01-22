import nodemailer from "nodemailer";

const sendLoginAlertEmail = async ({ email, browser, ip }) => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		await transporter.sendMail({
			from: `"E-Commerce Security" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: "🔐 New Login Detected",
			html: `
				<h2>New Login Alert</h2>
				<p>Your account was logged in successfully.</p>

				<hr/>
				<p><b>Browser:</b> ${browser}</p>
				<p><b>IP Address:</b> ${ip}</p>
				<p><b>Time:</b> ${new Date().toLocaleString()}</p>
				<hr/>

				<p>If this wasn’t you, please reset your password immediately.</p>
				<p><b>E-Commerce Security Team</b></p>
			`,
		});
	} catch (err) {
		console.error("Login alert email failed:", err.message);
	}
};

export default sendLoginAlertEmail;
