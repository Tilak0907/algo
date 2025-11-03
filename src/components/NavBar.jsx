// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import "./NavBar.css";
import logo from "../assets/NEWLOGO.png";
import UserStatus from "../components/UserStatus";
import { FaUserCircle } from "react-icons/fa";


const NavBar = () => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserPanel = () => setUserPanelOpen(!userPanelOpen);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const links = [
    { path: "/", label: "Home" },
    { path: "/simulation", label: "Simulation" },
    { path: "/graph", label: "Graph" },
    { path: "/mazepage", label: "Maze" },
    { path: "/saved-paths", label: "Saved Paths" },
    { path: "/about", label: "About" },
    { path: "/login", label: "Login" },
  ];

  const filteredLinks = links.filter(link => {
    if ((pathname === "/login" || pathname === "/signup") && link.path === "/login") {
      return false;
    }
    return true;
  });

  return (
    <>
      <nav className="nav-container">
        <div className="nav-content">

          {/* Mobile Layout */}
          <div className="nav-mobile-row">
            <div className="nav-mobile-left">
              <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={toggleMenu}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </div>

            <div className="nav-mobile-center">
              <div className="nav-title">
                <img src={logo} alt="AlgoPilot Logo" className="nav-logo" />
                AlgoPilot
              </div>
            </div>

            <div className="nav-mobile-right">
              {isLoggedIn ? (
                <button className="user-toggle-btn" onClick={toggleUserPanel}>👤</button>
              ) : (
                <Link to="/login" className="user-toggle-btn" title="Login">👤</Link>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="nav-desktop-row">
            <div className="nav-left">
              <div className="nav-title">
                <img src={logo} alt="AlgoPilot Logo" className="nav-logo" />
                AlgoPilot
              </div>
            </div>

            <div className="nav-links">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="nav-right">
              {isLoggedIn ? (
                <button className="user-toggle-btn" onClick={toggleUserPanel}>
  <FaUserCircle size={24}  />
</button>

              ) : (
                <Link to="/login" className="user-toggle-btn" title="Login">
                   <FaUserCircle size={24} />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Nav Links */}
          <div className={`nav-links mobile-only ${menuOpen ? "active" : ""}`}>
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {isLoggedIn && (
        <div className={`user-slide-panel ${userPanelOpen ? "open" : ""}`}>
          <button className="close-btn" onClick={toggleUserPanel}>Close</button>
          <UserStatus />
        </div>
      )}
    </>
  );
};

export default NavBar;
