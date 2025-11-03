// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

import HomePage from "./pages/HomePage";
import SimulationPage from "./pages/SimulationPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import GraphPage from "./pages/GraphPage";
import MazePage from "./pages/MazePage";
import NavBar from "./components/NavBar"; // (import stays if you use it elsewhere)
import AboutPage from "./pages/AboutPage";
import SavedPathsPage from "./pages/SavedPathsPage";

const App = () => {
  // Auto-logout when the tab/window is closed or refreshed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Best-effort sign out; browser may not wait for the promise
      signOut(auth).catch(() => {
        // ignore errors; unload is happening
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/mazepage" element={<MazePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/saved-paths" element={<SavedPathsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
