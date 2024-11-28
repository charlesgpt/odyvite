console.log('Coinflip script loaded');

// Game state management
let gameState = {
    gold: parseInt(localStorage.getItem('playerGold')) || 100,
    marketState: localStorage.getItem('marketState') || 'Choppy Market',
    canFlip: false,
    blackSwans: 0,
    coinFlipTimer: 60,
    timerInterval: null
};

let localState = {
    winStreak: 0,
    totalWins: 0,
    totalLosses: 0,
    isAnimating: false
};

// Constants for game configuration
const MARKET_WIN_RATES = {
    'Bull Market': 0.70,
    'Bear Market': 0.53,
    'Choppy Market': 0.60
};

const BLACK_SWAN_PROBABILITIES = {
    'Bull Market': 0.01,
    'Bear Market': 0.05,
    'Choppy Market': 0.10
};

// Sound effects configuration
const SOUNDS = {
    flip: new Audio('/sound/coin-flip.mp3'),
    win: new Audio('/sound/win.mp3'),
    lose: new Audio('/sound/lose.mp3'),
    blackSwan: new Audio('/sound/black-swan.mp3'),
    hover: new Audio('/sound/hover.mp3'),
    click: new Audio('/sound/click.mp3')
};

Object.values(SOUNDS).forEach(sound => {
    sound.volume = 0.4;
});

// Initialize coin flip functionality
function initializeCoinFlip() {
    console.log('Initializing coin flip game');
    gameState.canFlip = true;
    setupEventListeners();
    updateMarketDisplay();
    startTimer();
    updateGoldDisplay();
    updateStatistics();
}

function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Back button
    const backButton = document.querySelector('.back-button-icon3');
    if (backButton) {
        backButton.addEventListener('click', () => {
            SOUNDS.click.currentTime = 0;
            SOUNDS.click.play().catch(() => {});
            window.location.href = 'index.html';
        });
    }
    
    // Bet percentage buttons
    const betButtons = document.querySelectorAll('.bet-slider-value, .max-bet-values, .max-bet-values1, .max');
    console.log('Found bet buttons:', betButtons.length);
    
    betButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            console.log('Bet button clicked:', index);
            SOUNDS.click.currentTime = 0;
            SOUNDS.click.play().catch(() => {});
            const percentText = button.querySelector('div:not(.stone-slab2-13)').innerText;
            const percent = percentText === 'max' ? 100 : parseInt(percentText);
            const amount = Math.floor(gameState.gold * (percent / 100));
            const betInput = document.getElementById('bet-amount');
            betInput.value = amount.toString();
        });
        
        button.addEventListener('mouseenter', () => {
            SOUNDS.hover.currentTime = 0;
            SOUNDS.hover.play().catch(() => {});
        });
    });

    // Flip button
    const flipButton = document.querySelector('.cast-buton1');
    console.log('Found flip button:', flipButton);
    
    if (flipButton) {
        flipButton.addEventListener('click', () => {
            console.log('Flip button clicked');
            SOUNDS.click.currentTime = 0;
            SOUNDS.click.play().catch(() => {});
            handleCoinFlip();
        });
        
        flipButton.addEventListener('mouseenter', () => {
            SOUNDS.hover.currentTime = 0;
            SOUNDS.hover.play().catch(() => {});
        });
    } else {
        console.error('Flip button not found');
    }
}

async function handleCoinFlip() {
    console.log('Handling coin flip');
    
    if (!gameState.canFlip || localState.isAnimating) {
        console.log('Cannot flip: canFlip =', gameState.canFlip, 'isAnimating =', localState.isAnimating);
        return;
    }
    
    const betAmount = validateBet();
    if (!betAmount) {
        console.log('Invalid bet amount');
        return;
    }
    
    localState.isAnimating = true;
    gameState.canFlip = false;
    
    const coin = document.getElementById('coin');
    if (!coin) {
        console.log('Coin element not found');
        return;
    }
    
    // Determine result based on market conditions
    const result = determineFlipResult();
    console.log('Flip result:', result);
    
    // Animate coin flip
    await animateCoinFlip(coin, result);
    
    // Process result
    processFlipResult(result, betAmount);
    
    // Reset for next flip
    localState.isAnimating = false;
    gameState.canFlip = true;
    updateStatistics();
}

