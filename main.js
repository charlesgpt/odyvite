// Audio Manager Class
export class AudioManager {
    constructor() {
        this.backgroundMusic = new Audio('public/sound/sound.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5;
        
        this.typingSound = new Audio('public/sound/typing.mp3');
        this.typingSound.volume = 0.3;
        
        this.clickSound = new Audio('public/sound/click.mp3');
        this.clickSound.volume = 0.5;

        this.hoverSound = new Audio('public/sound/hover.mp3');
        this.hoverSound.volume = 0.4;

        this.restoreAudioState();
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveAudioState();
            } else {
                this.restoreAudioState();
            }
        });
    }

    saveAudioState() {
        localStorage.setItem('audioPlaying', this.backgroundMusic.paused ? 'false' : 'true');
        localStorage.setItem('audioTime', this.backgroundMusic.currentTime.toString());
    }

    restoreAudioState() {
        const wasPlaying = localStorage.getItem('audioPlaying') === 'true';
        const time = parseFloat(localStorage.getItem('audioTime') || '0');
        
        if (wasPlaying) {
            this.backgroundMusic.currentTime = time;
            this.playBackgroundMusic();
        }
    }

    playBackgroundMusic() {
        this.backgroundMusic.play().catch(error => {
            console.log('Background music autoplay failed - waiting for user interaction');
        });
        localStorage.setItem('audioPlaying', 'true');
    }

    playClickSound() {
        this.clickSound.currentTime = 0;
        this.clickSound.play().catch(error => {
            console.log('Click sound failed to play');
        });
    }

    playHoverSound() {
        this.hoverSound.currentTime = 0;
        this.hoverSound.play().catch(error => {
            console.log('Hover sound failed to play');
        });
    }

    playTypingSound() {
        this.typingSound.currentTime = 0;
        this.typingSound.play().catch(error => {
            console.log('Typing sound failed to play');
        });
    }
}

// Game state
export const gameState = {
    currentScreen: 'welcome-screen',
    gold: parseInt(localStorage.getItem('playerGold')) || 100,
    marketState: 'Bull Market',
    canRoll: true,
    diceResult: null
};

// Create global audio manager instance
export const audioManager = new AudioManager();

