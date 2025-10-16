import { useState } from "react";
import { Logo } from "@/components/logo"

interface VerifyProps {
  email: string;
}

export default function Verify({ email }: VerifyProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleVerify = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: code.join(""),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Verification successful!");
      } else {
        setMessage(`❌ ${result.message || "Invalid code"}`);
      }
    } catch (error) {
      setMessage("❌ Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Verification code resent successfully!");
      } else {
        setMessage(`❌ ${result.message || "Failed to resend code"}`);
      }
    } catch (error) {
      setMessage("❌ Network error while resending code.");
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    alert("Change email functionality not implemented yet.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0D17] text-white px-4">
      {/* Header */}
      <div className="absolute top-6 left-8 flex items-center gap-2">
        <Logo size={36} />
        <h1 className="font-bold text-lg tracking-wide">STOCKWISE</h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md text-center mt-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Verification Code
        </h1>
        <p className="text-gray-400 mb-8">
          A verification code has been sent to your email:
          <br />
          <span className="text-white font-medium">({email})</span>
        </p>

        {/* Code Boxes */}
        <div className="flex justify-center gap-4 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-14 text-center text-2xl bg-transparent border border-gray-600 rounded-md focus:outline-none focus:border-blue-400"
            />
          ))}
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-blue-400 mb-6 hover:underline disabled:opacity-50"
        >
          {resending ? "Resending..." : "Resend"}
        </button>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 rounded-md font-semibold text-lg text-white mb-6 bg-gradient-to-r from-[#0070F3] to-[#0051C6] hover:opacity-90 transition-all"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {/* Feedback Message */}
        {message && (
          <p className="text-sm mt-2 text-gray-300">{message}</p>
        )}

        {/* Change Email */}
        <p className="text-gray-400 mt-4">
          Didn’t receive email?{" "}
          <button
            onClick={handleChangeEmail}
            className="text-blue-400 hover:underline"
          >
            Change Your Email
          </button>
        </p>
      </div>
    </div>
  );
}