function validateBet() {
    const betElement = document.getElementById('bet-amount');
    const betAmount = parseInt(betElement.value);
    const maxBet = gameState.gold;
    
    if (isNaN(betAmount) || betAmount <= 0) {
        console.log('Invalid bet amount:', betAmount);
        betElement.value = '0';
        return null;
    }
    
    if (betAmount > maxBet) {
        console.log('Insufficient gold for bet:', betAmount, 'gold:', gameState.gold);
        betElement.value = previousValue;
        showFloatingText('Insufficient Gold!', 'loss');
        SOUNDS.lose.play().catch(() => {});
        return null;
    }
    
    return betAmount;
}

// Add event listener for manual bet input
document.addEventListener('DOMContentLoaded', () => {
    const betElement = document.getElementById('bet-amount');
    let previousValue = betElement.value || '0';
    
    // Handle input validation
    betElement.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        // Handle empty or invalid input
        if (value === '' || value === '0') {
            previousValue = '0';
            e.target.value = previousValue;
            return;
        }
        
        // Convert to number and check limits
        let numValue = parseInt(value);
        if (numValue > gameState.gold) {
            e.target.value = previousValue;
            return;
        }
        
        previousValue = numValue.toString();
        e.target.value = previousValue;
    });
    
    // Handle focus
    betElement.addEventListener('focus', (e) => {
        setTimeout(() => e.target.select(), 0);
        previousValue = e.target.value;
    });
    
    // Handle blur
    betElement.addEventListener('blur', (e) => {
        let value = e.target.value;
        if (value === '' || parseInt(value) === 0) {
            previousValue = '0';
            e.target.value = previousValue;
        }
        previousValue = e.target.value;
    });
});

function determineFlipResult() {
    const random = Math.random();
    const winRate = MARKET_WIN_RATES[gameState.marketState];
    const isWin = random < winRate;
    
    // Check for Black Swan event
    const blackSwanChance = BLACK_SWAN_PROBABILITIES[gameState.marketState];
    const isBlackSwan = !isWin && (Math.random() < blackSwanChance);
    
    return {
        isWin,
        isBlackSwan
    };
}

async function animateCoinFlip(coin, result) {
    console.log('Animating coin flip');
    return new Promise(resolve => {
        // Reset coin state
        coin.style.transition = 'none';
        coin.style.transform = 'rotateY(0deg)';
        coin.style.opacity = '1';
        coin.offsetHeight; // Force reflow
        
        // Add flipping class for animation
        coin.classList.add('flipping');
        SOUNDS.flip.currentTime = 0;
        SOUNDS.flip.play().catch(() => {});
        
        // Calculate rotations for more dynamic animation
        const minRotations = 5;
        const randomRotations = Math.floor(Math.random() * 3); // 0-2 additional rotations
        const totalRotations = minRotations + randomRotations;
        const finalRotationY = (totalRotations * 360) + (result.isWin ? 0 : 180);
        const wobbleX = (Math.random() - 0.5) * 20; // Small random tilt
        
        // Apply the rotation with a slight wobble
        coin.style.transition = 'transform 3s cubic-bezier(0.645, 0.045, 0.355, 1)';
        coin.style.transform = `rotateY(${finalRotationY}deg) rotateX(${wobbleX}deg)`;
        
        setTimeout(() => {
            coin.classList.remove('flipping');
            console.log('Coin flip animation complete');
            resolve();
        }, 3000);
    });
}

function processFlipResult(result, betAmount) {
    console.log('Processing flip result');
    
    if (result.isBlackSwan) {
        handleBlackSwanEvent();
    } else if (result.isWin) {
        const winAmount = betAmount * 2;
        gameState.gold += winAmount;
        localState.winStreak++;
        localState.totalWins++;
        SOUNDS.win.currentTime = 0;
        SOUNDS.win.play().catch(() => {});
        showFloatingText(`+${winAmount}`, 'win');
    } else {
        gameState.gold -= betAmount;
        localState.winStreak = 0;
        localState.totalLosses++;
        SOUNDS.lose.currentTime = 0;
        SOUNDS.lose.play().catch(() => {});
        showFloatingText(`-${betAmount}`, 'loss');
    }
    
    // Save gold to localStorage
    localStorage.setItem('playerGold', gameState.gold.toString());
    
    updateGoldDisplay();
    
    // Check for game over
    if (gameState.gold <= 0) {
        handleGameOver();
    }
}

function showFloatingText(text, type) {
    const betResultElement = document.getElementById('bet-result');
    if (!betResultElement) return;
    
    // Clear any existing animation
    betResultElement.style.animation = 'none';
    betResultElement.offsetHeight; // Force reflow

    // Set new text and class
    betResultElement.textContent = text;
    betResultElement.className = `bet-result ${type}`;

    // Start new animation
    betResultElement.style.animation = 'fadeInOut 1s ease-out forwards';

    // Reset class after animation
    setTimeout(() => {
        betResultElement.className = 'bet-result';
    }, 1500);
}

