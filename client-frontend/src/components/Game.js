import { useEffect, useRef, useState } from "react";
import socket from './socket'
import './Game.css';

const Game = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [playerInfo, setPlayerInfo] = useState("Connecting...");
  const [showModal, setShowModal] = useState(true);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const easyRef = useRef();
  const mediumRef = useRef();
  const hardRef = useRef();

  // Handle socket events
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("🌐 Connected to server:", socket.id);
    });

    socket.on("waitingForPlayer", (data) => {
      setPlayerInfo(data.message);
    });

    socket.on("playerAssignment", (data) => {
      setPlayerInfo(data.message);
    });

    socket.on("gameReady", () => {
      setPlayerInfo((prev) => prev + " - Game Ready!");
    });

    socket.on("playerDisconnected", (data) => {
      setPlayerInfo(data.message);
    });

    socket.on("gameUpdate", (data) => {
      setGameState(data);
      setScores({ p1: data.player1.score, p2: data.player2.score });
    });

    socket.on("disconnect", () => {
      setPlayerInfo("Disconnected");
    });

    // ✅ Clean up listeners on unmount
    return () => {
      socket.off("connect");
      socket.off("waitingForPlayer");
      socket.off("playerAssignment");
      socket.off("gameReady");
      socket.off("playerDisconnected");
      socket.off("gameUpdate");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  // Draw game
  useEffect(() => {
    if (!gameState) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // center dashed line
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // paddles
    ctx.fillStyle = "white";
    ctx.fillRect(
      gameState.player1.x,
      gameState.player1.y,
      gameState.player1.width,
      gameState.player1.height
    );
    ctx.fillRect(
      gameState.player2.x,
      gameState.player2.y,
      gameState.player2.width,
      gameState.player2.height
    );

    // ball
    ctx.beginPath();
    ctx.arc(
      gameState.ball.x,
      gameState.ball.y,
      gameState.ball.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [gameState]);

  // Paddle control
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    socket.emit("paddleMove", { y: mouseY - 50 });
  };

  // Modal buttons
  const handleChooseAI = () => {
    setShowDifficulty(true);
    setShowModal(false);
    socket.emit("joinGame", { mode: "AI" });
  };

  const handleChoosePVP = () => {
    setShowModal(false);
    socket.emit("joinGame", { mode: "PVP" });
  };

  const setDifficulty = (level) => {
    socket.emit("setDifficulty", { level });
    if (level === "easy") {
		easyRef.current.style.backgroundColor = "yellow";
		mediumRef.current.style.backgroundColor = "";
		hardRef.current.style.backgroundColor = "";
	};
    if (level === "medium") {
		easyRef.current.style.backgroundColor = "";
		mediumRef.current.style.backgroundColor = "yellow";
		hardRef.current.style.backgroundColor = "";
	};
    if (level === "hard") {
		easyRef.current.style.backgroundColor = "";
		mediumRef.current.style.backgroundColor = "";
		hardRef.current.style.backgroundColor = "yellow";
	};

    console.log("Difficulty set:", level);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">🏓 Simple Pong Game</h1>

      <div className="info">
        <div>{playerInfo}</div>
        <div className="score">
          Player 1: {scores.p1} | Player 2: {scores.p2}
        </div>
      </div>

      {showDifficulty && (
        <div className="difficulty-controls">
          <button
            ref={easyRef}
            onClick={() => setDifficulty("easy")}
            className="btn btn-easy"
          >
            Easy 🟢
          </button>
          <button
            ref={mediumRef}
            onClick={() => setDifficulty("medium")}
            className="btn btn-medium"
          >
            Medium 🟡
          </button>
          <button
            ref={hardRef}
            onClick={() => setDifficulty("hard")}
            className="btn btn-hard"
          >
            Hard 🔴
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        id="gameCanvas"
        onMouseMove={handleMouseMove}
      />

      <div className="controls">
        <h3>🎮 How to Play:</h3>
        <p>Move your mouse up/down to control your paddle</p>
        <p>Multiple rooms available — players are matched automatically</p>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-question">Who do you want to play against?</p>
            <div className="modal-buttons">
              <button onClick={handleChooseAI} className="btn btn-ai">
                AI 🤖
              </button>
              <button onClick={handleChoosePVP} className="btn btn-human">
                Human 👤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;