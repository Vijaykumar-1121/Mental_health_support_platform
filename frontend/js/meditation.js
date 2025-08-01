/**
 * MindWell - meditation.js
 * ------------------------
 * This file handles the logic for the interactive breathing exercise page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const startStopBtn = document.getElementById('start-stop-btn');
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    const audio = document.getElementById('peaceful-music');

    let isMeditating = false;
    let intervalId = null;

    const startMeditation = () => {
        isMeditating = true;
        startStopBtn.textContent = 'Stop';
        breathingCircle.classList.add('animate');
        
        // Check if audio can be played
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Audio playback failed:", error);
                // Audio playback might be blocked by the browser. 
                // You might want to show a message to the user to enable it.
            });
        }

        // Sync text with animation (8s duration)
        breathingText.textContent = 'Breathe In...';
        intervalId = setInterval(() => {
            breathingText.textContent = breathingText.textContent === 'Breathe In...' ? 'Breathe Out...' : 'Breathe In...';
        }, 4000); // Change text every 4 seconds
    };

    const stopMeditation = () => {
        isMeditating = false;
        startStopBtn.textContent = 'Start';
        breathingCircle.classList.remove('animate');
        audio.pause();
        audio.currentTime = 0; // Rewind audio
        clearInterval(intervalId);
        breathingText.textContent = 'Breathe In...';
    };

    startStopBtn.addEventListener('click', () => {
        if (isMeditating) {
            stopMeditation();
        } else {
            startMeditation();
        }
    });
});