function createResultParticles(container, type, count = 20) {
    console.log('Creating result particles');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = `result-particle ${type}`;
        
        // Random starting position around the center
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const distance = Math.random() * 50;
        const startX = Math.cos(angle) * distance;
        const startY = Math.sin(angle) * distance;
        
        // Random end position
        const endDistance = 100 + Math.random() * 100;
        const endX = Math.cos(angle) * endDistance;
        const endY = Math.sin(angle) * endDistance;
        
        particle.style.left = `calc(50% + ${startX}px)`;
        particle.style.top = `calc(50% + ${startY}px)`;
        
        container.appendChild(particle);
        
        // Animate the particle
        particle.animate([
            {
                transform: `translate(0, 0) scale(1)`,
                opacity: 1
            },
            {
                transform: `translate(${endX}px, ${endY}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 500 + Math.random() * 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        });
        
        // Remove particle after animation
        setTimeout(() => particle.remove(), 1000);
    }
}

function handleBlackSwanEvent() {
    console.log('Handling black swan event');
    
    const lossAmount = Math.floor(gameState.gold * 0.5);
    gameState.gold -= lossAmount;
    gameState.blackSwans++;
    SOUNDS.blackSwan.currentTime = 0;
    SOUNDS.blackSwan.play().catch(() => {});
    
    // Save updated gold to localStorage
    localStorage.setItem('playerGold', gameState.gold.toString());
    
    const modal = document.createElement('div');
    modal.className = 'black-swan-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="swan-animation">🦢</div>
            <h2>Black Swan Event!</h2>
            <p>A rare catastrophe has struck the market!</p>
            <div class="loss-amount">-${lossAmount} Gold</div>
            <button class="close-modal">Continue</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('visible'), 100);
    
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        SOUNDS.click.currentTime = 0;
        SOUNDS.click.play().catch(() => {});
        modal.classList.remove('visible');
        setTimeout(() => modal.remove(), 300);
    });
    
    updateGoldDisplay();
}

function handleGameOver() {
    console.log('Game over - redirecting to stats page');
    gameState.canFlip = false;
    clearInterval(gameState.timerInterval);

    // Save final gold to localStorage
    localStorage.setItem('playerGold', gameState.gold.toString());

    // Save game stats
    const gameStats = {
        finalGold: gameState.gold,
        totalWins: localState.totalWins,
        totalLosses: localState.totalLosses,
        blackSwans: gameState.blackSwans,
        winStreak: localState.winStreak,
        winRate: Math.round((localState.totalWins / (localState.totalWins + localState.totalLosses)) * 100) || 0,
        marketState: gameState.marketState
    };
    localStorage.setItem('gameStats', JSON.stringify(gameStats));

    // Redirect to stats page
    window.location.href = 'stats.html';
}

function startTimer() {
    console.log('Starting timer');
    
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    
    gameState.coinFlipTimer = 60;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.coinFlipTimer--;
        updateTimerDisplay();
        
        if (gameState.coinFlipTimer <= 0) {
            clearInterval(gameState.timerInterval);
            handleGameOver();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = gameState.coinFlipTimer;
    }
}

function updateGoldDisplay() {
    console.log('Updating gold display:', gameState.gold);
    const goldDisplay = document.getElementById('gold-display');
    if (goldDisplay) {
        goldDisplay.textContent = gameState.gold.toLocaleString();
    }
}

function updateStatistics() {
    console.log('Updating statistics');
    // Update win streak
    document.getElementById('win-streak-display').textContent = localState.winStreak;
    
    // Update win rate
    const total = localState.totalWins + localState.totalLosses;
    const winRate = total === 0 ? MARKET_WIN_RATES[gameState.marketState] * 100 : Math.round((localState.totalWins / total) * 100);
    document.getElementById('win-rate-display').textContent = winRate + '%';
}

function updateMarketDisplay() {
    console.log('Updating market display:', gameState.marketState);
    const marketText = document.querySelector('.bull-market');
    const marketIcon = document.querySelector('.bull-icon');
    
    if (marketText && marketIcon) {
        marketText.textContent = gameState.marketState.replace(' Market', '');
        
        // Update icon based on market state
        switch (gameState.marketState) {
            case 'Bull Market':
                marketIcon.src = './public/bull@2x.png'; break;
            case 'Bear Market':
                marketIcon.src = './public/bear@2x.png'; break;
            case 'Choppy Market':
                marketIcon.src = './public/wave@2x.png'; break;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game');
    initializeCoinFlip();
});
