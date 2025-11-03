import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent. Check your inbox.");
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  };

return (
  <div style={styles.pageWrapper}>
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>🔑 Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleReset} style={styles.resetButton}>
          Send Reset Link
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <button onClick={() => navigate("/login")} style={styles.backLink}>
          🔙 Back to Login
        </button>
      </div>
    </div>

    {/* Footer stays at bottom */}
    <footer style={styles.footer}>
      <p>© 2025 AlgoPilot. All rights reserved.</p>
      <p>Contact: algopilot@gmail.com</p>
    </footer>
  </div>
);

};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#202040",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
    textAlign: "center",
    color: "#ffffff",
  },

  heading: {
    marginBottom: "20px",
    color: "#ffcc00",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #444",
    backgroundColor: "#1e1e2e",
    color: "#fff",
    fontSize: "16px",
    marginBottom: "15px",
  },

  resetButton: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },

  message: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#ffcc00",
  },

  backLink: {
    marginTop: "15px",
    background: "none",
    border: "none",
    color: "#66b2ff",
    textDecoration: "none",
    fontSize: "14px",
    cursor: "pointer",
  },

  footer: {
    textAlign: "center",
    padding: "15px 0",
    color: "#aaa",
    fontSize: "14px",
    borderTop: "1px solid #333"
  },
};


export default ForgotPasswordPage;
