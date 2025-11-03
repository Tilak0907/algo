import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import NavBar from '../components/NavBar';

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👁️ Toggle state
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
      navigate("/login");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="signup-container">
        <h2>📝 Create Account</h2>
        
        <input
          className="signup-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input with eye icon */}
        <div className="password-wrapper">
          <input
            className="signup-input"
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

        <button className="signup-button" onClick={handleSignup}>
          Sign Up
        </button>

        <h4 className="login-link" onClick={() => navigate("/login")}>
          Already have an account? Log in
        </h4>
      </div>
       <footer className="home-footer">
        <p>© 2025 AlgoPilot. All rights reserved.</p>
        <p>Contact: algopilot@gmail.com</p>
      </footer>
    </div>
  );
};

export default SignupPage;
