import NOTES from "./notes.js";

function chagneAccuracyText(element, text) {
    element.innerText = text;
    element.style.transform = `scale(${1+Math.random()}) rotate(${Math.random()*40-20}deg)`;
}

/**
 * Game function
 * @param {HTMLAudioElement} player
 * @param {AudioContext} audioCtx
 * @param {CanvasRenderingContext2D} canvasCtx
 * @param {HTMLElement} scoreCounter
 * @param {HTMLElement} accuracyText
 */
function startGame(player, audioCtx, canvasCtx, scoreCounter, accuracyText) {
    const startTime = audioCtx.getOutputTimestamp().contextTime;
    const offset = 50;
    const goalHeight = 14;
    const barHeight = 7;
    let playing = true;
    let hitting = false;

    // Event Listeners
    player.addEventListener("play", () => {
        playing = true;
    });

    player.addEventListener("pause", () => {
        playing = false;
    });

    const press = (ev) => {
        if (ev.key == " ") {
            hitting = true;
        }
    };

    canvasCtx.canvas.addEventListener("keydown", press)
    document.addEventListener("keydown", press);

    // Notes
    let notes = NOTES;

    // Update loop
    function update() {
        const playTime = audioCtx.getOutputTimestamp().contextTime - startTime;
        const nextNoteDistance = notes[0] + barHeight / 2 - playTime * 100;
        // If we're not playing, then return out of the game loop
        if (!playing) return;

        // canvasCtx.fillStyle = "#fff5";
        // canvasCtx.fillRect(0, 0, 100, 300);
        canvasCtx.clearRect(0, 0, 100, 300);
        if (hitting) {
            hitting = false;

            // We hit close enough in the zone
            if (nextNoteDistance > -goalHeight && nextNoteDistance < goalHeight) {
                scoreCounter.innerText = parseInt(scoreCounter.innerText) + 1;
                notes = notes.slice(1);

                // Accuracy Text
                if (Math.abs(nextNoteDistance) < goalHeight / 2) {
                    chagneAccuracyText(accuracyText, "Good");
                }
                if (Math.abs(nextNoteDistance) < goalHeight / 3) {
                    chagneAccuracyText(accuracyText, "Great!");
                }
                if (Math.abs(nextNoteDistance) < goalHeight / 4) {
                    chagneAccuracyText(accuracyText, "PERFECT!");
                }
            }

            // We were close but missed
            else if (nextNoteDistance > goalHeight && nextNoteDistance < goalHeight*3) {
                scoreCounter.innerText = parseInt(scoreCounter.innerText) - 1;
                chagneAccuracyText(accuracyText, "too early");
                notes = notes.slice(1);
            }
        }
        else if (nextNoteDistance < -goalHeight) {
            scoreCounter.innerText = parseInt(scoreCounter.innerText) - 1;
            chagneAccuracyText(accuracyText, "too late");
            notes = notes.slice(1);
        }

        // Draw things to screen
        canvasCtx.fillStyle = "#2a3b4c";
        for (const note of notes.slice(0, 10)) {
            canvasCtx.fillRect(0, playTime * 100 - note + barHeight / 2 + (canvasCtx.canvas.height - offset), 100, barHeight);
        }

        canvasCtx.fillStyle = "#0f08";
        canvasCtx.fillRect(0, canvasCtx.canvas.height - offset, 100, goalHeight)

        // loop
        requestAnimationFrame(update);
    }

    function recordUpdate() {
        const playTime = audioCtx.getOutputTimestamp().contextTime - startTime;
        // If we're not playing, then return out of the game loop
        if (!playing) return;

        // canvasCtx.fillStyle = "#fff5";
        // canvasCtx.fillRect(0, 0, 100, 300);
        canvasCtx.clearRect(0, 0, 100, 300);

        if (hitting) {
            hitting = false;
            scoreCounter.innerText = notes.length;
            notes.push(playTime * 100);
        }

        // Draw things to screen
        canvasCtx.fillStyle = "#2a3b4c";
        for (const note of notes) {
            canvasCtx.fillRect(0, playTime * 100 - note, 100, barHeight);
        }

        // loop
        requestAnimationFrame(recordUpdate);
    }

    // Start the loop
    update();

    // Record inputs to the array
    // recordUpdate();
    // globalThis.notes = notes;
}

document.addEventListener("DOMContentLoaded", () => {
    let gameCanvas = document.getElementById("game");
    let gameContext = gameCanvas.getContext("2d");

    let audioSource = document.getElementById("player");
    let audioContext = new AudioContext();
    let audioTrack = audioContext.createMediaElementSource(audioSource);
    audioTrack.connect(audioContext.destination);

    let accuracyText = document.getElementById("accuracy");

    let startButton = document.getElementById("start");
    startButton.addEventListener("click", () => {
        startButton.disabled = true;
        startButton.innerText = 0;

        audioSource.play();
        startButton.blur();
        startGame(audioSource, audioContext, gameContext, startButton, accuracyText);
    });
});