// src/components/UserStatus.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./UserStatus.css";

const UserStatus = () => {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user ? user.email : null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!userEmail) return null;

  return (
    <div className="user-status-content">
      <span className="user-email">👤 {userEmail}</span>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserStatus;
