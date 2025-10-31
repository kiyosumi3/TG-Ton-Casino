let tg = window.Telegram.WebApp;
let userData = {
    eggs: 1000,  // Икринки 
    stars: 100,
    level: 'brown',
    achievements: []
};

let slotBet = 10;
let castCount = 0;
let lastFreeSpin = 0;
let userGifts = [];

// Данные для слотов (NFT и подарки Telegram)
const slotSymbols = [
    { symbol: '🎁', type: 'gift', value: 1, name: 'Простой подарок' },
    { symbol: '🎀', type: 'gift', value: 1, name: 'Подарок с бантом' },
    { symbol: '🎉', type: 'gift', value: 2, name: 'Праздничный подарок' },
    { symbol: '💝', type: 'gift', value: 2, name: 'Сердечный подарок' },
    { symbol: '🛍️', type: 'gift', value: 3, name: 'Подарок из магазина' },
    { symbol: '🏆', type: 'nft', value: 5, name: 'NFT Трофей' },
    { symbol: '💎', type: 'nft', value: 10, name: 'NFT Алмаз' },
    { symbol: '👑', type: 'nft', value: 15, name: 'NFT Корона' },
    { symbol: '🚀', type: 'nft', value: 20, name: 'NFT Ракета' },
    { symbol: '⭐', type: 'nft', value: 25, name: 'NFT Звезда' }
];

// Кейсы
const casesData = {
    'rotten_tooth': {
        name: 'Гнилозубый кейс',
        price: 300,
        freeSpin: true,
        rewards: [
            { type: 'gift', amount: 15, chance: 0.4 },
            { type: 'gift', amount: 25, chance: 0.3 },
            { type: 'gift', amount: 50, chance: 0.2 },
            { type: 'gift', amount: 100, chance: 0.08 },
            { type: 'nft', amount: 450, chance: 0.02 }
        ]
    },
    'new_year': {
        name: 'Новогодний кейс',
        price: 700,
        rewards: [
            { type: 'gift', amount: 100, chance: 0.5 },
            { type: 'nft', amount: 600, chance: 0.4 },
            { type: 'nft', amount: 1000, chance: 0.1 }
        ]
    },
    'gem': {
        name: 'Гем кейс',
        price: 1500,
        rewards: [
            { type: 'nft', amount: 1000, chance: 0.7 },
            { type: 'nft', amount: 3000, chance: 0.3 }
        ]
    },
    'halloween': {
        name: 'Хеллоуин кейс',
        price: 3000,
        rewards: [
            { type: 'nft', amount: 2000, chance: 0.6 },
            { type: 'nft', amount: 5000, chance: 0.3 },
            { type: 'nft', amount: 7000, chance: 0.1 }
        ]
    },
    'barvikha': {
        name: 'Барвиха кейс',
        price: 5000,
        special: true,
        rewards: [
            { type: 'special', name: 'Автограф от модера', chance: 1.0 }
        ]
    },
    'glamour': {
        name: 'Гламурный кейс',
        price: 7000,
        rewards: [
            { type: 'nft', amount: 5000, chance: 0.8 },
            { type: 'nft', amount: 12000, chance: 0.2 }
        ]
    },
    'dark_horse': {
        name: 'Темная лошадка',
        price: 10000,
        rewards: [
            { type: 'nft', amount: 8000, chance: 0.9 },
            { type: 'nft', amount: 15000, chance: 0.1 }
        ]
    }
};

// Минки
let minesGame = {
    active: false,
    bet: 200,
    mines: 3,
    multiplier: 1.0,
    revealed: [],
    minesPositions: [],
    currentWin: 0
};

// Достижения
const achievementsData = {
    'first_catch': { 
        name: 'Первый улов', 
        desc: 'Первый вывод подарка',
        reward: 10000,
        condition: () => castCount >= 1 
    },
    'long_rod': { 
        name: 'Длинная удочка', 
        desc: '10 забросов',
        reward: 50000,
        condition: () => castCount >= 10 
    },
    'fat_fisherman': { 
        name: 'Толстый рыбак', 
        desc: '10к донат звезд',
        reward: 500000,
        condition: () => userData.stars >= 10000 
    },
    'hat_trick': { 
        name: 'Шляпа', 
        desc: 'Выигрышная ставка на ноль',
        reward: 100000,
        condition: () => userData.achievements.includes('hat_trick') 
    },
    'hooked': { 
        name: 'Поймал на крючок', 
        desc: 'Пригласил 50 друзей',
        reward: 1000000,
        condition: () => userData.achievements.includes('hooked') 
    }
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    tg.enableClosingConfirmation();
    loadUserData();
    initRoulette();
    initMines();
    loadGiftsFromStorage();
    setInterval(updateFreeSpinTimer, 1000);
});

