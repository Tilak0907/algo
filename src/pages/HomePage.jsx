// src/pages/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from '../components/NavBar';
import logo from "../assets/NEWLOGO.png";
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <NavBar />

      <div className="home-container">
        <h1 className="home-title">
          <img src={logo} alt="AlgoPilot Logo" className="home-logo" />
          AlgoPilot – Robot Path Finder
        </h1>

        <p className="home-subtitle">
          Visualize smart robot pathfinding with A*, BFS, and Dijkstra’s
        </p>

        <button className="home-button" onClick={() => navigate("/simulation")}>
          🚀 Start Simulation
        </button>
        <button className="home-button" onClick={() => navigate("/graph")}>
          📊 View Performance Graph
        </button>

        {/* App Overview */}
        <section className="home-section">
          <h2 className="section-title">📘 App Overview</h2>
          <p className="section-text">
            AlgoPilot is a powerful web app to simulate and visualize pathfinding algorithms like A*, Dijkstra, and BFS in a grid environment. Ideal for robotics and developers.
          </p>
        </section>

        {/* Key Features */}
<section className="home-section">
  <h2 className="section-title">✨ Key Features</h2>
  <div className="feature-list-container">
    <ul className="feature-list">
      <li>📍 Customizable grid size and terrain</li>
      <li>⚙️ Multiple algorithms: A*, Dijkstra, BFS</li>
      <li>🧠 Real-time path visualization</li>
      <li>📊 Save and analyze simulation results</li>
      <li>💡 Intuitive controls and clean UI</li>
    </ul>
  </div>
</section>



        {/* Credits */}
        <section className="home-section credits">
          <h2 className="section-title">📌 Credits</h2>
          <p className="section-text">
            Developed with ❤️ using React, Firebase & JavaScript.<br />
            MCA Mini Project | 2025
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 AlgoPilot. All rights reserved.</p>
        <p>Contact: algopilot@gmail.com</p>
      </footer>
    </div>
  );
};

export default HomePage;


