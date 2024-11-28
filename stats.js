document.addEventListener('DOMContentLoaded', () => {
    // Get stats from localStorage
    const gameStats = JSON.parse(localStorage.getItem('gameStats') || '{}');
    const initialGold = 100; // Starting gold amount
    
    // Calculate stats
    const stats = {
        winRate: `${gameStats.winRate || 0}%`,
        bestStreak: gameStats.winStreak || 0,
        totalBets: (gameStats.totalWins || 0) + (gameStats.totalLosses || 0),
        blackSwans: gameStats.blackSwans || 0,
        goldChange: calculateGoldChange(gameStats.finalGold || 0, initialGold),
        finalGold: gameStats.finalGold || initialGold
    };

    // Update stats display
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 6) {
        statValues[0].textContent = stats.winRate;
        statValues[1].textContent = stats.bestStreak;
        statValues[2].textContent = stats.totalBets;
        statValues[3].textContent = stats.blackSwans;
        statValues[4].textContent = stats.goldChange;
        statValues[5].textContent = stats.finalGold;
    }

    // Determine player style and message
    const { style, message } = determinePlayerStyle(stats);

    // Update style and message
    document.querySelector('.player-title').textContent = style;
    document.querySelector('.player-message').textContent = message;

    // Add continue button functionality
    document.querySelector('.continue-button').addEventListener('click', () => {
        // Clear stats from localStorage
        localStorage.removeItem('gameStats');
        // Redirect back to coinflip
        window.location.href = 'shop-page.html';
    });
});

function calculateGoldChange(finalGold, initialGold) {
    const percentChange = finalGold <= 0 ? -100 : ((finalGold - initialGold) / initialGold) * 100;
    return `${Math.round(percentChange)}%`;
}

function determinePlayerStyle(stats) {
    const winRate = parseInt(stats.winRate);
    const goldChangePercent = parseInt(stats.goldChange);
    const totalBets = stats.totalBets;

    if (winRate >= 65 && goldChangePercent > 200) {
        return {
            style: 'MASTER TRADER',
            message: 'Your calculated approach and high win rate led to exceptional profits'
        };
    } else if (goldChangePercent >= 100) {
        return {
            style: 'RISK TAKER',
            message: 'Your aggressive betting style showed courage, but also exposed you to higher risks'
        };
    } else if (winRate >= 50 && goldChangePercent > 0) {
        return {
            style: 'STEADY HAND',
            message: 'You maintained a balanced approach, focusing on consistent gains'
        };
    } else if (totalBets >= 15) {
        return {
            style: 'PERSISTENT',
            message: 'You showed determination despite the challenges. Keep refining your strategy'
        };
    } else {
        return {
            style: 'LEARNER',
            message: 'Every trade is a lesson. Keep practicing your market analysis'
        };
    }
}
