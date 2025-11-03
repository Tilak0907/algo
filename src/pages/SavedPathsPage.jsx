// src/pages/SavedPathsPage.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./SimulationGrid.css";
import NavBar from "../components/NavBar";

const SavedPathsPage = () => {
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login", { state: { redirectTo: "/saved-paths" } });
        return;
      }

      const q = query(collection(db, "simulationResults"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const userPaths = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPaths(userPaths);
    });

    return () => unsubscribe();
  }, [navigate]);

  const createEmptyGrid = (size, type = "Square") => {
    if (type === "Square") {
      return Array(size)
        .fill()
        .map(() => Array(size).fill("empty"));
    }

    if (type === "Triangle") {
      const grid = [];
      for (let r = 0; r < size; r++) grid.push(Array(r + 1).fill("empty"));
      return grid;
    }

    if (type === "Hexagonal") {
      const grid = [];
      const mid = Math.floor(size / 2);
      for (let r = 0; r < size; r++) {
        const cols = r <= mid ? mid + r + 1 : size + mid - r;
        grid.push(Array(cols).fill("empty"));
      }
      return grid;
    }

    return [];
  };

  const renderPathOnGrid = (pathData) => {
    const size = pathData.gridSize || 20;
    const type = pathData.gridType || "Square";
    const path = pathData.path || [];
    const newGrid = createEmptyGrid(size, type);

    path.forEach(({ row, col }) => {
      if (newGrid[row] && newGrid[row][col] !== undefined) newGrid[row][col] = "path";
    });

    if (path.length > 0 && newGrid[path[0]?.row]?.[path[0]?.col] !== undefined) {
      newGrid[path[0].row][path[0].col] = "start";
      const last = path[path.length - 1];
      newGrid[last.row][last.col] = "end";
    }

    setGridSize(size);
    setGrid(newGrid);
  };

  const handlePathSelect = (id) => {
    const found = paths.find((p) => p.id === id);
    setSelectedPath(found);
    renderPathOnGrid(found);
  };

  const getCellIcon = (cell) => {
    switch (cell) {
      case "start":
        return "🟢";
      case "end":
        return "🔴";
      case "path":
        return "🟡";
      default:
        return "⬜";
    }
  };

  return (
    <div>
      <NavBar />
      <div className="simulation-container">
        <h2>📁 Saved Paths</h2>

        <label className="dropdown-label">
          Select Path:
          <select onChange={(e) => handlePathSelect(e.target.value)} defaultValue="">
            <option value="" disabled>
              Choose a path
            </option>
            {paths.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.algorithm})
              </option>
            ))}
          </select>
        </label>

        {selectedPath && (
          <div className="result-section">
            <h3>Path Details</h3>
            <p><strong>Name:</strong> {selectedPath.name}</p>
            <p><strong>Algorithm:</strong> {selectedPath.algorithm}</p>
            <p><strong>Grid Size:</strong> {selectedPath.gridSize}</p>
            <p><strong>Grid Type:</strong> {selectedPath.gridType || "Square"}</p>
            <p><strong>Path Length:</strong> {selectedPath.pathLength}</p>
            <p><strong>Total Cost:</strong> ₹{selectedPath.totalCost ?? 0}</p>
          </div>
        )}

        {/* ✅ FIXED GRID DISPLAY */}
        {grid.length > 0 && (
          <div className="grid-wrapper">
            <h3>🧩 {selectedPath?.gridType || "Square"} Grid Model</h3>

            <div
              className={`grid-display ${
                selectedPath?.gridType?.toLowerCase() || "square"
              }-display`}
            >
              {grid.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid-row ${
                    selectedPath?.gridType === "Triangle"
                      ? "triangle-row"
                      : selectedPath?.gridType === "Hexagonal"
                      ? "hex-row"
                      : ""
                  }`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${row.length}, 30px)`,
                    justifyContent: "center",
                    gap: "2px",
                  }}
                >
                  {row.map((cell, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} className={`cell ${cell}`}>
                      {getCellIcon(cell)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
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

export default SavedPathsPage;