// Загрузка данных пользователя
function loadUserData() {
    // Здесь будет загрузка с сервера
    updateUI();
    checkAchievements();
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('anchorCount').textContent = userData.eggs.toLocaleString();
    document.getElementById('starCount').textContent = userData.stars.toLocaleString();
    document.getElementById('slotBet').textContent = slotBet;
    document.getElementById('castCount').textContent = castCount;
    
    updateEggColor();
    updateAchievementsDisplay();
}

// Система экранов
function showScreen(screenName) {
    // Скрыть все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показать выбранный экран
    document.querySelector(`.${screenName}-screen`).classList.add('active');
    
    // Обновить навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (screenName === 'main') {
        document.querySelector('.nav-item[onclick="showScreen(\'main\')"]').classList.add('active');
    }
}

// Система подарков
function addGift(type, value, name) {
    const gift = {
        id: Date.now(),
        type: type,
        value: value,
        name: name,
        timestamp: new Date().toISOString()
    };
    
    userGifts.push(gift);
    saveGiftsToStorage();
    showMessage(`🎁 Получен подарок: ${name} (${value} ⭐)`, 'win');
}

function saveGiftsToStorage() {
    localStorage.setItem('userGifts', JSON.stringify(userGifts));
}

function loadGiftsFromStorage() {
    const savedGifts = localStorage.getItem('userGifts');
    if (savedGifts) {
        userGifts = JSON.parse(savedGifts);
    }
}

// Рулетка
// Рулетка - новые переменные
let rouletteBetAmount = 100;
let currentRouletteBet = null;
let rouletteNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

// Инициализация рулетки
function initRoulette() {
    createWheelNumbers();
    updateRouletteUI();
}

function createWheelNumbers() {
    const wheel = document.getElementById('wheelNumbers');
    if (!wheel) return;
    
    wheel.innerHTML = '';
    
    rouletteNumbers.forEach((num, index) => {
        const angle = (index / rouletteNumbers.length) * 360;
        const numberDiv = document.createElement('div');
        numberDiv.className = `wheel-number ${getNumberColor(num)}`;
        numberDiv.textContent = num;
        numberDiv.style.transform = `rotate(${angle}deg)`;
        wheel.appendChild(numberDiv);
    });
}

function getNumberColor(num) {
    if (num === 0) return 'green';
    const redNumbers = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
    return redNumbers.includes(num) ? 'red' : 'black';
}

function updateRouletteUI() {
    const betDisplay = document.getElementById('currentRouletteBet');
    if (betDisplay) {
        betDisplay.textContent = `${rouletteBetAmount} ⭐`;
    }
    
    // Обновляем активные ставки
    document.querySelectorAll('.bet-area').forEach(area => {
        area.classList.remove('active');
    });
    
    if (currentRouletteBet) {
        const activeBet = document.querySelector(`[onclick="placeRouletteBet('${currentRouletteBet}')"]`);
        if (activeBet) {
            activeBet.classList.add('active');
        }
    }
}

function changeRouletteBet(amount) {
    rouletteBetAmount = Math.max(100, Math.min(5000, rouletteBetAmount + amount));
    updateRouletteUI();
}

function placeRouletteBet(betType) {
    if (rouletteBetAmount > userData.stars) {
        showMessage('Недостаточно звезд!', 'error');
        return;
    }
    
    currentRouletteBet = betType;
    updateRouletteUI();
    showMessage(`Ставка: ${betType} - ${rouletteBetAmount} ⭐`, 'info');
}

function clearRouletteBet() {
    currentRouletteBet = null;
    updateRouletteUI();
    showMessage('Ставка очищена', 'info');
}

