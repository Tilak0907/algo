import React, { useState, useEffect } from "react";
import './MazeGrid.css';
import NavBar from "../components/NavBar";

const MazePage = () => {
  const [gridSize, setGridSize] = useState(20);
  const [grid, setGrid] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [mode, setMode] = useState("wall");
  const [algorithm, setAlgorithm] = useState("BFS");
  const [obstacleType, setObstacleType] = useState("wall");
  const [score, setScore] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // NEW: details about how the answer was discovered
  const [resultDetails, setResultDetails] = useState(null);

  const terrainCost = {
    empty: 1, wall: 10, mud: 5, car: 15, human: 20,
  };

  const createGrid = (size) =>
    Array.from({ length: size }, () => Array(size).fill("empty"));

  const applyMaze = (grid) => {
    const newGrid = grid.map((row) => [...row]);
    for (let r = 0; r < gridSize; r++) {
      newGrid[r][0] = newGrid[r][gridSize - 1] = "wall";
    }
    for (let c = 0; c < gridSize; c++) {
      newGrid[0][c] = newGrid[gridSize - 1][c] = "wall";
    }
    return newGrid;
  };

  const placeObstacles = (grid, start, end) => {
    const chance = 0.2;
    const newGrid = grid.map((row, r) =>
      row.map((cell, c) => {
        if (
          cell === "empty" &&
          !(r === start.row && c === start.col) &&
          !(r === end.row && c === end.col) &&
          Math.random() < chance
        ) {
          return obstacleType;
        }
        return cell;
      })
    );
    newGrid[start.row][start.col] = "start";
    newGrid[end.row][end.col] = "end";
    return newGrid;
  };

  useEffect(() => {
    const defaultGrid = createGrid(gridSize);
    const defaultStart = { row: 1, col: 1 };
    const defaultEnd = { row: gridSize - 2, col: gridSize - 2 };
    let mazeGrid = applyMaze(defaultGrid);
    let finalGrid = placeObstacles(mazeGrid, defaultStart, defaultEnd);
    setGrid(finalGrid);
    setStart(defaultStart);
    setEnd(defaultEnd);
    setResultDetails(null);
    setScore(null);
  }, [gridSize, obstacleType]);

  const handleCellClick = (row, col) => {
    const newGrid = grid.map((r) => [...r]);
    if (mode === "start") {
      if (start) newGrid[start.row][start.col] = "empty";
      newGrid[row][col] = "start";
      setStart({ row, col });
    } else if (mode === "end") {
      if (end) newGrid[end.row][end.col] = "empty";
      newGrid[row][col] = "end";
      setEnd({ row, col });
    } else {
      newGrid[row][col] = newGrid[row][col] === mode ? "empty" : mode;
    }
    setGrid(newGrid);
    setResultDetails(null);
    setScore(null);
  };

  const runPathfinding = () => {
    if (!start || !end) return alert("Place both start and end points.");

    const t0 = performance.now();

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const key = (p) => `${p.row},${p.col}`;
    const parent = {};
    const visited = new Set();
    const visitedOrder = []; // record the order nodes are expanded
    const gScore = { [key(start)]: 0 };
    const path = [];

    const heuristic = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    let pq = [[0, start]];
    if (algorithm === "BFS") pq = [start];

    let found = false;

    while (pq.length) {
      let current;
      if (algorithm === "BFS") {
        current = pq.shift();
      } else {
        pq.sort((a, b) => a[0] - b[0]);
        current = pq.shift()[1];
      }

      const currentKey = key(current);
      if (visited.has(currentKey)) continue;
      visited.add(currentKey);
      visitedOrder.push({ row: current.row, col: current.col });

      if (current.row === end.row && current.col === end.col) {
        // reconstruct path
        let node = currentKey;
        while (node !== key(start)) {
          const [r, c] = node.split(",").map(Number);
          path.unshift({ row: r, col: c });
          node = parent[node];
        }
        // include the start
        path.unshift({ row: start.row, col: start.col });
        found = true;
        break;
      }

      for (let [dr, dc] of directions) {
        const nr = current.row + dr, nc = current.col + dc;
        if (nr < 0 || nc < 0 || nr >= gridSize || nc >= gridSize) continue;

        const terrain = grid[nr][nc];
        if (terrain === "wall") continue; // treat walls as impassable here

        const neighbor = { row: nr, col: nc };
        const nKey = key(neighbor);

        const moveCost = terrainCost[terrain] ?? 1;
        const tentative = (gScore[currentKey] ?? Infinity) + moveCost;

        if (tentative < (gScore[nKey] ?? Infinity)) {
          gScore[nKey] = tentative;
          parent[nKey] = currentKey;

          if (algorithm === "BFS") {
            pq.push(neighbor);
          } else {
            const priority =
              algorithm === "A*"
                ? tentative + heuristic(neighbor, end)
                : tentative; // Dijkstra
            pq.push([priority, neighbor]);
          }
        }
      }
    }

    const t1 = performance.now();

    if (!found || !path.length) {
      alert("No path found.");
      setScore(0);
      setResultDetails({
        algorithm,
        timeTakenMs: Math.round(t1 - t0),
        visitedCount: visitedOrder.length,
        pathLength: 0,
        totalCost: 0,
        pathSteps: [],
        visitedOrder: visitedOrder,
        note: "No path could be found with the current settings."
      });
      return;
    }

    // Build a list of step costs for the path (skip the first cell's cost if you prefer 0 for start)
    const pathSteps = path.map((pos, idx) => {
      const terrain = grid[pos.row][pos.col];
      const cost = idx === 0 ? 0 : (terrainCost[terrain] ?? 1);
      return { ...pos, terrain, cost };
    });

    const totalCost = pathSteps.reduce((sum, step) => sum + step.cost, 0);
    const pathLength = path.length;

    const scoreValue = Math.max(100 - totalCost, 10);
    setScore(scoreValue);

    // Paint path on grid (preserve start & end)
    const painted = grid.map((r) => [...r]);
    for (let i = 0; i < path.length; i++) {
      const { row, col } = path[i];
      const isStart = row === start.row && col === start.col;
      const isEnd = row === end.row && col === end.col;
      if (!isStart && !isEnd) painted[row][col] = "path";
    }
    setGrid(painted);

    setResultDetails({
      algorithm,
      timeTakenMs: Math.round(t1 - t0),
      visitedCount: visitedOrder.length,
      pathLength,
      totalCost,
      pathSteps,
      visitedOrder
    });
  };

  const getCellIcon = (cell) => {
    switch (cell) {
      case "start": return "🟢";
      case "end": return "🔴";
      case "wall": return "⬛";
      case "mud": return "🟫";
      case "car": return "🚗";
      case "human": return "🧍";
      case "path": return "🟡";
      default: return "⬜";
    }
  };

  return (
    <div>
      <NavBar />
      <div className="maze-container">
        <h2>🧩 Maze Game</h2>
        <p> ! The Maze game is just for fun purpose ! </p>

        <div className="control-row">
          <label>
            Obstacle Type:
            <select value={obstacleType} onChange={(e) => setObstacleType(e.target.value)}>
              <option value="wall">Wall</option>
              <option value="mud">Mud</option>
              <option value="car">Car</option>
              <option value="human">Human</option>
            </select>
          </label>

          <label>
            Algorithm:
            <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
              <option value="BFS">BFS</option>
              <option value="Dijkstra">Dijkstra</option>
              <option value="A*">A*</option>
            </select>
          </label>
        </div>

        <div className="button-menu-toggle">
          <button onClick={() => setShowMenu(!showMenu)}>
            {showMenu ? "Hide Menu" : "Show Menu"}
          </button>
        </div>

        {showMenu && (
          <>
            <div className="mode-buttons">
              <h4>Mode:</h4>
              <button onClick={() => setMode("start")}>Start</button>
              <button onClick={() => setMode("end")}>End</button>
              <button onClick={() => setMode("wall")}>Wall</button>
              <button onClick={() => setMode("mud")}>Mud</button>
              <button onClick={() => setMode("car")}>Car</button>
              <button onClick={() => setMode("human")}>Human</button>
            </div>

            <div className="action-buttons">
              <button onClick={runPathfinding}>Run Algorithm</button>
              <button onClick={() => window.location.reload()}>Reset Grid</button>
            </div>
          </>
        )}

        <div className="grid-scroll-wrapper">
          <div
            className="grid-container"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 30px)` }}
          >
            {grid.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  className={`cell ${cell}`}
                >
                  {getCellIcon(cell)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Score box (your original) */}
        {score !== null && (
          <div className="maze-result-box">
            <h3>🎯 Score: {score}</h3>
          </div>
        )}

        {/* NEW: Discovery details */}
        {resultDetails && (
          <div className="maze-result-box" style={{ textAlign: "left", maxWidth: 800 }}>
            <h3 style={{ textAlign: "center", marginTop: 0 }}>📊 How the Result Was Discovered</h3>
            <p><strong>Algorithm:</strong> {resultDetails.algorithm}</p>
            <p><strong>Path Length:</strong> {resultDetails.pathLength}</p>
            <p><strong>Total Cost:</strong> {resultDetails.totalCost}</p>
            <p><strong>Visited Nodes:</strong> {resultDetails.visitedCount}</p>
            <p><strong>Time Taken:</strong> {resultDetails.timeTakenMs} ms</p>
            {resultDetails.note && <p><em>{resultDetails.note}</em></p>}

            {resultDetails.pathSteps?.length > 0 && (
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer" }}>🔍 Show path steps (terrain + cost)</summary>
                <ul style={{ marginTop: 10 }}>
                  {resultDetails.pathSteps.map((step, i) => (
                    <li key={i}>
                      ({step.row},{step.col}) → {step.terrain} → +{step.cost}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {resultDetails.visitedOrder?.length > 0 && (
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer" }}>🧭 Show visited order (first 100)</summary>
                <p style={{ marginTop: 8, fontSize: 14, color: "#ddd" }}>
                  The sequence of nodes the algorithm expanded (useful to understand search behavior).
                </p>
                <ul style={{ marginTop: 10 }}>
                  {resultDetails.visitedOrder.slice(0, 100).map((v, i) => (
                    <li key={i}>
                      {i + 1}. ({v.row},{v.col})
                    </li>
                  ))}
                </ul>
                {resultDetails.visitedOrder.length > 100 && (
                  <p style={{ marginTop: 8, fontSize: 13, color: "#aaa" }}>
                    …and {resultDetails.visitedOrder.length - 100} more.
                  </p>
                )}
              </details>
            )}
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

export default MazePage;
