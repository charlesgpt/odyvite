// Storage keys
const QUEST_STATES_KEY = 'questStates';
const GOLD_KEY = 'playerGold';  // Using same key as shop.js

// Quest configurations
const QUESTS = {
  twitter: {
    id: 'twitter',
    reward: 300,
    url: 'https://twitter.com/odysseygame'
  },
  youtube: {
    id: 'youtube',
    reward: 300,
    url: 'https://youtube.com/@odysseygame'
  }
};

// Initialize storage if not exists
function initializeStorage() {
  if (!localStorage.getItem(QUEST_STATES_KEY)) {
    localStorage.setItem(QUEST_STATES_KEY, JSON.stringify({}));
  }
  if (!localStorage.getItem(GOLD_KEY)) {
    localStorage.setItem(GOLD_KEY, '0');
  }
}

// Initialize on load
initializeStorage();

// Get gold balance
function getGold() {
  return parseInt(localStorage.getItem(GOLD_KEY) || '0');
}

// Update gold balance
function updateGold(amount) {
  const currentGold = getGold();
  localStorage.setItem(GOLD_KEY, (currentGold + amount).toString());
  updateGoldDisplay();
}

// Update gold display on page
function updateGoldDisplay() {
  const goldDisplay = document.getElementById('gold-display');
  if (goldDisplay) {
    goldDisplay.textContent = getGold().toLocaleString();
  }
}

// Check if quest is completed
function isQuestCompleted(questId) {
  const states = JSON.parse(localStorage.getItem(QUEST_STATES_KEY));
  return states[questId] === true;
}

// Mark quest as completed
function completeQuest(questId) {
  const states = JSON.parse(localStorage.getItem(QUEST_STATES_KEY));
  states[questId] = true;
  localStorage.setItem(QUEST_STATES_KEY, JSON.stringify(states));
}

// Show floating message
function showMessage(text, type = 'success') {
  const message = document.createElement('div');
  message.className = `floating-message ${type}`;
  message.textContent = text;
  document.body.appendChild(message);

  // Play sound effect
  const sound = new Audio('./public/sound/click.mp3');
  sound.volume = 0.4;
  sound.play().catch(() => {});

  // Remove message after animation
  setTimeout(() => {
    message.remove();
  }, 2000);
}

// Handle claim button click
function handleClaim(questId) {
  const quest = QUESTS[questId];
  if (!quest) return;

  if (isQuestCompleted(questId)) {
    showMessage('Quest already completed!', 'error');
    return;
  }

  // Open social media link
  window.open(quest.url, '_blank');

  // Award gold and mark quest as completed
  updateGold(quest.reward);
  completeQuest(questId);
  showMessage(`+${quest.reward} Gold!`);

  // Update button state
  const button = document.querySelector(`[data-quest="${questId}"]`);
  if (button) {
    button.classList.add('completed');
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Update gold display
  updateGoldDisplay();

  // Add click handlers to claim buttons
  document.querySelectorAll('.button-img-icon').forEach(button => {
    const questItem = button.closest('.quest-1, .quest-2');
    if (!questItem) return;

    const questId = questItem === document.querySelector('.quest-1') ? 'twitter' : 'youtube';
    
    button.addEventListener('click', () => handleClaim(questId));

    // Update initial button state
    if (isQuestCompleted(questId)) {
      button.classList.add('completed');
    }
  });

  // Add click handler to back button
  const backButton = document.querySelector('.back-button-icon4');
  if (backButton) {
    backButton.addEventListener('click', () => {
      const sound = new Audio('./public/sound/click.mp3');
      sound.volume = 0.4;
      sound.play().catch(() => {});
      window.location.href = './index.html';
    });
  }

  // Add hover sound effects
  document.querySelectorAll('.button-img-icon, .back-button-icon4, .settings-button-icon4').forEach(element => {
    element.addEventListener('mouseenter', () => {
      const sound = new Audio('./public/sound/hover.mp3');
      sound.volume = 0.4;
      sound.play().catch(() => {});
    });
  });
});