function spinRouletteWheel() {
    if (!currentRouletteBet) {
        showMessage('Сделайте ставку!', 'error');
        return;
    }
    
    if (rouletteBetAmount > userData.stars) {
        showMessage('Недостаточно звезд!', 'error');
        return;
    }
    
    // Снимаем ставку
    userData.stars -= rouletteBetAmount;
    updateUI();
    
    // Анимация вращения
    const wheel = document.getElementById('wheelNumbers');
    const spinDegrees = 3600 + Math.floor(Math.random() * 360);
    
    wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
    wheel.style.transform = `rotate(${spinDegrees}deg)`;
    
    // Определяем результат
    setTimeout(() => {
        const resultNumber = rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)];
        const isWin = checkRouletteWin(currentRouletteBet, resultNumber);
        
        if (isWin) {
            const winAmount = calculateRouletteWin(currentRouletteBet, rouletteBetAmount);
            userData.stars += winAmount;
            
            // Добавляем подарок за выигрыш
            addGift('gift', winAmount, `Выигрыш в рулетке (${resultNumber})`);
            
            showMessage(`🎉 Выигрыш! Число: ${resultNumber} | +${winAmount} ⭐`, 'win');
            
            // Проверка достижения "Шляпа"
            if (resultNumber === 0 && !userData.achievements.includes('hat_trick')) {
                userData.achievements.push('hat_trick');
                userData.eggs += 100000;
                showMessage('🏆 Достижение "Шляпа" разблокировано! +100,000 🐟', 'win');
            }
        } else {
            showMessage(`💸 Проигрыш. Число: ${resultNumber}`, 'lose');
        }
        
        updateUI();
        checkAchievements();
        currentRouletteBet = null;
        updateRouletteUI();
    }, 4000);
}

function checkRouletteWin(betType, resultNumber) {
    const isRed = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3].includes(resultNumber);
    const isBlack = resultNumber !== 0 && !isRed;
    
    switch(betType) {
        case 'zero':
            return resultNumber === 0;
        case 'red':
            return isRed;
        case 'black':
            return isBlack;
        case 'even':
            return resultNumber !== 0 && resultNumber % 2 === 0;
        case 'odd':
            return resultNumber !== 0 && resultNumber % 2 === 1;
        case '1st12':
            return resultNumber >= 1 && resultNumber <= 12;
        case '2nd12':
            return resultNumber >= 13 && resultNumber <= 24;
        case '3rd12':
            return resultNumber >= 25 && resultNumber <= 36;
        default:
            return false;
    }
}

function calculateRouletteWin(betType, betAmount) {
    const multipliers = {
        'zero': 36,
        'red': 2,
        'black': 2,
        'even': 2,
        'odd': 2,
        '1st12': 3,
        '2nd12': 3,
        '3rd12': 3
    };
    
    return betAmount * multipliers[betType];
}

