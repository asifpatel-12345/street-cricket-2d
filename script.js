const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const wicketsEl = document.getElementById("wickets");
const ballsEl = document.getElementById("balls");
const messageEl = document.getElementById("message-overlay");
const hitBtn = document.getElementById("hitBtn");
const resetBtn = document.getElementById("resetBtn");

let score = 0;
let wickets = 0;
let balls = 0;
const maxBalls = 12;
const maxWickets = 3;

let gameState = "READY"; // READY, BOWLING, HIT, OVER
let ballX = 300;
let ballY = 50;
let ballSpeedY = 4;
let shotResult = "";

const batsmanX = 300;
const batsmanY = 330;

function drawPitch() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pitch strip
    ctx.fillStyle = "#ca8a04";
    ctx.fillRect(250, 20, 100, 380);

    // Crease lines
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(250, 320);
    ctx.lineTo(350, 320);
    ctx.stroke();

    // Wickets (Top/Bowler end)
    ctx.fillStyle = "#78350f";
    ctx.fillRect(285, 20, 30, 10);

    // Batsman & Wickets (Bottomend)
    ctx.fillRect(285, 360, 30, 10); // Stumps
    
    // Batsman
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(batsmanX, batsmanY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Bat
    ctx.fillStyle = "#9a3412";
    ctx.fillRect(batsmanX - 15, batsmanY - 5, 8, 25);

    // Ball
    if (gameState === "BOWLING" || gameState === "HIT") {
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function startBowling() {
    if (balls >= maxBalls || wickets >= maxWickets) return;
    
    gameState = "BOWLING";
    ballX = 300;
    ballY = 50;
    ballSpeedY = 5 + Math.random() * 3;
    messageEl.textContent = "Ball coming... Hit it!";
    messageEl.style.opacity = "1";
}

function updateGame() {
    if (gameState === "BOWLING") {
        ballY += ballSpeedY;

        // Check if ball reached batsman zone (Y: 310 to 340)
        if (ballY >= 320 && ballY <= 345) {
            // Player missed the ball
            messageEl.textContent = "MISSED! Dot ball.";
            finishBall(0);
        }
    } else if (gameState === "HIT") {
        ballY -= 8;
        ballX += (Math.random() - 0.5) * 6;
        if (ballY < 20) {
            messageEl.textContent = `It's a ${shotResult}! 🎉`;
            finishBall(shotResult);
        }
    }

    drawPitch();
    if (gameState !== "OVER") {
        requestAnimationFrame(updateGame);
    }
}

function hitShot() {
    if (gameState !== "BOWLING") return;

    // Determine shot based on timing / position
    if (ballY >= 315 && ballY <= 335) {
        const outcomes = [4, 6, 2, 1, "OUT"];
        const weights = [30, 20, 25, 15, 10]; // probabilities
        shotResult = getRandomOutcome(outcomes, weights);

        if (shotResult === "OUT") {
            wickets++;
            messageEl.textContent = "OUT! Caught behind! ❌";
        } else {
            score += shotResult;
            messageEl.textContent = `${shotResult} Runs! 🚀`;
        }
    } else if (ballY < 315) {
        shotResult = 1;
        score += 1;
        messageEl.textContent = "Late shot! 1 Run.";
    } else {
        shotResult = 0;
        messageEl.textContent = "Too late! Dot ball.";
    }

    gameState = "HIT";
}

function getRandomOutcome(outcomes, weights) {
    let totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < outcomes.length; i++) {
        if (randomNum < weights[i]) return outcomes[i];
        randomNum -= weights[i];
    }
    return 4;
}

function finishBall(runs) {
    balls++;
    updateScoreboard();

    if (balls >= maxBalls || wickets >= maxWickets) {
        gameState = "OVER";
        messageEl.textContent = `Game Over! Final Score: ${score}/${wickets}`;
        messageEl.style.opacity = "1";
        hitBtn.disabled = true;
    } else {
        setTimeout(() => {
            startBowling();
        }, 1200);
    }
}

function updateScoreboard() {
    scoreEl.textContent = score;
    wicketsEl.textContent = wickets;
    ballsEl.textContent = balls;
}

function resetGame() {
    score = 0;
    wickets = 0;
    balls = 0;
    hitBtn.disabled = false;
    updateScoreboard();
    messageEl.textContent = "Press Hit Shot to start!";
    startBowling();
    updateGame();
}

// Event Listeners
hitBtn.addEventListener("click", hitShot);
resetBtn.addEventListener("click", resetGame);

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        hitShot();
    }
});

// Initial Start
resetGame();