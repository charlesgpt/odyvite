document.addEventListener('DOMContentLoaded', () => {
    // Initialize shop state
    const shopState = {
        gold: 0,
        purchasedItems: []
    };

    // Define shop items
    const shopItems = {
        oracleScroll: {
            id: 'oracle-scroll',
            name: 'Oracle Scroll',
            price: 300,
            description: 'Reveals the next market state'
        },
        divineShield: {
            id: 'divine-shield',
            name: 'Divine Shield',
            price: 300,
            description: 'Protects against one black swan event'
        },
        fortunePotion: {
            id: 'fortune-potion',
            name: 'Fortune Potion',
            price: 300,
            description: 'Increases your next win payout by 50%'
        }
    };

    // Sound effects
    const SOUNDS = {
        click: new Audio('./public/sound/click.mp3'),
        hover: new Audio('./public/sound/hover.mp3')
    };

    Object.values(SOUNDS).forEach(sound => {
        sound.volume = 0.4;
    });

    // Load game state from localStorage
    function loadGameState() {
        const savedGold = localStorage.getItem('playerGold');
        shopState.gold = savedGold ? parseInt(savedGold) : 0;
        shopState.purchasedItems = JSON.parse(localStorage.getItem('purchasedItems') || '[]');
        
        updateGoldDisplay();
        updateShopDisplay();
    }

    // Update gold display
    function updateGoldDisplay() {
        const goldDisplay = document.querySelector('.overlayborderoverlayblur');
        if (goldDisplay) {
            goldDisplay.textContent = shopState.gold.toLocaleString();
        }
    }

    // Update shop display
    function updateShopDisplay() {
        // Update Oracle Scroll
        const oracleScrollPrice = document.querySelector('.oracle-price .overlay');
        if (oracleScrollPrice) {
            oracleScrollPrice.textContent = shopItems.oracleScroll.price;
        }

        // Update Divine Shield
        const divineShieldPrice = document.querySelector('.shield-price-acquired .oracle-price .overlay');
        if (divineShieldPrice) {
            divineShieldPrice.textContent = shopItems.divineShield.price;
        }

        // Update Fortune Potion
        const fortunePotionButton = document.querySelector('.button-parent');
        if (fortunePotionButton) {
            const isAcquired = shopState.purchasedItems.includes('fortune-potion');
            fortunePotionButton.innerHTML = isAcquired ? 
                '<div class="acquired">Acquired</div>' :
                `<img class="button-icon" alt="" src="./public/file-10-1@2x.png" />
                 <img class="coin-icon3" loading="lazy" alt="" src="./public/coin-1@2x.png" />
                 <div class="oracle-price">
                     <div class="overlay">${shopItems.fortunePotion.price}</div>
                 </div>`;
        }
    }

    // Handle item purchase
    function handlePurchase(itemId) {
        const item = shopItems[itemId];
        if (!item) return;

        if (shopState.purchasedItems.includes(itemId)) {
            showMessage('Item already purchased!', 'error');
            return;
        }

        if (shopState.gold < item.price) {
            showMessage('Not enough gold!', 'error');
            return;
        }

        // Process purchase
        shopState.gold -= item.price;
        shopState.purchasedItems.push(itemId);

        // Update localStorage
        localStorage.setItem('playerGold', shopState.gold.toString());
        localStorage.setItem('purchasedItems', JSON.stringify(shopState.purchasedItems));

        // Show message
        showMessage(`${item.name} purchased!`, 'success');

        // Update displays
        updateGoldDisplay();
        updateShopDisplay();
    }

    // Show floating message
    function showMessage(text, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `floating-message ${type}`;
        messageElement.textContent = text;
        messageElement.style.position = 'fixed';
        messageElement.style.top = '50%';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translate(-50%, -50%)';
        messageElement.style.color = type === 'error' ? '#ff4444' : '#44ff44';
        messageElement.style.fontSize = '24px';
        messageElement.style.fontFamily = 'GemFont One';
        messageElement.style.zIndex = '1000';
        messageElement.style.pointerEvents = 'none';
        messageElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        messageElement.style.animation = 'fadeOut 2s forwards';

        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 2000);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Back button
        const backButton = document.querySelector('.back-button-icon1');
        if (backButton) {
            backButton.addEventListener('click', () => {
                SOUNDS.click.play().catch(() => {});
                window.location.href = 'coinflip.html';
            });
            
            backButton.addEventListener('mouseenter', () => {
                SOUNDS.hover.play().catch(() => {});
            });
        }

        // Oracle Scroll purchase
        const oracleScroll = document.querySelector('.oracle-buy');
        if (oracleScroll) {
            oracleScroll.addEventListener('click', () => {
                SOUNDS.click.play().catch(() => {});
                handlePurchase('oracleScroll');
            });
        }

        // Divine Shield purchase
        const divineShield = document.querySelector('.shield-price-acquired');
        if (divineShield) {
            divineShield.addEventListener('click', () => {
                SOUNDS.click.play().catch(() => {});
                handlePurchase('divineShield');
            });
        }

        // Fortune Potion purchase
        const fortunePotion = document.querySelector('.button-parent');
        if (fortunePotion) {
            fortunePotion.addEventListener('click', () => {
                SOUNDS.click.play().catch(() => {});
                handlePurchase('fortunePotion');
            });
        }

        // Add hover effects
        document.querySelectorAll('.oracle-buy, .shield-price-acquired, .button-parent').forEach(element => {
            element.addEventListener('mouseenter', () => {
                SOUNDS.hover.play().catch(() => {});
                element.style.transform = 'scale(1.1)';
                element.style.transition = 'transform 0.2s ease';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });
    }

    // Add fadeOut animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            75% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }

        .floating-message {
            animation: fadeOut 2s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    // Initialize shop
    loadGameState();
    setupEventListeners();
});
