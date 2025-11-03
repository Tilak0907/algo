import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

const GraphPage = () => {
  const [allResults, setAllResults] = useState([]);
  const [pathNames, setPathNames] = useState([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true); // 👈 modal visible on load

  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/login", { state: { redirectTo: "/graph" } });
        return;
      }

      const q = query(collection(db, "simulationResults"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const results = [];

      snapshot.forEach((doc) => {
        const d = doc.data();
        results.push({
          pathName: d.name || "Unnamed Path",
          algorithm: d.algorithm,
          pathLength: d.pathLength,
          timeTaken: d.timeTaken,
          createdAt: d.createdAt || "",
        });
      });

      setAllResults(results);

      const uniquePathNames = [...new Set(results.map((r) => r.pathName))];
      setPathNames(uniquePathNames);
      if (uniquePathNames.length > 0) setSelectedPath(uniquePathNames[0]);

      setLoading(false);
    };

    fetchResults();
  }, [navigate]);

  useEffect(() => {
    const dataForPath = allResults.filter((r) => r.pathName === selectedPath);
    setFilteredData(dataForPath);
  }, [selectedPath, allResults]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #0f0f2f, #1a1a40)",
        color: "#fff",
        position: "relative",
      }}
    >
      <NavBar />

      {/* 💬 Modal for Info Message */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#1e1e3a",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
            }}
          >
            <h2 style={{ color: "#ffcc00", marginBottom: "15px" }}>💡 Quick Tip</h2>
            <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#ccc" }}>
              Try saving multiple simulation results with the{" "}
              <strong style={{ color: "#fff" }}>same path name</strong> to view a
              comparison between them.
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#0072ff",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* 📊 Main Graph Section */}
      <div
        style={{
          padding: "100px 20px 20px",
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>📈 Simulation Comparison</h2>

        {pathNames.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <label htmlFor="pathSelect" style={{ fontSize: "16px" }}>
              Select Path:
            </label>
            <select
              id="pathSelect"
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "#1e1e2f",
                color: "#fff",
                border: "1px solid #444",
                minWidth: "160px",
              }}
            >
              {pathNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {filteredData.length === 0 ? (
          <p style={{ marginTop: 20 }}>No results found for the selected path.</p>
        ) : (
          <div style={{ width: "100%", maxWidth: "1000px", height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <XAxis dataKey="algorithm" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />
                <Bar dataKey="pathLength" fill="#8884d8" name="Path Length" />
                <Bar dataKey="timeTaken" fill="#82ca9d" name="Time Taken (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <footer className="home-footer">
        <p>© 2025 AlgoPilot. All rights reserved.</p>
        <p>Contact: algopilot@gmail.com</p>
      </footer>
    </div>
  );
};

export default GraphPage;
