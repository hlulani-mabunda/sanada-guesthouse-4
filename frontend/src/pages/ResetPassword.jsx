import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.put(`/auth/reset-password/${token}`, { password });
      alert(res?.data?.msg || "Password reset successful");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.msg || "Unable to reset password";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={handleResetPassword} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p style={{ marginTop: 12 }}>
          Back to <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
