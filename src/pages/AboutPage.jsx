import React from "react";
import "./AboutPage.css";
import NavBar from '../components/NavBar';
import logo from "../assets/NEWLOGO.png";

const AboutPage = () => {
  return (
    <div>
      <NavBar/>
    <div className="about-container">
      <h1><img src={logo} alt="AlgoPilot Logo" className="logo" />About AlgoPilot</h1>

      <p className="about-description">
        AlgoPilot is a web-based robot pathfinding simulator built using React, Firebase, and Recharts.
        It demonstrates real-time visualization of BFS, Dijkstra, and A* algorithms on a customizable grid.
        Users can simulate paths, compare performance, and save results.
      </p>

      <div className="developer-section">
        <h3>👨‍💻 Developed by:</h3>
        <ul>
          <li>Tilakaraaj Dhanaraj</li>
          <li>Haareez Ahmed A</li>
        </ul>
      </div>

      <footer className="about-footer">
        <p>© 2025 AlgoPilot. All rights reserved.</p>
        <p>Contact: algopilot@gmail.com</p>
      </footer>
    </div>
    </div>
  );
};

export default AboutPage;