// Рыбалка
function castRod(cost) {
    if (cost > userData.stars) {
        showMessage('Недостаточно звезд!', 'error');
        return;
    }
    
    userData.stars -= cost;
    castCount++;
    
    const pond = document.querySelector('.fish-school');
    const fish = document.createElement('div');
    fish.className = 'caught-fish';
    
    // Определение типа улова
    const luck = Math.random();
    let reward = 0;
    let fishType = '';
    let giftType = 'gift';
    let giftName = '';
    
    if (luck < 0.6) {
        reward = cost * 0.5; // Мелкая рыба
        fishType = '🐟';
        giftName = 'Мелкая рыба';
    } else if (luck < 0.9) {
        reward = cost * 1.5; // Средняя рыба
        fishType = '🐠';
        giftName = 'Средняя рыба';
    } else {
        reward = cost * 3; // Крупная рыба
        fishType = '🦈';
        giftName = 'Крупная рыба';
        giftType = 'nft';
    }
    
    fish.textContent = fishType;
    fish.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: ${20 + Math.random() * 60}%;
        font-size: 24px;
        animation: catch 2s ease-in-out;
    `;
    
    pond.appendChild(fish);
    
    setTimeout(() => {
        userData.stars += Math.floor(reward);
        userData.eggs += Math.floor(reward / 10); // Икринки вместо якоринок
        
        // Добавляем подарок
        addGift(giftType, Math.floor(reward), giftName);
        
        if (luck > 0.95) {
            showMessage(`🎣 Поймал NFT-рыбу! +${Math.floor(reward)} ⭐`, 'win');
        } else {
            showMessage(`🎣 Улов! +${Math.floor(reward)} ⭐`, 'win');
        }
        
        updateUI();
        checkAchievements();
        fish.remove();
    }, 2000);
}

// Слоты с NFT и подарками
function changeSlotBet(amount) {
    slotBet = Math.max(10, Math.min(userData.stars, slotBet + amount));
    updateUI();
}

function playSlots() {
    if (slotBet > userData.stars) {
        showMessage('Недостаточно звезд!', 'error');
        return;
    }
    
    userData.stars -= slotBet;
    updateUI();
    
    const slots = ['slot1', 'slot2', 'slot3'];
    let spins = 0;
    const maxSpins = 30;
    
    const spinInterval = setInterval(() => {
        slots.forEach(slotId => {
            const randomSymbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            document.getElementById(slotId).textContent = randomSymbol.symbol;
        });
        
        spins++;
        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            calculateSlotResult();
        }
    }, 80);
}

function calculateSlotResult() {
    const slot1 = document.getElementById('slot1').textContent;
    const slot2 = document.getElementById('slot2').textContent;
    const slot3 = document.getElementById('slot3').textContent;
    
    // Находим данные символов
    const symbol1 = slotSymbols.find(s => s.symbol === slot1);
    const symbol2 = slotSymbols.find(s => s.symbol === slot2);
    const symbol3 = slotSymbols.find(s => s.symbol === slot3);
    
    let win = 0;
    let message = '';
    let giftType = 'gift';
    let giftName = '';
    
    if (slot1 === slot2 && slot2 === slot3) {
        // Джекпот - все три одинаковые
        win = slotBet * symbol1.value * 5;
        giftType = symbol1.type;
        giftName = `${symbol1.name} x3`;
        message = `🎰 ДЖЕКПОТ! ${symbol1.name} x3! Выигрыш: ${win} ⭐`;
        
        // Добавляем подарок
        addGift(giftType, win, giftName);
        
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
        // Две одинаковые
        const matchingSymbol = slot1 === slot2 ? symbol1 : symbol3;
        win = slotBet * matchingSymbol.value * 2;
        giftType = matchingSymbol.type;
        giftName = `${matchingSymbol.name} x2`;
        message = `🎰 ${matchingSymbol.name} x2! Выигрыш: ${win} ⭐`;
        
        // Добавляем подарок
        addGift(giftType, win, giftName);
        
    } else if (symbol1.type === 'nft' || symbol2.type === 'nft' || symbol3.type === 'nft') {
        // Бонус за NFT
        const nftCount = [symbol1, symbol2, symbol3].filter(s => s.type === 'nft').length;
        win = slotBet * nftCount;
        giftType = 'nft';
        giftName = `NFT бонус (${nftCount} шт)`;
        message = `🎰 NFT бонус! Выигрыш: ${win} ⭐`;
        
        // Добавляем подарок
        addGift(giftType, win, giftName);
        
    } else {
        message = '🎰 Попробуйте еще раз!';
    }
    
    userData.stars += win;
    userData.eggs += Math.floor(win / 10); // Икринки за выигрыш
    
    if (win > 0) {
        showMessage(message, 'win');
    } else {
        showMessage(message, 'lose');
    }
    
    updateUI();
    checkAchievements();
}

// Кейсы
function openCase(caseId) {
    const caseData = casesData[caseId];
    
    // Проверка бесплатного прокрута
    if (caseId === 'rotten_tooth' && caseData.freeSpin) {
        const now = Date.now();
        const timeSinceLastSpin = now - lastFreeSpin;
        
        if (timeSinceLastSpin < 24 * 60 * 60 * 1000) {
            showMessage(`Бесплатный прокрут будет через ${formatTime(24 * 60 * 60 * 1000 - timeSinceLastSpin)}`, 'info');
            return;
        }
    }
    
    // Проверка баланса
    if (userData.stars < caseData.price && !(caseId === 'rotten_tooth' && caseData.freeSpin && timeSinceLastSpin >= 24 * 60 * 60 * 1000)) {
        showMessage('Недостаточно звезд!', 'error');
        return;
    }
    
    // Спин
    if (!(caseId === 'rotten_tooth' && caseData.freeSpin && timeSinceLastSpin >= 24 * 60 * 60 * 1000)) {
        userData.stars -= caseData.price;
    } else {
        lastFreeSpin = Date.now();
        updateFreeSpinTimer();
    }
    
    // Определение выигрыша
    const reward = getCaseReward(caseData);
    
    // Показ результата
    showCaseResult(caseData, reward);
    
    // Начисление выигрыша и добавление подарка
    if (reward.type === 'gift' || reward.type === 'nft') {
        userData.stars += reward.amount;
        userData.eggs += Math.floor(reward.amount / 10); // Икринки вместо якоринок
        
        // Добавляем подарок
        const giftType = reward.type === 'nft' ? 'nft' : 'gift';
        const giftName = caseData.name + (reward.type === 'nft' ? ' (NFT)' : '');
        addGift(giftType, reward.amount, giftName);
    } else if (reward.type === 'special') {
        // Особый приз
        addGift('special', 0, reward.name);
    }
    
    updateUI();
    checkAchievements();
}

function getCaseReward(caseData) {
    const random = Math.random();
    let cumulativeChance = 0;
    
    for (const reward of caseData.rewards) {
        cumulativeChance += reward.chance;
        if (random <= cumulativeChance) {
            return reward;
        }
    }
    
    return caseData.rewards[0];
}

function showCaseResult(caseData, reward) {
    const modal = document.getElementById('caseModal');
    const caseName = document.getElementById('modalCaseName');
    const caseReward = document.getElementById('caseReward');
    
    caseName.textContent = caseData.name;
    
    if (reward.type === 'special') {
        caseReward.innerHTML = `
            <div>🎁</div>
            <div class="reward-amount">${reward.name}!</div>
            <div>Особый приз!</div>
        `;
    } else {
        caseReward.innerHTML = `
            <div>🎁</div>
            <div class="reward-amount">+${reward.amount} ⭐</div>
            <div>${reward.type === 'nft' ? 'NFT-подарок!' : 'Подарок!'}</div>
        `;
    }
    
    modal.classList.add('active');
}

function closeCaseModal() {
    document.getElementById('caseModal').classList.remove('active');
}

function updateFreeSpinTimer() {
    const timerElement = document.getElementById('rottenTimer');
    if (!timerElement) return;
    
    const now = Date.now();
    const timeSinceLastSpin = now - lastFreeSpin;
    const timeUntilNextSpin = 24 * 60 * 60 * 1000 - timeSinceLastSpin;
    
    if (timeUntilNextSpin <= 0) {
        timerElement.textContent = 'Бесплатный прокрут доступен!';
    } else {
        timerElement.textContent = `Бесплатно через: ${formatTime(timeUntilNextSpin)}`;
    }
}

function formatTime(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Минки
function initMines() {
    const grid = document.getElementById('minesGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'mine-cell';
        cell.textContent = '💎';
        cell.onclick = () => revealMineCell(i);
        grid.appendChild(cell);
    }
}

function changeMinesBet(amount) {
    if (minesGame.active) return;
    
    minesGame.bet = Math.max(200, Math.min(10000, minesGame.bet + amount));
    updateMinesUI();
}

function changeMinesCount(amount) {
    if (minesGame.active) return;
    
    minesGame.mines = Math.max(1, Math.min(10, minesGame.mines + amount));
    updateMinesUI();
}

function updateMinesUI() {
    document.getElementById('minesBet').textContent = minesGame.bet;
    document.getElementById('minesCount').textContent = minesGame.mines;
    document.getElementById('minesMultiplier').textContent = minesGame.multiplier.toFixed(2) + 'x';
    document.getElementById('minesCurrentWin').textContent = minesGame.currentWin;
}

function startMinesGame() {
    if (minesGame.active || userData.stars < minesGame.bet) {
        showMessage('Недостаточно звезд или игра уже начата!', 'error');
        return;
    }
    
    userData.stars -= minesGame.bet;
    minesGame.active = true;
    minesGame.revealed = [];
    minesGame.currentWin = 0;
    minesGame.multiplier = 1.0;
    
    // Генерация мин
    minesGame.minesPositions = [];
    while (minesGame.minesPositions.length < minesGame.mines) {
        const pos = Math.floor(Math.random() * 25);
        if (!minesGame.minesPositions.includes(pos)) {
            minesGame.minesPositions.push(pos);
        }
    }
    
    document.getElementById('startMinesBtn').disabled = true;
    document.getElementById('cashoutBtn').disabled = false;
    
    updateUI();
    updateMinesUI();
    initMines();
}

function revealMineCell(index) {
    if (!minesGame.active || minesGame.revealed.includes(index)) return;
    
    minesGame.revealed.push(index);
    const cell = document.querySelectorAll('.mine-cell')[index];
    
    if (minesGame.minesPositions.includes(index)) {
        // Попал на мину
        cell.className = 'mine-cell mine';
        cell.textContent = '💣';
        endMinesGame(false);
    } else {
        // Безопасная ячейка
        cell.className = 'mine-cell revealed';
        cell.textContent = '💰';
        
        // Увеличиваем множитель
        const safeCells = 25 - minesGame.mines;
        const revealedSafe = minesGame.revealed.filter(pos => !minesGame.minesPositions.includes(pos)).length;
        minesGame.multiplier = (safeCells / (safeCells - revealedSafe)).toFixed(2);
        minesGame.currentWin = Math.floor(minesGame.bet * minesGame.multiplier);
        
        // Проверяем минимальную сумму для вывода
        if (minesGame.currentWin >= 500) {
            document.getElementById('cashoutBtn').disabled = false;
        }
        
        updateMinesUI();
    }
}

function cashoutMines() {
    if (!minesGame.active || minesGame.currentWin < 500) return;
    
    userData.stars += minesGame.currentWin;
    userData.eggs += Math.floor(minesGame.currentWin / 10); // Икринки за выигрыш
    
    // Добавляем подарок за выигрыш в минках
    addGift('gift', minesGame.currentWin, `Выигрыш в минках (коэф: ${minesGame.multiplier}x)`);
    
    endMinesGame(true);
}

function endMinesGame(isWin) {
    minesGame.active = false;
    
    // Показываем все мины
    minesGame.minesPositions.forEach(pos => {
        const cell = document.querySelectorAll('.mine-cell')[pos];
        if (!minesGame.revealed.includes(pos)) {
            cell.className = 'mine-cell mine';
            cell.textContent = '💣';
        }
    });
    
    document.getElementById('startMinesBtn').disabled = false;
    document.getElementById('cashoutBtn').disabled = true;
    
    if (isWin) {
        showMessage(`Вы выиграли ${minesGame.currentWin} ⭐!`, 'win');
    } else {
        showMessage('Вы наткнулись на мину!', 'lose');
    }
    
    updateUI();
    checkAchievements();
}

// Достижения
function checkAchievements() {
    Object.keys(achievementsData).forEach(achievementId => {
        if (!userData.achievements.includes(achievementId) && achievementsData[achievementId].condition()) {
            unlockAchievement(achievementId);
        }
    });
}

function unlockAchievement(achievementId) {
    userData.achievements.push(achievementId);
    const achievementData = achievementsData[achievementId];
    
    // Начисляем награду в икринках
    userData.eggs += achievementData.reward;
    
    showMessage(`🏆 Достижение "${achievementData.name}" разблокировано! +${achievementData.reward.toLocaleString()} 🐟`, 'win');
    updateAchievementsDisplay();
}

function updateAchievementsDisplay() {
    document.querySelectorAll('.achievement').forEach(achievementElement => {
        const achievementId = achievementElement.dataset.id;
        const statusElement = achievementElement.querySelector('.achievement-status');
        
        if (userData.achievements.includes(achievementId)) {
            statusElement.className = 'achievement-status unlocked';
            statusElement.textContent = '✅';
        } else {
            statusElement.className = 'achievement-status locked';
            statusElement.textContent = '🔒';
        }
    });
}

// Вспомогательные функции
function showMessage(message, type) {
    const resultElement = document.getElementById('slotResult');
    if (resultElement) {
        resultElement.textContent = message;
        resultElement.className = `result ${type}`;
    }
    
    // Автоочистка сообщения
    setTimeout(() => {
        if (resultElement) {
            resultElement.textContent = '';
            resultElement.className = 'result';
        }
    }, 3000);
}

function updateEggColor() {
    // Обновление цвета икры based on уровня
    if (userData.stars >= 50000) {
        userData.level = 'white';
    } else if (userData.stars >= 20000) {
        userData.level = 'black';
    } else if (userData.stars >= 5000) {
        userData.level = 'red';
    } else {
        userData.level = 'brown';
    }
}

// Сохранение данных
function saveUserData() {
    localStorage.setItem('userData', JSON.stringify(userData));
    saveGiftsToStorage();
}

// Загрузка данных
function loadUserData() {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        userData = { ...userData, ...parsedData };
    }
    updateUI();
    checkAchievements();
}

// Обработка закрытия приложения
tg.onEvent('viewportChanged', function() {
    saveUserData();
});

window.addEventListener('beforeunload', function() {
    saveUserData();
});