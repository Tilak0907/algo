import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./SimulationGrid.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SimulationPage.css";
import NavBar from "../components/NavBar";

const SimulationPage = () => {
  const [gridSize, setGridSize] = useState(20);
  const [grid, setGrid] = useState([]);
  const [gridType, setGridType] = useState("Square");
  const [algorithm, setAlgorithm] = useState("BFS");
  const [mode, setMode] = useState("wall");
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [allResults, setAllResults] = useState({});
  const [overrideMud, setOverrideMud] = useState(false);
  const [pathName, setPathName] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [obstacleLevel, setObstacleLevel] = useState("None");
  const [obstacleType, setObstacleType] = useState("");
  const [startIcon, setStartIcon] = useState("robot");
  const [savedPaths, setSavedPaths] = useState([]);
  const [selectedPathId, setSelectedPathId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [visitedCells, setVisitedCells] = useState([]);
  const [showAltPath, setShowAltPath] = useState(false);




  // 🔹 Backtracking path
  const [lastPath, setLastPath] = useState(null);

  const navigate = useNavigate();

 const createEmptyGrid = (size, type = gridType) => {
  if (type === "Square") {
    return Array(size)
      .fill()
      .map(() => Array(size).fill("empty"));
  }

  if (type === "Triangle") {
    const grid = [];
    for (let r = 0; r < size; r++) {
      grid.push(Array(r + 1).fill("empty")); // triangle shape
    }
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

  const terrainCost = {
    empty: 1,
    mud: 5,
    wall: Infinity,
    car: Infinity,
    human: Infinity,
  };

  useEffect(() => {
  setGrid(createEmptyGrid(gridSize, gridType));
}, [gridSize, gridType]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUserEmail(user ? user.email : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleUnload = async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Logout error on unload:", err);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleCellClick = (row, col) => {
    const newGrid = grid.map((r) => [...r]);
    if (mode === "start") {
      if (startPos) newGrid[startPos.row][startPos.col] = "empty";
      newGrid[row][col] = "start";
      setStartPos({ row, col });
    } else if (mode === "end") {
      if (endPos) newGrid[endPos.row][endPos.col] = "empty";
      newGrid[row][col] = "end";
      setEndPos({ row, col });
    } else {
      newGrid[row][col] = newGrid[row][col] === mode ? "empty" : mode;
    }
    setGrid(newGrid);
  };

  const resetGrid = () => {
    setGrid(createEmptyGrid(gridSize));
    setStartPos(null);
    setEndPos(null);
    setAllResults((prev) => {
      const next = { ...prev };
      delete next[algorithm];
      return next;
    });
    setLastPath(null);
  };

  const isTileWalkable = (tile) =>
    tile !== "wall" &&
    tile !== "car" &&
    tile !== "human" &&
    (tile !== "mud" || overrideMud);

  const placeObstacles = (level, type) => {
    const newGrid = grid.map((r) => [...r]);
    const totalCells = gridSize * gridSize;
    let percentage = 0;
    if (level === "Low") percentage = 0.1;
    else if (level === "Medium") percentage = 0.2;
    else if (level === "High") percentage = 0.3;
    else return;

    const coords = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (newGrid[r][c] === "empty") coords.push({ row: r, col: c });
      }
    }
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
    const shuffled = shuffle(coords);
    const count = Math.floor(totalCells * percentage);

    for (let i = 0; i < count && i < shuffled.length; i++) {
      const { row, col } = shuffled[i];
      const typeToPlace =
        type === "Wall"
          ? "wall"
          : type === "Mud"
          ? "mud"
          : type === "Car"
          ? "car"
          : type === "Human"
          ? "human"
          : ["wall", "mud", "car", "human"][Math.floor(Math.random() * 4)];
      newGrid[row][col] = typeToPlace;
    }
    setGrid(newGrid);
  };

  // 🔹 SLOW visualization for pathfinding

  const visualizePath = async (path, visited) => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const newGrid = grid.map((r) => [...r]);

  for (let { row, col } of visited) {
    if (newGrid[row][col] === "empty") {
      newGrid[row][col] = "visited";
      setGrid([...newGrid]);
      await delay(100);
    }
  }

  for (let { row, col } of visited) {
    if (newGrid[row][col] === "visited") newGrid[row][col] = "empty";
  }

  for (let { row, col } of path) {
    if (newGrid[row][col] === "empty" || (overrideMud && newGrid[row][col] === "mud")) {
      newGrid[row][col] = "path";
      setGrid([...newGrid]);
      await delay(180);
    }
  }
};

// 🔹 Simple visualizer for alternative (visited-but-unused) paths
// 🔹 Combined visualization for both final and alternative paths
const visualizePaths = (path, visited, grid, setGrid) => {
  const newGrid = grid.map((r) => [...r]);
  const pathSet = new Set(path.map(p => `${p.row},${p.col}`));

  for (let { row, col } of visited) {
    const key = `${row},${col}`;
    // visited cells not in final path = alternative path
    if (!pathSet.has(key) && newGrid[row][col] === "empty") {
      newGrid[row][col] = "altpath"; // 🟢 green
    }
  }

  for (let { row, col } of path) {
    if (newGrid[row][col] === "empty" || newGrid[row][col] === "mud") {
      newGrid[row][col] = "path"; // 🟡 yellow
    }
  }

  setGrid([...newGrid]); // single update for efficiency
};



// 🔹 Show alternative (visited-but-unused) paths when user clicks button
// 🔹 Display alternative (visited-but-not-used) cells in green
const showAlternativePaths = (path, visited, grid, setGrid) => {
  const newGrid = grid.map((r) => [...r]);
  const pathSet = new Set(path.map(p => `${p.row},${p.col}`));

  for (let { row, col } of visited) {
    const key = `${row},${col}`;
    if (!pathSet.has(key) && newGrid[row][col] === "empty") {
      newGrid[row][col] = "altpath"; // 🟢 mark as alternative
    }
  }

  setGrid([...newGrid]);
  toast.info("Alternative paths displayed!");
};



  const runAlgorithm = async () => {
    if (!startPos || !endPos)
      return alert("Please place both start and end points.");
    const visited = [];
   let directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

if (gridType === "Hexagonal") {
  directions = [
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
  ];
}

    let path = [];
    const isValid = (r, c) =>
  r >= 0 &&
  r < grid.length &&
  c >= 0 &&
  c < (grid[r]?.length || 0) &&
  isTileWalkable(grid[r][c]);

    if (algorithm === "BFS") {
      const queue = [startPos];
      const parent = {};
      const visitedSet = new Set();
      const key = (p) => `${p.row},${p.col}`;
      visitedSet.add(key(startPos));
      while (queue.length) {
        const current = queue.shift();
        visited.push(current);
        if (current.row === endPos.row && current.col === endPos.col) {
          let node = key(current);
          while (node !== key(startPos)) {
            const [r, c] = node.split(",").map(Number);
            path.unshift({ row: r, col: c });
            node = parent[node];
          }
          break;
        }
        for (let [dr, dc] of directions) {
          const nr = current.row + dr,
            nc = current.col + dc;
          const nKey = `${nr},${nc}`;
          if (isValid(nr, nc) && !visitedSet.has(nKey)) {
            parent[nKey] = key(current);
            visitedSet.add(nKey);
            queue.push({ row: nr, col: nc });
          }
        }
      }
    }

    if (algorithm === "Dijkstra" || algorithm === "A*") {
      const pq = [[0, startPos]];
      const parent = {};
      const gScore = { [`${startPos.row},${startPos.col}`]: 0 };
      const heuristic = (a, b) =>
        Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
      while (pq.length) {
        pq.sort((a, b) => a[0] - b[0]);
        const [cost, current] = pq.shift();
        visited.push(current);
        const key = `${current.row},${current.col}`;
        if (current.row === endPos.row && current.col === endPos.col) {
          let node = key;
          while (node !== `${startPos.row},${startPos.col}`) {
            const [r, c] = node.split(",").map(Number);
            path.unshift({ row: r, col: c });
            node = parent[node];
          }
          break;
        }
        for (let [dr, dc] of directions) {
          const nr = current.row + dr,
            nc = current.col + dc;
          if (!isValid(nr, nc)) continue;
          const terrain = grid[nr][nc];
          const weight = terrainCost[terrain] ?? 1;
          const nKey = `${nr},${nc}`;
          const tentative = (gScore[key] ?? Infinity) + weight;
          if (!gScore[nKey] || tentative < gScore[nKey]) {
            gScore[nKey] = tentative;
            parent[nKey] = key;
            const priority =
              algorithm === "A*"
                ? tentative + heuristic({ row: nr, col: nc }, endPos)
                : tentative;
            pq.push([priority, { row: nr, col: nc }]);
          }
        }
      }
    }

    if (!path.length) return alert("No path found.");

    const pathCosts = path.map((cell) => {
      const terrain = grid[cell.row][cell.col];
      return { ...cell, terrain, cost: terrainCost[terrain] ?? 1 };
    });
    const totalCost = pathCosts.reduce((sum, step) => sum + step.cost, 0);

   setAllResults((prev) => ({
  ...prev,
  [algorithm]: {
    path,
    pathLength: path.length,
    timeTaken: 100 + path.length * 10,
    totalCost,
    pathCosts,
  },
}));

setLastPath(path);
setVisitedCells(visited); // store visited cells for later use
await visualizePath(path, visited); // normal animation only for now


  };

  

  // 🔹 Slower Backtracking Animation
  const backtrackPath = async () => {
    if (!lastPath || lastPath.length === 0) {
      toast.info("No path to backtrack. Run a simulation first.");
      return;
    }
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    const newGrid = grid.map((r) => [...r]);
    const reversedPath = [...lastPath].reverse();

    for (let { row, col } of reversedPath) {
      if (newGrid[row][col] === "path") {
        newGrid[row][col] = "backtrack";
        setGrid([...newGrid]);
        await delay(200); // ⬅️ Slower speed for backtracking
        newGrid[row][col] = "empty";
        setGrid([...newGrid]);
      }
    }
    toast.success("Backtracking complete!");
  };

  const handleSaveResults = async () => {
    const result = allResults[algorithm];
    if (!result) return alert("Please run the simulation first.");
    if (!pathName.trim()) return alert("Enter a valid path name.");
    const validPathName = /^[\w\s\-@#!.,()[\]&*%$^+=]+$/;
    if (!validPathName.test(pathName.trim()))
      return alert("Path name contains invalid characters.");

    if (!currentUser)
      return navigate("/login", {
        state: { result, algorithm, pathName, gridSize,gridType, overrideMud },
      });
    const q = query(
      collection(db, "simulationResults"),
      where("uid", "==", currentUser.uid),
      where("name", "==", pathName.trim()),
      where("algorithm", "==", algorithm)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return alert("This result already exists.");
    await addDoc(collection(db, "simulationResults"), {
      uid: currentUser.uid,
      name: pathName.trim(),
      algorithm,
      path: result.path,
      pathLength: result.pathLength,
      timeTaken: result.timeTaken,
      gridSize,
      gridType,
      overrideMud,
      createdAt: new Date().toISOString(),
      totalCost: result.totalCost,
    });
    alert("Result saved!");
  };

  const getCellIcon = (cell) => {
    switch (cell) {
      case "start":
        return "🤖";
      case "end":
        return "🔴";
      case "wall":
        return "⬛";
      case "mud":
        return "🟫";
      case "car":
        return "🚗";
      case "human":
        return "🧍";
      case "path":
        return "🟡";
      case "visited":
        return "🔵";
      case "backtrack":
        return "◀️";
      default:
        return "⬜";
    }
  };

  return (
    <div>
      <NavBar />
      <div className="simulation-wrapper">
        {/* Left side: simulation area */}
        <div className="simulation-container">
          <h2>Simulation Page</h2>

          {/* Controls */}
          <div className="controls">
            <label>
              Grid Size:
              <select
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
              >
                {[10, 15, 20, 25, 30].map((size) => (
                  <option key={size} value={size}>
                    {size}x{size}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Obstacle Type:
              <select
                value={obstacleType}
                onChange={(e) => {
                  setObstacleType(e.target.value);
                  setObstacleLevel("None");
                }}
              >
                <option value="">Select Type</option>
                <option value="Wall">Wall</option>
                <option value="Mud">Mud</option>
                <option value="Car">Car</option>
                <option value="Human">Human</option>
                <option value="Both">All</option>
              </select>
            </label>


<label>
  Grid Type:
  <select
    value={gridType}
    onChange={(e) => setGridType(e.target.value)}
  >
    <option value="Square">Square</option>
    <option value="Triangle">Triangle</option>
    <option value="Hexagonal">Hexagonal</option>
  </select>
</label>


            <label>
              Obstacle Level:
              <select
                value={obstacleLevel}
                onChange={(e) => {
                  setObstacleLevel(e.target.value);
                  if (obstacleType) placeObstacles(e.target.value, obstacleType);
                  else toast.warn("Please select obstacle type first.");
                }}
                disabled={!obstacleType}
              >
                <option value="None">None</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label>
              Algorithm:
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="BFS">BFS</option>
                <option value="Dijkstra">Dijkstra</option>
                <option value="A*">A*</option>
              </select>
            </label>

            <div className="checkbox-box">
              <input
                type="checkbox"
                checked={overrideMud}
                onChange={(e) => setOverrideMud(e.target.checked)}
                id="override-mud"
              />
              <label htmlFor="override-mud">
                Allow path to override mud tiles
              </label>
            </div>

            <label className="path-name-label">
              Path Name:
              <input
                className="path-name-input"
                value={pathName}
                onChange={(e) => setPathName(e.target.value)}
                placeholder="Enter path name"
              />
            </label>
          </div>


          {/* ---------------- REFERENCES SECTION ---------------- */}
<div className="references-section">
 

{showReferences && (
  <div className="modal-overlay" onClick={() => setShowReferences(false)}>
    <div className="modal-content scrollable-modal" onClick={(e) => e.stopPropagation()}>
      <h2>📖 Algorithm References</h2>

      <ul>
        <li>
          <strong>1. Breadth-First Search (BFS):</strong><br />
          A simple and efficient algorithm used for <em>unweighted grids</em>. 
          It explores all nodes level by level and always finds the shortest path 
          when each movement has equal cost.<br />
          <strong>Best used for:</strong> Uniform terrains where all cells have the same cost.<br />
          <strong>Example:</strong> This algorithm can be used to test the robot within a room.
        </li>

        <li>
          <strong>2. Dijkstra’s Algorithm:</strong><br />
          Designed for <em>weighted graphs</em>, Dijkstra’s ensures the shortest possible 
          path by considering movement costs like mud or terrain resistance.<br />
          <strong>Best used for:</strong> Environments with varied terrain costs or obstacles.<br />
          <strong>Example:</strong> This algorithm can be used to test the robots in terrain or slope regions.
        </li>

        <li>
          <strong>3. A* (A-Star) Algorithm:</strong><br />
          A highly optimized algorithm that combines Dijkstra’s accuracy 
          with an intelligent heuristic to estimate the remaining distance. 
          It is faster and more efficient in most real-time navigation systems.<br />
          <strong>Best used for:</strong> Large or complex grids where performance 
          and speed are critical.<br />
          <strong>Example:</strong> This algorithm can be used to test the robots from an aerial view.
        </li>

        <li>
          <strong>1. Square Grid:</strong><br />
          The most common and straightforward model, consisting of cells arranged in 
          rows and columns with 4-directional movement (up, down, left, right).<br />
          <strong>Best used for:</strong> Basic indoor navigation, warehouse mapping, or maze solving.<br />
          <strong>Example:</strong> Used to simulate robot movement in factory floors or office spaces.
        </li>

         <li>
          <strong>2. Triangle Grid:</strong><br />
          This model divides the environment into triangular cells, allowing more complex 
          movement and tighter space representation. Movement can occur along three directions.<br />
          <strong>Best used for:</strong> Irregular terrain or tight environments where diagonal 
          precision is required.<br />
          <strong>Example:</strong> Ideal for simulating robotic arm motion or slope-based navigation.
        </li>

         <li>
          <strong>3. Hexagonal Grid:</strong><br />
          A natural structure that allows movement in six directions, making it highly 
          efficient for simulating fluid or radial movement patterns. It eliminates 
          diagonal bias and produces more accurate distance estimation.<br />
          <strong>Best used for:</strong> Outdoor exploration, drone pathfinding, or geographical simulations.<br />
          <strong>Example:</strong> Commonly used in GPS mapping and real-time strategy (RTS) games 
          for smooth and balanced pathfinding.
        </li>
      </ul>

      <h3 className="referencePath">Path Length and Cost Calculation</h3>
<p className="pathlength">
  In <strong>AlgoPilot</strong>, every algorithm computes two key metrics after a successful
  path simulation — <em>Path Length</em> and <em>Path Cost</em>:
</p>

<ul>
  <li>
    <strong>Path Length:</strong> Represents the total number of steps or cells traversed 
    from the <strong>start point</strong> to the <strong>end point</strong> along the 
    discovered path. It indicates the overall distance or movement count.
  </li>
  <li>
    <strong>Path Cost:</strong> Calculated as the sum of individual terrain costs 
    encountered along the path. Each cell has a defined cost based on terrain type:
    <ul>
      <li>Empty cell → cost = 1</li>
      <li>Mud cell → cost = 5</li>
      <li>Wall / Human / Car → not traversable (∞ cost)</li>
    </ul>
    Algorithms like <strong>BFS</strong> assume uniform cost (all = 1), while 
    <strong>Dijkstra</strong> and <strong>A*</strong> account for varying terrain 
    weights and compute the minimum total cost accordingly.
  </li>
</ul>

<p style={{ fontStyle: "italic", color: "#555" }}>
  These two metrics help compare algorithms not only by their pathfinding accuracy but 
  also by efficiency and terrain adaptability.
</p>


      <p style={{ marginTop: "10px", fontStyle: "italic", color: "#555" }}>
        In summary: <strong>BFS</strong> is ideal for simple uniform maps, 
        <strong>Dijkstra</strong> for cost-based terrains, and 
        <strong>A*</strong> for high-performance, real-world applications 
        like robotics and GPS navigation.
      </p>
<button className="close-button" onClick={() => setShowReferences(false)}> Close </button>
      
    </div>
  </div>
)}

</div>

          {/* Action Buttons Menu */}
          <div className="button-menu-toggle">
          </div>

          {showButtons && (
            <>
              <div className="mode-section">
                Mode:
                <button onClick={() => setMode("start")}>Start</button>
                <button onClick={() => setMode("end")}>End</button>
                <button onClick={() => setMode("wall")}>Wall</button>
                <button onClick={() => setMode("mud")}>Mud</button>
                <button onClick={() => setMode("car")}>Car</button>
                <button onClick={() => setMode("human")}>Human</button>
              </div>

              <div className="action-section">
                <button onClick={runAlgorithm}>Start Simulation</button>
                <button onClick={resetGrid}>Reset</button>
                <button onClick={handleSaveResults}>💾 Save to Firebase</button>
                <button onClick={backtrackPath}>🔙 Backtrack Path</button>
              </div>
            </>
          )}

        

{/* ---------------- BUTTON BAR ---------------- */}
<div className="top-button-bar">
  <button
    className="reference-button"
    onClick={() => setShowReferences(true)}
  >
    📚 View References
  </button>

  <button
    className="action-toggle"
    onClick={() => setShowButtons((prev) => !prev)}
  >
    {showButtons ? "Hide Menu ▲" : "Show Actions ▼"}
  </button>

  <button
    className="altpath-button"
    onClick={() => {
      if (!visitedCells.length || !lastPath) {
        toast.warn("Run a simulation first!");
        return;
      }

      if (showAltPath) {
        // Hide alternative path
        const newGrid = grid.map((r) =>
          r.map((cell) => (cell === "altpath" ? "empty" : cell))
        );

        for (let { row, col } of lastPath) {
          if (newGrid[row][col] === "empty" || newGrid[row][col] === "mud") {
            newGrid[row][col] = "path";
          }
        }

        setGrid([...newGrid]);
        setShowAltPath(false);
        toast.info("Alternative paths hidden!");
      } else {
        showAlternativePaths(lastPath, visitedCells, grid, setGrid);
        setShowAltPath(true);
      }
    }}
  >
    {showAltPath ? "🚫 Hide Alternative Path" : "🟢 Show Alternative Path"}
  </button>
</div>


          {/* Grid Display */}
          <div
  className="grid"
  style={{
    display: "grid",
    justifyContent: "center",
    gap: "2px",
  }}
>
  {grid.map((row, rowIndex) => (
    <div
      key={rowIndex}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${row.length}, 30px)`,
        justifyContent: "center",
      }}
    >
      {row.map((cell, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          onClick={() => handleCellClick(rowIndex, colIndex)}
          className={`cell ${cell}`}
        >
          {getCellIcon(cell)}
        </div>
      ))}
    </div>
  ))}
  
</div>


          {/* Results */}
          {allResults[algorithm] && (
  <div className="result-section">
    <h1>Results</h1>

    <p>
      <strong>Algorithm Used:</strong> {algorithm}
    </p>
    <p>
      <strong>Path Length:</strong> {allResults[algorithm].pathLength}
    </p>
    <p>
      <strong>Time Taken:</strong> {allResults[algorithm].timeTaken} ms
    </p>
    <p>
      <strong>Total Cost:</strong> ₹{allResults[algorithm].totalCost}
    </p>

    <h3>Path Breakdown:</h3>
    <ul>
      {allResults[algorithm].pathCosts?.map((step, i) => (
        <li key={i}>
          ({step.row}, {step.col}) → {step.terrain} → ₹{step.cost}
        </li>
      ))}
    </ul>
  </div>
)}


          <ToastContainer position="top-center" autoClose={3000} />
        </div>

        {/* Right side: tutorial panel */}
       <div className="tutorial-panel">
  <h2>🧠 Algorithm Tutorial</h2>

  {/* ---------------- HOW TO SIMULATE ---------------- */}
  <div>
    <h3>📍 How to Simulate a Path</h3>
    <div className="tutorial-steps">
      <p>1. Select <strong>Grid Size</strong> from dropdown.</p>
      <p>2. Choose <strong>Obstacle Type</strong> & <strong>Level</strong>.</p>
      <p>3. Choose <strong>Grid Type</strong>.</p>
      <p>4. Set <strong>Start</strong> and <strong>End</strong> points.</p>
      <p>5. Choose <strong>Algorithm</strong> and <strong>Run</strong>.</p>
      <p>6. Enable <strong>"Override Mud"</strong> if needed.</p>
      <p>7. Save results to Firebase if needed.</p>
    </div>
  </div>

  {/* ---------------- COLOR LEGEND ---------------- */}
  <div className="color-palette">
    <h3>🎨 Color Legend</h3>
    <div className="palette-grid">
      <div className="palette-item"><span className="cell empty"></span> Empty</div>
      <div className="palette-item"><span>🤖</span> Start</div>
      <div className="palette-item"><span>🔴</span> End</div>
      <div className="palette-item"><span className="cell wall"></span> Wall</div>
      <div className="palette-item"><span className="cell mud"></span> Mud</div>
      <div className="palette-item"><span>🚗</span> Car</div>
      <div className="palette-item"><span>🧍</span> Human</div>
      <div className="palette-item"><span className="cell path"></span> Path</div>
      <div className="palette-item"><span className="cell visited"></span> Visited</div>
      <div className="palette-item"><span className="cell altpath"></span> Alternative Path</div>
      <div className="palette-item"><span className="cell backtrack">◀️</span> Backtrack</div>
    </div>
  </div>

  {/* ---------------- ALGORITHM DETAILS ---------------- */}
  <h3>BFS Algorithm</h3>
  <p><strong>Time Complexity:</strong> O(V + E)</p>
  <p><strong>Pros:</strong> Always finds the shortest path in unweighted graphs.</p>
  <p><strong>Cons:</strong> Not suitable for weighted graphs.</p>

  <h3>Dijkstra Algorithm</h3>
  <p><strong>Time Complexity:</strong> O((V + E) log V)</p>
  <p><strong>Pros:</strong> Handles weighted graphs and finds the optimal path.</p>
  <p><strong>Cons:</strong> Slower than BFS for unweighted graphs.</p>

  <h3>A* Algorithm</h3>
  <p><strong>Time Complexity:</strong> O(E)</p>
  <p><strong>Pros:</strong> Very efficient with heuristics; finds optimal path faster.</p>
  <p><strong>Cons:</strong> Requires good heuristic; performance depends on it.</p>
</div>


        
      </div>
      
       <footer className="home-footer">
        <p>© 2025 AlgoPilot. All rights reserved.</p>
        <p>Contact: algopilot@gmail.com</p>
      </footer>
    </div>

    
    
  );
};

export default SimulationPage;