// Initialize dialogue page
export async function initializeDialogue() {
    try {
        // Store original text content
        const elements = document.querySelectorAll('.typing-text');
        const originalTexts = new Map();
        
        elements.forEach(el => {
            originalTexts.set(el, el.textContent.trim());
            el.textContent = '';
            el.style.opacity = '0';
        });

        // Hide continue button initially
        const continueButton = document.querySelector('.continue-button');
        if (continueButton) {
            continueButton.style.opacity = '0';
            continueButton.style.transform = 'translateY(20px)';
        }

        // Function to type text with sound
        async function typeTextWithSound(element, text) {
            if (!element || !text) return;
            
            // Make sure the container is visible first
            const container = element.closest('.god-message, .oracle-message, .narrative-text');
            if (container) {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }

            // Make the typing element visible
            element.style.opacity = '1';
            element.textContent = '';

            // Type each character
            for (let i = 0; i < text.length; i++) {
                element.textContent += text[i];
                try {
                    await audioManager.playTypingSound();
                } catch (error) {
                    console.log('Typing sound error:', error);
                }
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Wait after typing
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Sequence 1: Narrative text
        const narrativeText = document.querySelector('.narrative-text .typing-text');
        if (narrativeText) {
            await typeTextWithSound(narrativeText, originalTexts.get(narrativeText));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Sequence 2: Athena's message
        const athenaMessage = document.querySelector('.athena .typing-text');
        if (athenaMessage) {
            await typeTextWithSound(athenaMessage, originalTexts.get(athenaMessage));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Sequence 3: Poseidon's message
        const poseidonMessage = document.querySelector('.poseidon .typing-text');
        if (poseidonMessage) {
            await typeTextWithSound(poseidonMessage, originalTexts.get(poseidonMessage));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Sequence 4: Zeus's message
        const zeusMessage = document.querySelector('.zeus .typing-text');
        if (zeusMessage) {
            await typeTextWithSound(zeusMessage, originalTexts.get(zeusMessage));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Sequence 5: Oracle message
        const oracleMessage = document.querySelector('.oracle-message');
        const oracleText = oracleMessage?.querySelector('.typing-text');
        if (oracleText) {
            await typeTextWithSound(oracleText, originalTexts.get(oracleText));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Final sequence: Show continue button
        if (continueButton) {
            continueButton.style.opacity = '1';
            continueButton.style.transform = 'translateY(0)';
            continueButton.addEventListener('click', () => {
                audioManager.playClickSound();
                navigateToScreen('dice-roll-page.html');
            });
        }
    } catch (error) {
        console.error('Error in dialogue initialization:', error);
    }
}

// Navigation with audio persistence
export function navigateToScreen(url) {
    audioManager.playClickSound();
    audioManager.saveAudioState();
    setTimeout(() => {
        window.location.href = url;
    }, 200);
}

// Handle market state panel navigation
if (window.location.pathname.includes('market-state-panel')) {
    const continueButton = document.querySelector('.continue-button');
    if (continueButton) {
        continueButton.addEventListener('click', () => navigateToScreen('coinflip.html'));
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing game...');
    
    // Settings button and volume controls functionality
    const settingsButton = document.querySelector('.settings-button-icon2, .settings-button-icon3');
    const volumeControls = document.querySelector('.volume-controls');
    const musicVolumeSlider = document.getElementById('music-volume');

    if (settingsButton && volumeControls) {
        // Initialize volume sliders with current values
        if (musicVolumeSlider) {
            musicVolumeSlider.value = audioManager.backgroundMusic.volume * 100;
            musicVolumeSlider.addEventListener('input', (e) => {
                audioManager.backgroundMusic.volume = e.target.value / 100;
                localStorage.setItem('musicVolume', e.target.value);
            });
        }
        
        const effectsVolumeSlider = document.getElementById('effects-volume');
        if (effectsVolumeSlider) {
            effectsVolumeSlider.value = audioManager.clickSound.volume * 100;
            effectsVolumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                audioManager.clickSound.volume = volume;
                audioManager.hoverSound.volume = volume * 0.8;
                audioManager.typingSound.volume = volume * 0.6;
                localStorage.setItem('effectsVolume', e.target.value);
            });
        }
        
        // Toggle volume controls panel
        settingsButton.addEventListener('click', () => {
            audioManager.playClickSound();
            volumeControls.style.display = volumeControls.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // Menu navigation
    const menuItems = document.querySelectorAll('.menu-bar > div');
    menuItems.forEach(item => {
        const page = item.dataset.page;
        if (page) {
            item.style.cursor = 'pointer';
            
            item.addEventListener('click', () => {
                audioManager.playClickSound();
                navigateToScreen(page);
            });

            item.addEventListener('mouseenter', () => {
                audioManager.playHoverSound();
                item.style.transform = 'scale(1.1)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
            });
        }
    });

    // Add click handler for start button
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            audioManager.playClickSound();
            navigateToScreen('dialogue-page.html');
        });

        startButton.addEventListener('mouseenter', () => {
            audioManager.playHoverSound();
        });
    }

    // Start background music on first interaction
    document.addEventListener('click', () => {
        audioManager.playBackgroundMusic();
    }, { once: true });

    // Add sound effects to all interactive elements
    document.querySelectorAll('button, [role="button"], .settings-button-icon2, .settings-button-icon3, .back-button-icon2, .cast-bones').forEach(button => {
        button.addEventListener('click', () => audioManager.playClickSound());
        button.addEventListener('mouseenter', () => audioManager.playHoverSound());
    });

    // Initialize specific pages
    if (window.location.pathname.includes('dialogue-page')) {
        console.log('Starting dialogue initialization...');
        initializeDialogue().catch(error => {
            console.error('Failed to initialize dialogue:', error);
        });
    } else if (window.location.pathname.includes('dice-roll-page')) {
        console.log('Initializing dice roll page...');
        initializeDiceRoll();
    }
});

// Dice rolling functionality
function initializeDiceRoll() {
    const rollButton = document.getElementById('roll-dice');
    const dice = document.querySelector('.dice');
    const goldDisplay = document.getElementById('gold-amount');

    // Add back button functionality
    const backButton = document.querySelector('.back-button-icon2');
    if (backButton) {
        backButton.addEventListener('click', () => {
            audioManager.playClickSound();
            window.history.back();
        });
    }

    // Initialize volume controls for dice roll page
    const dicePageVolumeControls = document.querySelector('.volume-controls');
    const dicePageMusicSlider = document.getElementById('music-volume');
    const dicePageEffectsSlider = document.getElementById('effects-volume');

    if (dicePageVolumeControls && dicePageMusicSlider && dicePageEffectsSlider) {
        // Initialize sliders with current values
        dicePageMusicSlider.value = audioManager.backgroundMusic.volume * 100;
        dicePageEffectsSlider.value = audioManager.clickSound.volume * 100;

        // Add event listeners for volume changes
        dicePageMusicSlider.addEventListener('input', (e) => {
            audioManager.backgroundMusic.volume = e.target.value / 100;
            localStorage.setItem('musicVolume', e.target.value);
        });
    }

    if (rollButton && dice) {
        rollButton.addEventListener('click', () => {
            if (!gameState.canRoll) return;

            gameState.canRoll = false;
            audioManager.playClickSound();
            rollButton.style.pointerEvents = 'none';

            // Random rotations for realistic effect
            const rotations = {
                x: Math.floor(Math.random() * 10) * 360 + Math.floor(Math.random() * 6) * 90,
                y: Math.floor(Math.random() * 10) * 360 + Math.floor(Math.random() * 6) * 90,
                z: Math.floor(Math.random() * 10) * 360
            };

            dice.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.3, 1)';
            dice.style.transform = `rotateX(${rotations.x}deg) rotateY(${rotations.y}deg) rotateZ(${rotations.z}deg)`;

            setTimeout(() => {
                const result = Math.floor(Math.random() * 6) + 1;
                gameState.diceResult = result;

                // Determine market state based on dice roll
                let newMarketState;
                if (result <= 2) { 
                    newMarketState = 'Bear Market';
                } else if (result <= 4) { 
                    newMarketState = 'Choppy Market';
                } else {
                    newMarketState = 'Bull Market';
                }
                localStorage.setItem('previousPage', 'dice-roll-page.html');
                gameState.marketState = newMarketState;
                localStorage.setItem('marketState', newMarketState);
                navigateToScreen('market-state-panel.html');
            }, 3000);
        });
    }

    // Update initial gold display
    if (goldDisplay) {
        goldDisplay.textContent = gameState.gold;
    }
}