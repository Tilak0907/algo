// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginPage.css";
import NavBar from "../components/NavBar";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ toggle
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || "/simulation";

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate(redirectTo);
    } catch (error) {
      toast.error("Login failed: " + error.message);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="login-container">
        <h2>Login</h2>

        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

      <div className="password-wrapper">
  <input
    className="login-input"
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <span
    className="password-toggle-icon"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "🙈" : "👁️"}
  </span>
</div>



        <button className="login-button" onClick={handleLogin}>
          Login
        </button>

        <p className="forgot-link" onClick={() => navigate("/signup")}>
          Don't have an account, then Sign Up
        </p>

        <p className="forgot-link" onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </p>

        <ToastContainer position="top-center" autoClose={3000} />
      </div>
       <footer className="home-footer">
        <p>© 2025 AlgoPilot. All rights reserved.</p>
        <p>Contact: algopilot@gmail.com</p>
      </footer>
    </div>
  );
};

export default LoginPage;
