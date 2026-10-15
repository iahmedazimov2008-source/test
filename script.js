// --- GAME STATE ---
const state = {
    balance: 10000,
    wonToday: 0,
    gamesPlayed: 0,
    currentGame: 'lobby',
    history: []
};

// --- DOM ELEMENTS ---
const balanceEl = document.getElementById('balance');
const wonTodayEl = document.getElementById('won-today');
const gamesPlayedEl = document.getElementById('games-played');
const historyList = document.getElementById('history-list');
const winOverlay = document.getElementById('win-overlay');
const winText = document.getElementById('win-text');
const winAmount = document.getElementById('win-amount');

// --- NAVIGATION ---
const navBtns = document.querySelectorAll('.nav-btn');
const gameSections = document.querySelectorAll('.game-section');
const gameCards = document.querySelectorAll('.game-card');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchGame(btn.dataset.game));
});

gameCards.forEach(card => {
    card.addEventListener('click', () => switchGame(card.dataset.game));
});

function switchGame(game) {
    state.currentGame = game;
    
    navBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-game="${game}"]`)?.classList.add('active');
    
    gameSections.forEach(section => section.classList.remove('active'));
    document.getElementById(game).classList.add('active');
}

// --- BALANCE MANAGEMENT ---
function updateBalance(amount) {
    state.balance += amount;
    balanceEl.textContent = state.balance;
    
    if (amount > 0) {
        state.wonToday += amount;
        wonTodayEl.textContent = state.wonToday;
    }
    
    state.gamesPlayed++;
    gamesPlayedEl.textContent = state.gamesPlayed;
}

function addToHistory(game, bet, result, win) {
    const item = document.createElement('div');
    item.className = `history-item ${win ? 'win' : 'lose'}`;
    item.innerHTML = `
        <span>${game}</span>
        <span>${win ? '+' : '-'}${bet}</span>
    `;
    
    if (historyList.querySelector('.empty')) {
        historyList.innerHTML = '';
    }
    
    historyList.insertBefore(item, historyList.firstChild);
    
    if (historyList.children.length > 20) {
        historyList.removeChild(historyList.lastChild);
    }
}

function showWin(amount) {
    winText.textContent = amount >= 1000 ? 'JACKPOT!' : 'BIG WIN!';
    winAmount.textContent = `+${amount}`;
    winOverlay.classList.add('show');
    
    setTimeout(() => {
        winOverlay.classList.remove('show');
    }, 3000);
}

// --- SLOTS GAME ---
const symbols = ['7', '💎', '', '🍋', '⭐', '🔔'];
let slotBet = 100;
let isSpinning = false;

const slotBetAmount = document.getElementById('bet-amount');
const spinBtn = document.getElementById('spin-btn');
const slotResult = document.getElementById('slot-result');

document.getElementById('bet-increase').addEventListener('click', () => {
    if (slotBet < 1000 && slotBet < state.balance) {
        slotBet += 100;
        slotBetAmount.textContent = slotBet;
    }
});

document.getElementById('bet-decrease').addEventListener('click', () => {
    if (slotBet > 100) {
        slotBet -= 100;
        slotBetAmount.textContent = slotBet;
    }
});

spinBtn.addEventListener('click', spinSlots);

function spinSlots() {
    if (isSpinning || slotBet > state.balance) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    slotResult.textContent = '';
    slotResult.className = 'slot-result';
    
    updateBalance(-slotBet);
    
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    const results = [];
    const spinDuration = [1000, 1500, 2000];
    
    reels.forEach((reel, index) => {
        reel.classList.add('spinning');
        
        const interval = setInterval(() => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.querySelector('.symbol').textContent = randomSymbol;
        }, 100);
        
        setTimeout(() => {
            clearInterval(interval);
            reel.classList.remove('spinning');
            const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.querySelector('.symbol').textContent = finalSymbol;
            results.push(finalSymbol);
            
            if (results.length === 3) {
                checkSlotWin(results);
            }
        }, spinDuration[index]);
    });
}

function checkSlotWin(results) {
    let win = 0;
    let message = '';
    
    if (results[0] === results[1] && results[1] === results[2]) {
        // Джекпот - три одинаковых
        if (results[0] === '7') {
            win = slotBet * 100;
            message = '🎰 JACKPOT! THREE 7s!';
        } else if (results[0] === '💎') {
            win = slotBet * 50;
            message = '💎 MEGA WIN! THREE DIAMONDS!';
        } else {
            win = slotBet * 20;
            message = `🎉 BIG WIN! THREE ${results[0]}s!`;
        }
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        // Два одинаковых
        win = slotBet * 3;
        message = '✨ Small Win! Two matching!';
    } else {
        message = '😔 No win. Try again!';
    }
    
    if (win > 0) {
        updateBalance(win);
        slotResult.textContent = `${message} +${win}`;
        slotResult.className = 'slot-result result-win';
        addToHistory('SLOTS', slotBet, win, true);
        
        if (win >= 1000) {
            showWin(win);
        }
    } else {
        slotResult.textContent = message;
        slotResult.className = 'slot-result result-lose';
        addToHistory('SLOTS', slotBet, 0, false);
    }
    
    isSpinning = false;
    spinBtn.disabled = false;
}

// --- ROULETTE GAME ---
const colors = ['red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'green'];
let rouletteBet = 100;
let selectedColor = null;
let isRouletteSpinning = false;

const rouletteBetAmount = document.getElementById('roulette-bet-amount');
const rouletteSpinBtn = document.getElementById('roulette-spin-btn');
const rouletteResult = document.getElementById('roulette-result');
const rouletteWheel = document.getElementById('roulette-wheel');
const colorBtns = document.querySelectorAll('.color-btn');

document.getElementById('roulette-bet-increase').addEventListener('click', () => {
    if (rouletteBet < 1000 && rouletteBet < state.balance) {
        rouletteBet += 100;
        rouletteBetAmount.textContent = rouletteBet;
    }
});

document.getElementById('roulette-bet-decrease').addEventListener('click', () => {
    if (rouletteBet > 100) {
        rouletteBet -= 100;
        rouletteBetAmount.textContent = rouletteBet;
    }
});

colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedColor = btn.dataset.color;
    });
});

rouletteSpinBtn.addEventListener('click', spinRoulette);

function spinRoulette() {
    if (isRouletteSpinning || !selectedColor || rouletteBet > state.balance) {
        if (!selectedColor) {
            rouletteResult.textContent = '️ Select a color first!';
            rouletteResult.className = 'roulette-result result-lose';
        }
        return;
    }
    
    isRouletteSpinning = true;
    rouletteSpinBtn.disabled = true;
    rouletteResult.textContent = '';
    rouletteResult.className = 'roulette-result';
    
    updateBalance(-rouletteBet);
    
    const randomIndex = Math.floor(Math.random() * colors.length);
    const resultColor = colors[randomIndex];
    const rotation = 1440 + (randomIndex * 10); // 4 полных оборота + позиция
    
    rouletteWheel.style.transform = `rotate(${rotation}deg)`;
    
    setTimeout(() => {
        checkRouletteWin(resultColor);
    }, 4000);
}

function checkRouletteWin(resultColor) {
    let win = 0;
    let message = '';
    
    if (resultColor === selectedColor) {
        if (resultColor === 'green') {
            win = rouletteBet * 14;
            message = '💚 GREEN HIT! MEGA WIN!';
        } else {
            win = rouletteBet * 2;
            message = `${resultColor.toUpperCase()} HIT! You win!`;
        }
    } else {
        message = ` ${resultColor.toUpperCase()} landed. You lose.`;
    }
    
    if (win > 0) {
        updateBalance(win);
        rouletteResult.textContent = `${message} +${win}`;
        rouletteResult.className = 'roulette-result result-win';
        addToHistory('ROULETTE', rouletteBet, win, true);
        
        if (win >= 1000) {
            showWin(win);
        }
    } else {
        rouletteResult.textContent = message;
        rouletteResult.className = 'roulette-result result-lose';
        addToHistory('ROULETTE', rouletteBet, 0, false);
    }
    
    isRouletteSpinning = false;
    rouletteSpinBtn.disabled = false;
}

// --- DICE GAME ---
const diceFaces = ['', '⚁', '', '⚃', '', '⚅'];
let diceBet = 100;
let selectedNumber = 7;
let isDiceRolling = false;

const diceBetAmount = document.getElementById('dice-bet-amount');
const diceRollBtn = document.getElementById('dice-roll-btn');
const diceResult = document.getElementById('dice-result');
const diceNumberSlider = document.getElementById('dice-number');
const diceNumberDisplay = document.getElementById('dice-number-display');
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');

document.getElementById('dice-bet-increase').addEventListener('click', () => {
    if (diceBet < 1000 && diceBet < state.balance) {
        diceBet += 100;
        diceBetAmount.textContent = diceBet;
    }
});

document.getElementById('dice-bet-decrease').addEventListener('click', () => {
    if (diceBet > 100) {
        diceBet -= 100;
        diceBetAmount.textContent = diceBet;
    }
});

diceNumberSlider.addEventListener('input', (e) => {
    selectedNumber = parseInt(e.target.value);
    diceNumberDisplay.textContent = selectedNumber;
});

diceRollBtn.addEventListener('click', rollDice);

function rollDice() {
    if (isDiceRolling || diceBet > state.balance) return;
    
    isDiceRolling = true;
    diceRollBtn.disabled = true;
    diceResult.textContent = '';
    diceResult.className = 'dice-result';
    
    updateBalance(-diceBet);
    
    dice1.classList.add('rolling');
    dice2.classList.add('rolling');
    
    const rollInterval = setInterval(() => {
        const random1 = Math.floor(Math.random() * 6);
        const random2 = Math.floor(Math.random() * 6);
        dice1.querySelector('.dice-face').textContent = diceFaces[random1];
        dice2.querySelector('.dice-face').textContent = diceFaces[random2];
    }, 100);
    
    setTimeout(() => {
        clearInterval(rollInterval);
        dice1.classList.remove('rolling');
        dice2.classList.remove('rolling');
        
        const final1 = Math.floor(Math.random() * 6) + 1;
        const final2 = Math.floor(Math.random() * 6) + 1;
        const total = final1 + final2;
        
        dice1.querySelector('.dice-face').textContent = diceFaces[final1 - 1];
        dice2.querySelector('.dice-face').textContent = diceFaces[final2 - 1];
        
        checkDiceWin(total);
    }, 2000);
}

function checkDiceWin(total) {
    let win = 0;
    let message = '';
    
    if (total === selectedNumber) {
        win = diceBet * 5;
        message = `🎲 Perfect! You rolled ${total}!`;
    } else {
        message = `😔 You rolled ${total}, needed ${selectedNumber}`;
    }
    
    if (win > 0) {
        updateBalance(win);
        diceResult.textContent = `${message} +${win}`;
        diceResult.className = 'dice-result result-win';
        addToHistory('DICE', diceBet, win, true);
        
        if (win >= 1000) {
            showWin(win);
        }
    } else {
        diceResult.textContent = message;
        diceResult.className = 'dice-result result-lose';
        addToHistory('DICE', diceBet, 0, false);
    }
    
    isDiceRolling = false;
    diceRollBtn.disabled = false;
}

// --- INITIALIZATION ---
console.log('🎰 NEON VEGAS Casino loaded!');
console.log('💰 Starting balance: 10000 credits');