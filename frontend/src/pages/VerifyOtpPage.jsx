import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const { verifyOtp, pendingEmail, loading } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!pendingEmail) navigate("/login");
  }, [pendingEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return toast.error("OTP must be 6 digits");
    }

    await verifyOtp(pendingEmail, otp);
  };

  return (
    <div className="flex flex-col items-center py-20">
      <h2 className="text-3xl text-emerald-400">Verify OTP</h2>
      <p className="mt-2 text-gray-400">{pendingEmail}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          maxLength={6}
          className="p-2 text-center bg-gray-700 rounded"
          placeholder="Enter OTP"
        />

        <button className="bg-emerald-600 p-2 rounded w-full">
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
