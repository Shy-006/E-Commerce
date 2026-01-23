import transporter from "./emailTransporter.js";

const sendLoginAlertEmail = async ({ email, browser, ip }) => {
	try {
		await transporter.sendMail({
			from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
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
				<p>If this wasn’t you, reset your password immediately.</p>
				<p><b>E-Commerce Security Team</b></p>
			`,
		});
	} catch (err) {
		console.error("Login alert email failed:", err.message);
	}
};

export default sendLoginAlertEmail;
