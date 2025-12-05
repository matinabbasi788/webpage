import { useEffect, useRef, useState, type FC } from "react";

export const DinoGame: FC = () => {
	const [isMobile, setIsMobile] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [gameStarted, setGameStarted] = useState(false);
	const [gameOver, setGameOver] = useState(false);
	const [score, setScore] = useState(0);
	
	// Check if device is mobile
	useEffect(() => {
		const checkMobile = () => {
			const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
				(window.innerWidth <= 768 && 'ontouchstart' in window);
			setIsMobile(isMobileDevice);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);
	
	const gameStateRef = useRef({
		dino: { x: 50, y: 0, width: 40, height: 43, velocityY: 0, jumping: false, frame: 0 },
		obstacles: [] as Array<{ x: number; y: number; width: number; height: number; type: 'cactus' | 'bird' }>,
		clouds: [] as Array<{ x: number; y: number; width: number; speed: number }>,
		groundY: 0,
		groundOffset: 0,
		gameSpeed: 4,
		score: 0,
		animationId: 0,
	});

	// Initialize canvas
	useEffect(() => {
		// Don't initialize game on mobile
		if (isMobile) return;
		
		const canvas = canvasRef.current;
		if (!canvas) return;

		const resizeCanvas = () => {
			const container = containerRef.current;
			if (container) {
				const rect = container.getBoundingClientRect();
				canvas.width = rect.width || 400;
				canvas.height = rect.height || 60;
			} else {
				canvas.width = 400;
				canvas.height = 60;
			}
			gameStateRef.current.groundY = canvas.height - 2;
			gameStateRef.current.dino.y = gameStateRef.current.groundY - gameStateRef.current.dino.height;
		};

		const timer = setTimeout(() => resizeCanvas(), 10);
		const handleResize = () => resizeCanvas();
		window.addEventListener('resize', handleResize);
		
		return () => {
			clearTimeout(timer);
			window.removeEventListener('resize', handleResize);
		};
	}, [isMobile]);

	// Main game loop
	useEffect(() => {
		// Don't initialize game on mobile
		if (isMobile) return;
		
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		if (canvas.width === 0 || canvas.height === 0) {
			const container = containerRef.current;
			if (container) {
				const rect = container.getBoundingClientRect();
				canvas.width = rect.width || 400;
				canvas.height = rect.height || 60;
			} else {
				canvas.width = 400;
				canvas.height = 60;
			}
			gameStateRef.current.groundY = canvas.height - 2;
			gameStateRef.current.dino.y = gameStateRef.current.groundY - gameStateRef.current.dino.height;
		}

		const GRAVITY = 0.6;
		const JUMP_STRENGTH = -11;

		// Chrome T-Rex sprite drawing
		const drawDino = () => {
			const dino = gameStateRef.current.dino;
			const isDark = document.documentElement.classList.contains('dark');
			const color = isDark ? "#535353" : "#535353";
			const eyeColor = isDark ? "#212121" : "#212121";
			
			// Head (rounded)
			ctx.fillStyle = color;
			ctx.fillRect(dino.x + 20, dino.y + 2, 20, 20);
			ctx.fillRect(dino.x + 22, dino.y, 16, 2);
			
			// Eye
			ctx.fillStyle = eyeColor;
			if (dino.jumping) {
				ctx.strokeStyle = eyeColor;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(dino.x + 32, dino.y + 6);
				ctx.lineTo(dino.x + 36, dino.y + 6);
				ctx.stroke();
			} else {
				ctx.fillRect(dino.x + 33, dino.y + 5, 4, 4);
				ctx.fillStyle = isDark ? "#f3f4f6" : "#fff";
				ctx.fillRect(dino.x + 34, dino.y + 6, 1, 1);
			}
			
			// Body
			ctx.fillStyle = color;
			ctx.fillRect(dino.x + 20, dino.y + 22, 20, 10);
			ctx.fillStyle = isDark ? "#6b7280" : "#6b6b6b";
			ctx.fillRect(dino.x + 22, dino.y + 24, 16, 6);
			
			// Lower body
			ctx.fillStyle = color;
			ctx.fillRect(dino.x + 2, dino.y + 32, 36, 8);
			
			// Legs animation
			const legFrame = Math.floor(dino.frame / 5) % 2;
			if (!dino.jumping) {
				if (legFrame === 0) {
					ctx.fillStyle = color;
					ctx.fillRect(dino.x + 6, dino.y + 40, 6, 7);
					ctx.fillRect(dino.x + 20, dino.y + 40, 6, 7);
				} else {
					ctx.fillStyle = color;
					ctx.fillRect(dino.x + 12, dino.y + 40, 6, 7);
					ctx.fillRect(dino.x + 26, dino.y + 40, 6, 7);
				}
			} else {
				ctx.fillStyle = color;
				ctx.fillRect(dino.x + 12, dino.y + 40, 6, 7);
				ctx.fillRect(dino.x + 26, dino.y + 40, 6, 7);
			}
			
			// Tail
			ctx.fillStyle = color;
			ctx.fillRect(dino.x + 38, dino.y + 28, 6, 10);
		};

		const drawObstacle = (obstacle: { x: number; y: number; width: number; height: number; type: 'cactus' | 'bird' }) => {
			const isDark = document.documentElement.classList.contains('dark');
			const color = isDark ? "#6b7280" : "#535353";
			
			if (obstacle.type === 'cactus') {
				ctx.fillStyle = color;
				ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
				ctx.fillRect(obstacle.x - 2, obstacle.y + 6, 2, 8);
				ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + 6, 2, 8);
			} else {
				ctx.fillStyle = color;
				ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 6);
				ctx.fillRect(obstacle.x + obstacle.width - 2, obstacle.y - 2, 2, 2);
				ctx.fillRect(obstacle.x + obstacle.width - 2, obstacle.y + 6, 2, 2);
			}
		};

		const drawClouds = () => {
			const isDark = document.documentElement.classList.contains('dark');
			const color = isDark ? "rgba(107, 114, 128, 0.4)" : "rgba(83, 83, 83, 0.4)";
			
			gameStateRef.current.clouds.forEach(cloud => {
				ctx.fillStyle = color;
				ctx.fillRect(cloud.x, cloud.y, cloud.width, 4);
				ctx.fillRect(cloud.x + 2, cloud.y - 2, cloud.width - 4, 2);
			});
		};

		const drawScore = () => {
			const isDark = document.documentElement.classList.contains('dark');
			ctx.fillStyle = isDark ? "#e5e7eb" : "#535353";
			ctx.font = "bold 12px Arial";
			ctx.textAlign = "right";
			ctx.fillText(`${Math.floor(gameStateRef.current.score)}`, canvas.width - 10, 20);
			ctx.textAlign = "left";
		};

		const updateDino = () => {
			const dino = gameStateRef.current.dino;
			const targetY = gameStateRef.current.groundY - dino.height;
			
			if (!dino.jumping) {
				dino.frame += 1;
			}
			
			if (dino.jumping || dino.y < targetY) {
				dino.velocityY += GRAVITY;
				dino.y += dino.velocityY;
			}
			
			if (dino.y >= targetY) {
				dino.y = targetY;
				dino.velocityY = 0;
				dino.jumping = false;
			}
		};

		const updateObstacles = () => {
			const obstacles = gameStateRef.current.obstacles;
			const groundY = gameStateRef.current.groundY;
			const speed = gameStateRef.current.gameSpeed;
			
			obstacles.forEach(obstacle => {
				obstacle.x -= speed;
			});
			
			gameStateRef.current.obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
			
			const lastObstacle = obstacles[obstacles.length - 1];
			const minDistance = 300;
			if (obstacles.length === 0 || (lastObstacle && lastObstacle.x < canvas.width - minDistance)) {
				const isBird = Math.random() < 0.2 && gameStateRef.current.score > 300;
				if (isBird) {
					gameStateRef.current.obstacles.push({
						x: canvas.width,
						y: groundY - 20 - Math.random() * 10,
						width: 20,
						height: 6,
						type: 'bird',
					});
				} else {
					const obstacleHeight = 25 + Math.random() * 20;
					gameStateRef.current.obstacles.push({
						x: canvas.width,
						y: groundY - obstacleHeight,
						width: 17,
						height: obstacleHeight,
						type: 'cactus',
					});
				}
			}
			
			gameStateRef.current.groundOffset += speed;
		};

		const updateClouds = () => {
			const clouds = gameStateRef.current.clouds;
			const speed = gameStateRef.current.gameSpeed * 0.5;
			
			clouds.forEach(cloud => {
				cloud.x -= cloud.speed;
			});
			
			gameStateRef.current.clouds = clouds.filter(cloud => cloud.x + cloud.width > -20);
			
			if (clouds.length === 0 || clouds[clouds.length - 1].x < canvas.width - 200) {
				gameStateRef.current.clouds.push({
					x: canvas.width,
					y: 10 + Math.random() * 15,
					width: 20 + Math.random() * 15,
					speed: speed,
				});
			}
		};

		const checkCollision = () => {
			const dino = gameStateRef.current.dino;
			const obstacles = gameStateRef.current.obstacles;
			
			for (const obstacle of obstacles) {
				if (
					dino.x < obstacle.x + obstacle.width &&
					dino.x + dino.width > obstacle.x &&
					dino.y < obstacle.y + obstacle.height &&
					dino.y + dino.height > obstacle.y
				) {
					return true;
				}
			}
			return false;
		};

		const gameLoop = () => {
			if (!gameStarted || gameOver) {
				if (gameStateRef.current.animationId) {
					cancelAnimationFrame(gameStateRef.current.animationId);
					gameStateRef.current.animationId = 0;
				}
				return;
			}
			
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			updateDino();
			updateObstacles();
			updateClouds();
			
			gameStateRef.current.score += 0.2;
			if (Math.floor(gameStateRef.current.score) % 100 === 0 && gameStateRef.current.score % 1 < 0.2) {
				gameStateRef.current.gameSpeed += 0.05;
			}
			setScore(Math.floor(gameStateRef.current.score));
			
			if (checkCollision()) {
				setGameOver(true);
				return;
			}
			
			drawClouds();
			gameStateRef.current.obstacles.forEach(drawObstacle);
			drawDino();
			drawScore();
			
			gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
		};

		if (gameStarted && !gameOver && canvas.width > 0 && canvas.height > 0) {
			if (gameStateRef.current.animationId) {
				cancelAnimationFrame(gameStateRef.current.animationId);
			}
			gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
		}

		return () => {
			if (gameStateRef.current.animationId) {
				cancelAnimationFrame(gameStateRef.current.animationId);
				gameStateRef.current.animationId = 0;
			}
		};
	}, [gameStarted, gameOver, isMobile]);

	const handleJump = () => {
		if (gameOver) {
			const canvas = canvasRef.current;
			if (canvas) {
				gameStateRef.current = {
					dino: { x: 50, y: 0, width: 40, height: 43, velocityY: 0, jumping: false, frame: 0 },
					obstacles: [],
					clouds: [],
					groundY: canvas.height - 2,
					groundOffset: 0,
					gameSpeed: 4,
					score: 0,
					animationId: 0,
				};
				gameStateRef.current.dino.y = gameStateRef.current.groundY - gameStateRef.current.dino.height;
			}
			setScore(0);
			setGameOver(false);
			setGameStarted(false);
			return;
		}

		if (!gameStarted) {
			setGameStarted(true);
			return;
		}

		const dino = gameStateRef.current.dino;
		const groundY = gameStateRef.current.groundY;
		const targetY = groundY - dino.height;
		const isOnGround = dino.y >= targetY - 1 && dino.y <= targetY + 1;
		
		if (!dino.jumping && isOnGround) {
			dino.velocityY = -11; // Jump strength
			dino.jumping = true;
		}
	};

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.code === "Space" || e.key === "ArrowUp" || e.key === " ") {
				e.preventDefault();
				handleJump();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [gameOver, gameStarted]);

	return (
		<div ref={containerRef} className="dino-game-container">
			{isMobile ? (
				<div className="dino-game-mobile-message">
					Game available on desktop only
				</div>
			) : (
				<>
					<canvas
						ref={canvasRef}
						onClick={handleJump}
						className="dino-game-canvas"
						style={{ cursor: "pointer" }}
					/>
					{!gameStarted && !gameOver && (
						<div className="dino-game-instructions">
							Click or press Space to start
						</div>
					)}
					{gameOver && (
						<div className="dino-game-overlay">
							<div className="dino-game-over-text">Game Over!</div>
							<div className="dino-game-over-score">Score: {score}</div>
							<div className="dino-game-over-hint">Click to restart</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};
