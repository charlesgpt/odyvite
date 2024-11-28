// Storage keys
const GOLD_KEY = 'playerGold';
const PURCHASED_ITEMS_KEY = 'purchasedItems';
const GAME_STATS_KEY = 'gameStats';

// Sound effects
const SOUNDS = {
    hover: new Audio('./public/sound/hover.mp3'),
    click: new Audio('./public/sound/click.mp3')
};

Object.values(SOUNDS).forEach(sound => {
    sound.volume = 0.4;
});

// Get player stats
function getPlayerStats() {
    const stats = JSON.parse(localStorage.getItem(GAME_STATS_KEY) || '{}');
    return {
        totalWins: stats.totalWins || 0,
        totalGames: (stats.totalWins || 0) + (stats.totalLosses || 0),
        winRate: stats.winRate || 0,
        winStreak: stats.winStreak || 0,
        blackSwans: stats.blackSwans || 0,
        marketState: stats.marketState || 'Choppy Market'
    };
}

// Get purchased items
function getPurchasedItems() {
    return JSON.parse(localStorage.getItem(PURCHASED_ITEMS_KEY) || '[]');
}

// Update gold display
function updateGoldDisplay() {
    const goldDisplay = document.querySelector('.coin-icon1');
    if (goldDisplay) {
        const gold = localStorage.getItem(GOLD_KEY) || '0';
        goldDisplay.textContent = parseInt(gold).toLocaleString();
    }
}

// Update battle stats
function updateBattleStats() {
    const stats = getPlayerStats();
    const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;
    
    // Update win rates
    document.querySelectorAll('.battle-icon, .coin-flip-icon, .helmet-icon, .coin-flip-stat').forEach(element => {
        element.textContent = `${winRate}%`;
    });

    // Update battle stats
    const statText = `${stats.totalWins}/${stats.totalGames}`;
    document.querySelectorAll('.battles-won p:first-child, .battles-won2 p:first-child').forEach(element => {
        element.textContent = statText;
    });

    // Update coin flip stats
    document.querySelectorAll('.successful-coin-flips-container p:first-child, .successful-coin-flips-container1 p:first-child').forEach(element => {
        element.textContent = statText;
    });
}

// Update items display
function updateItemsDisplay() {
    const purchasedItems = getPurchasedItems();
    const protectionItems = document.querySelector('.protection-items');
    
    if (protectionItems) {
        // Clear existing items
        protectionItems.innerHTML = '';
        
        // Add purchased items
        const items = {
            'divine-shield': {
                icon: './public/shield@2x.png',
                name: 'Divine Shield'
            },
            'oracle-scroll': {
                icon: './public/scroll-1@2x.png',
                name: 'Oracle Scroll'
            },
            'fortune-potion': {
                icon: './public/potion@2x.png',
                name: 'Fortune Potion'
            }
        };

        purchasedItems.forEach(itemId => {
            const item = items[itemId];
            if (item) {
                const itemElement = document.createElement('div');
                itemElement.className = 'item1';
                itemElement.innerHTML = `
                    <img class="shield-icon" loading="lazy" alt="" src="${item.icon}" />
                    <div class="loss-protection-wrapper">
                        <div class="loss-protection">
                            <p class="loss">Loss</p>
                            <p class="protection">Protection</p>
                        </div>
                    </div>
                `;
                protectionItems.appendChild(itemElement);
            }
        });
    }
}

// Add hover effects and sound
function addHoverEffects() {
    const interactiveElements = document.querySelectorAll('.back-button-icon, .settings-button-icon, .item1, .item2');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            SOUNDS.hover.currentTime = 0;
            SOUNDS.hover.play().catch(() => {});
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.2s ease';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
        });
    });
}

// Add click handlers
function addClickHandlers() {
    // Back button
    const backButton = document.querySelector('.back-button-icon');
    if (backButton) {
        backButton.addEventListener('click', () => {
            SOUNDS.click.currentTime = 0;
            SOUNDS.click.play().catch(() => {});
            window.location.href = './index.html';
        });
    }

    // Settings button
    const settingsButton = document.querySelector('.settings-button-icon');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            SOUNDS.click.currentTime = 0;
            SOUNDS.click.play().catch(() => {});
            // TODO: Implement settings functionality
        });
    }
}

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    updateGoldDisplay();
    updateBattleStats();
    updateItemsDisplay();
    addHoverEffects();
    addClickHandlers();
});
