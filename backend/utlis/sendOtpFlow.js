import bcrypt from "bcryptjs";
import generateOtp from "./generateOtp.js";
import sendOtpEmail from "./sendOtpEmail.js";

const sendOtpFlow = async (user) => {
	const otp = generateOtp();
	const hashedOtp = await bcrypt.hash(otp, 10);

	user.otp = hashedOtp;
	user.otpExpiry = Date.now() + 5 * 60 * 1000;
	await user.save();

	await sendOtpEmail(user.email, otp);
};

export default sendOtpFlow;
