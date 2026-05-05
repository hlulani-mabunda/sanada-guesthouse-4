import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleVerifyAccount = async () => {
    const targetEmail = email.trim();

    if (!targetEmail) {
      alert("Please enter your account email.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", { email: targetEmail });
      setResponseMessage(res?.data?.msg || "Reset link generated.");
      setResetUrl(res?.data?.resetUrl || "");
    } catch (err) {
      const msg = err?.response?.data?.msg || "Unable to verify account";
      setResponseMessage(msg);
      setResetUrl("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2>Forgot Password</h2>
        <p>Verify your account email to generate a password reset link.</p>

        <input
          placeholder="Account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleVerifyAccount} disabled={loading}>
          {loading ? "Verifying..." : "Verify Account"}
        </button>

        {responseMessage ? <p style={{ marginTop: 12 }}>{responseMessage}</p> : null}

        {resetUrl ? (
          <p style={{ marginTop: 8 }}>
            Reset link (also printed in backend terminal):{" "}
            <a href={resetUrl}>Open reset page</a>
          </p>
        ) : null}

        <p style={{ marginTop: 12 }}>
          Back to <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
