import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/api";
import { Field, Btn, Alert } from "../components/common/UI";
import { QrCode } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // ✅ FIXED IMPORT

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive a reset OTP"
    >
      {sent ? (
        <Alert
          type="success"
          message={`OTP sent to ${email}. Check your inbox.`}
        />
      ) : (
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {error && <Alert type="error" message={error} />}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
          <Btn type="submit" fullWidth loading={loading}>
            Send OTP
          </Btn>
        </form>
      )}

      {sent && (
        <div style={{ marginTop: "16px" }}>
          <Link
            to="/reset-password"
            style={{ color: "var(--accent)", fontSize: "14px" }}
          >
            Enter OTP & reset password →
          </Link>
        </div>
      )}

      <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--text3)" }}>
        <Link to="/login" style={{ color: "var(--text2)" }}>
          ← Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await resetPassword(form);
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter the OTP from your email">
      <form
        onSubmit={submit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {error && <Alert type="error" message={error} />}

        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handle}
          required
        />
        <Field
          label="OTP Code"
          name="otp"
          value={form.otp}
          onChange={handle}
          placeholder="6-digit code"
          required
        />
        <Field
          label="New Password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handle}
          required
        />

        <Btn type="submit" fullWidth loading={loading}>
          Reset Password
        </Btn>
      </form>
    </AuthLayout>
  );
}

// ============================
// CHANGE PASSWORD COMPONENT
// ============================

export function ChangePassword() {
  const navigate = useNavigate();
  const { role } = useAuth(); // ✅ now properly defined

  const [form, setForm] = useState({
    newPassword: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      const { changeEmployeePassword } = await import("../services/api");

      await changeEmployeePassword({
        newPassword: form.newPassword,
      });

      toast.success("Password changed!");

      navigate(role === "kitchen" ? "/kitchen" : "/cashier");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Change Password"
      subtitle="You must change your password before continuing"
    >
      <Alert
        type="warning"
        message="This is your first login. Please set a new password."
      />

      <form
        onSubmit={submit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        {error && <Alert type="error" message={error} />}

        <Field
          label="New Password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handle}
          required
        />

        <Field
          label="Confirm Password"
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={handle}
          required
        />

        <Btn type="submit" fullWidth loading={loading}>
          Set Password
        </Btn>
      </form>
    </AuthLayout>
  );
}

// ============================
// AUTH LAYOUT
// ============================

function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              background: "var(--accent)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <QrCode size={24} color="#fff" />
          </div>

          <h1 style={{ fontSize: "22px", marginBottom: "4px" }}>{title}</h1>

          <p style={{ color: "var(--text3)", fontSize: "13px" }}>{subtitle}</p>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: "12px",
            padding: "28px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
