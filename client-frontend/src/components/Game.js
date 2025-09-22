import { useEffect, useRef, useState } from "react";
import socket from './socket'
import './Game.css';

const Game = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [playerInfo, setPlayerInfo] = useState("Connecting...");
  const [showModal, setShowModal] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [lobbyRooms, setLobbyRooms] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [isPlayer1, setIsPlayer1] = useState(false);

  const easyRef = useRef();
  const mediumRef = useRef();
  const hardRef = useRef();

  // Handle socket events
  useEffect(() => {
    // Check if user is authenticated before connecting
    const token = localStorage.getItem('authToken');
    console.log("🔍 Checking token:", token ? "Token exists" : "No token found");
    
    if (!token) {
      setPlayerInfo("Please log in to play the game");
      return;
    }

    // Update socket auth if token exists
    socket.auth.token = token;
    console.log("🔌 Attempting to connect to server...");
    socket.connect();

    socket.on("connect", () => {
      console.log("🌐 Connected to server:", socket.id);
      setPlayerInfo("Connected! Choose game mode or join a room.");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection failed:", error.message);
      if (error.message === "Auth required" || error.message === "Invalid token") {
        setPlayerInfo("Authentication failed. Please log in again.");
        localStorage.removeItem('authToken');
      } else {
        setPlayerInfo("Connection failed. Please try again.");
      }
    });

	socket.on("opponentReconnected", (msg) => {
		setPlayerInfo(msg.message)
	})

	socket.on("opponentDisconnected", (msg) => {
		setPlayerInfo(msg.message)
	})

    socket.on("waitingForPlayer", (data) => {
      setPlayerInfo(data.message);
    });

    socket.on("playerAssignment", (data) => {
      setPlayerInfo(data.message);
    });

    socket.on("gameReady", (data) => {
      setPlayerInfo(data.message);
    });

    socket.on("playerDisconnected", (data) => {
      setPlayerInfo(data.message);
    });

	socket.on('gameReset', (data) => {
		setPlayerInfo(data.message);
	})

	socket.on("checkRoomStatus", (roomState) => {
		alert(`${roomState.message}`)
		if (roomState.status === "updateRoom") {
			setRoomId(roomState.roomId);
			setIsPlayer1(roomState.isPlayer1);
			setPlayerInfo(`You are in the ${roomState.roomId}!`) // Use roomState.roomId instead of roomId
			if (roomState.aiEnable === false) {
				setShowDifficulty(false);
			} else {
				setShowDifficulty(true);
			}
		}

	})

    socket.on('playerAssigment', (data) => {
        console.log("🎯 Player assignment received:", data);
        setIsPlayer1(data.isPlayer1);
        setRoomId(data.roomId)
        setPlayerInfo(data.message)
        if (data.aiEnable === true) {
            setShowDifficulty(true);
        } else {
            setShowDifficulty(false);
        }
    });

    socket.on("gameUpdate", (data, roomToRender) => {	
		// Use a callback to get current roomId value
		setRoomId(currentRoomId => {
			if (roomToRender === currentRoomId) {
				setGameState(data);
				setScores({ p1: data.player1.score, p2: data.player2.score });
			}
			return currentRoomId; // Return unchanged value
		});
    });

	socket.on("lobbyUpdate", (room) => {
		setLobbyRooms(room);
	})

	socket.on("chooseOpponent", () => { 
		setShowModal(true);
		}
	)

	socket.on("gameEnded", (rooomIdDeleted) => {
		// Use a callback to get current roomId value
		setRoomId(currentRoomId => {
			if (currentRoomId === rooomIdDeleted) {
				setGameState(null);
				return null; // Set roomId to null
			}
			return currentRoomId; // Return unchanged value
		});
	})

    socket.on("disconnect", () => {
      setPlayerInfo("Disconnected");
    });




    // ✅ Clean up listeners on unmount
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("waitingForPlayer");
      socket.off("playerAssignment");
      socket.off("gameReady");
      socket.off("playerDisconnected");
      socket.off("gameUpdate");
      socket.off("disconnect");
      socket.off("lobbyUpdate");
      socket.off("opponentReconnected");
      socket.off("opponentDisconnected");
      socket.off("gameReset");
      socket.off("checkRoomStatus");
      socket.off("playerAssigment");
      socket.off("chooseOpponent");
      socket.off("gameEnded");
      socket.disconnect();
    };
  }, []);

  // Draw game
  useEffect(() => {
    if (!gameState || !roomId) {console.log("returning before rendering!!!"); return;}
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

	if (isPlayer1) {
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 3;
        ctx.strokeRect(gameState.player1.x - 1, gameState.player1.y - 1, gameState.player1.width + 2, gameState.player1.height + 2);
    } else {
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 3;
        ctx.strokeRect(gameState.player2.x - 1, gameState.player2.y - 1, gameState.player2.width + 2, gameState.player2.height + 2);
    }
  }, [gameState, isPlayer1, roomId]);

  // Paddle control
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
	if (!gameState || gameState.gameEnded) return;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    socket.emit("paddleMove", { y: mouseY - 50 });
  };

  // Modal buttons
  const handleChooseAI = () => {
    console.log("🤖 Starting AI game...");
    setShowDifficulty(true);
    setShowModal(false);
    socket.emit("joinRoom", null, true, {mode: "AI"}, null);
  };

  const handleChoosePVP = () => {
    console.log("👤 Starting PVP game...");
    setShowModal(false);
    socket.emit("joinRoom", null, true, {mode: "PVP"}, null);
  };

  const setDifficulty = (level) => {
    socket.emit("setDifficulty", { level }, roomId);
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

  // Lobby functions

  const handleJoinRoom = (room) =>  {
	socket.emit("joinRoom", room.roomId, true, {mode: "NOTHING"}, null);
  }

  const handleCreateRoom = () => {
	socket.emit("joinRoom", null, false, {mode: "NOTHING"}, null);
  }


  return (
    <div className="app-container">
      <h1 className="app-title">🏓 Simple Pong Game</h1>

      <div className="info">
        <div>{playerInfo}</div>
        <div className="score">
          Player 1: {scores.p1} | Player 2: {scores.p2}
        </div>
      </div>

      {/* Lobby Section */}
      <div>
		<h3>Available Rooms:</h3>
		<div className="btn-lobbyRooms">
			{ lobbyRooms.length === 0 ? (<p>No active Rooms yet, create one!</p>) :
			  (<div className="btn-joinLobbyRoom">
				{
					lobbyRooms.map((room) => (
						<button 
							key={room.roomId}
							onClick={() => handleJoinRoom(room)}
						>
							{room.roomId} ({room.players}/ 2)
						</button>
					))
				}
			  </div>)
			}
			<button className="btn-createRoom"
					onClick={handleCreateRoom}
			>
				➕ Create New Room
			</button>
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