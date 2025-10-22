// Game settings
timeSet = 5000;

// Room management
let roomCode = null;
let isHost = false;

// Player arrays
let players = [];
let activePlayer = [];
let dead = [];

// LocalStorage keys
const STORAGE_KEYS = {
    PLAYERS: 'mafia_game_players',
    ROOM_CODE: 'mafia_game_room_code',
    IS_HOST: 'mafia_game_is_host',
    ROOM_DATA: 'mafia_room_'
};

// Role arrays (support multiple of each type)
let godfathers = [];
let mafias = [];
let healers = [];
let detectives = [];
let civilians = [];

// Game state
let detectiveCheckCount = {}; // Track godfather detection attempts per detective
let selectedTargets = {}; // Track selections during night phases

// Counters for win condition
let cntMafiaTeam = 0; // godfathers + mafias
let cntOthers = 0; // civilians + healers + detectives

// Speech synthesis
let id = "";
let str = "";

function speakOutLoud() {
    let speech = new SpeechSynthesisUtterance();
    speech.lang = "en";
    speech.rate = 0.8;
    speech.volume = 1;
    speech.pitch = 1;
    voices = window.speechSynthesis.getVoices();
    speech.voice = voices[0];
    speech.text = str;
    window.speechSynthesis.speak(speech);
}

// Helper function to capitalize names properly (Title Case)
function capitalizeName(name) {
    return name.trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function updatePlayerCount() {
    document.getElementById("player-count").innerText = players.length;
    updateRoleDistribution();
}

function validateRoles() {
    let godfatherCount = parseInt(document.getElementById("godfather-count").value) || 0;
    let mafiaCount = parseInt(document.getElementById("mafia-count").value) || 0;
    let detectiveCount = parseInt(document.getElementById("detective-count").value) || 0;
    let healerCount = parseInt(document.getElementById("healer-count").value) || 0;
    
    // Validate: no negative numbers
    if (godfatherCount < 0 || mafiaCount < 0 || detectiveCount < 0 || healerCount < 0) {
        alert("⚠️ Role counts cannot be negative!");
        return false;
    }
    
    let totalRoles = godfatherCount + mafiaCount + detectiveCount + healerCount;
    let totalPlayers = players.length;
    
    let validationDiv = document.getElementById("role-validation");
    
    if (totalPlayers < 4) {
        validationDiv.innerText = "⚠️ Need at least 4 players to start a game!";
        alert("⚠️ Need at least 4 players to start a game!");
        return false;
    }
    
    if (totalRoles > totalPlayers) {
        validationDiv.innerText = `⚠️ Too many special roles! (${totalRoles} roles for ${totalPlayers} players)`;
        alert(`⚠️ Too many special roles! You have ${totalRoles} roles but only ${totalPlayers} players. Please reduce the number of special roles.`);
        return false;
    }
    
    let mafiaTeam = godfatherCount + mafiaCount;
    let others = totalPlayers - mafiaTeam;
    
    if (mafiaTeam >= others) {
        validationDiv.innerText = `⚠️ Mafia team too large! (${mafiaTeam} mafia vs ${others} others)`;
        alert(`⚠️ Mafia team is too large! (${mafiaTeam} mafia vs ${others} others). The game would be unbalanced.`);
        return false;
    }
    
    if (mafiaTeam === 0) {
        validationDiv.innerText = "⚠️ Need at least 1 mafia team member!";
        alert("⚠️ Need at least 1 mafia team member (godfather or mafia)!");
        return false;
    }
    
    validationDiv.innerText = "";
    return true;
}

function updateRoleDistribution() {
    let godfatherCount = parseInt(document.getElementById("godfather-count").value) || 0;
    let mafiaCount = parseInt(document.getElementById("mafia-count").value) || 0;
    let detectiveCount = parseInt(document.getElementById("detective-count").value) || 0;
    let healerCount = parseInt(document.getElementById("healer-count").value) || 0;
    
    let totalRoles = godfatherCount + mafiaCount + detectiveCount + healerCount;
    let totalPlayers = players.length;
    let civilianCount = totalPlayers - totalRoles;
    
    // Update max attribute on role inputs to prevent exceeding player count
    if (totalPlayers > 0) {
        document.getElementById("godfather-count").setAttribute("max", totalPlayers);
        document.getElementById("mafia-count").setAttribute("max", totalPlayers);
        document.getElementById("detective-count").setAttribute("max", totalPlayers);
        document.getElementById("healer-count").setAttribute("max", totalPlayers);
    }
    
    // Real-time validation
    let validationDiv = document.getElementById("role-validation");
    validationDiv.innerText = "";
    
    if (totalPlayers > 0 && totalRoles > totalPlayers) {
        validationDiv.innerText = `⚠️ Too many special roles! (${totalRoles} roles for ${totalPlayers} players)`;
        civilianCount = 0;
    }
    
    if (civilianCount < 0) civilianCount = 0;
    
    let distDiv = document.getElementById("role-distribution");
    if (totalPlayers >= 4 && totalRoles <= totalPlayers) {
        let mafiaTeam = godfatherCount + mafiaCount;
        let others = totalPlayers - mafiaTeam;
        
        if (mafiaTeam >= others) {
            validationDiv.innerText = `⚠️ Mafia team too large! (${mafiaTeam} mafia vs ${others} others)`;
            distDiv.innerText = "";
        } else if (mafiaTeam === 0) {
            validationDiv.innerText = "⚠️ Need at least 1 mafia team member!";
            distDiv.innerText = "";
        } else {
            distDiv.innerText = `✅ ${godfatherCount} Godfather(s), ${mafiaCount} Mafia, ${detectiveCount} Detective(s), ${healerCount} Healer(s), ${civilianCount} Civilian(s)`;
        }
    } else if (totalPlayers > 0 && totalPlayers < 4) {
        validationDiv.innerText = "⚠️ Need at least 4 players!";
        distDiv.innerText = "";
    } else {
        distDiv.innerText = "";
    }
}

// LocalStorage functions
function savePlayersToStorage() {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    if (roomCode) {
        saveRoomData();
    }
}

function loadPlayersFromStorage() {
    const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (savedPlayers) {
        try {
            players = JSON.parse(savedPlayers);
            // Rebuild player list UI
            players.forEach(name => {
                const btn = document.createElement("button");
                btn.id = name;
                btn.innerHTML = name;
                btn.addEventListener('click', function () {
                    id = name;
                });
                document.getElementById("player-list").appendChild(btn);
            });
            updatePlayerCount();
        } catch (e) {
            console.error("Error loading players:", e);
        }
    }
}

function clearAllPlayers() {
    if (confirm("⚠️ Clear all players? This cannot be undone!")) {
        players = [];
        var child = document.getElementById("player-list").lastElementChild;
        while (child) {
            document.getElementById("player-list").removeChild(child);
            child = document.getElementById("player-list").lastElementChild;
        }
        updatePlayerCount();
        savePlayersToStorage();
    }
}

// Room management functions
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createRoom() {
    roomCode = generateRoomCode();
    isHost = true;
    localStorage.setItem(STORAGE_KEYS.ROOM_CODE, roomCode);
    localStorage.setItem(STORAGE_KEYS.IS_HOST, 'true');
    
    saveRoomData();
    displayRoomInfo();
    startSyncInterval();
}

function saveRoomData() {
    const roomData = {
        code: roomCode,
        players: players,
        timestamp: Date.now(),
        status: 'open',
        hostActive: true
    };
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.ROOM_DATA + roomCode, JSON.stringify(roomData));
    
    // Also save to sessionStorage for cross-tab communication
    sessionStorage.setItem('mafia_current_room', JSON.stringify(roomData));
}

function loadRoomData(code) {
    const roomData = localStorage.getItem(STORAGE_KEYS.ROOM_DATA + code);
    if (roomData) {
        try {
            return JSON.parse(roomData);
        } catch (e) {
            console.error("Error loading room data:", e);
        }
    }
    return null;
}

function displayRoomInfo() {
    const roomInfoDiv = document.getElementById("room-info");
    if (roomCode) {
        // Encode current players in URL for cross-device access
        const encodedPlayers = encodeURIComponent(JSON.stringify(players));
        const joinUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}join.html?room=${roomCode}&host=${encodeURIComponent(window.location.href)}`;
        
        roomInfoDiv.innerHTML = `
            <div style="background: rgba(56, 239, 125, 0.1); padding: 20px; border-radius: 15px; border: 2px solid rgba(56, 239, 125, 0.3); margin: 20px auto;">
                <h3 style="color: #38ef7d; margin-bottom: 15px;">🎮 Room Code: <span style="font-size: 2em; letter-spacing: 5px;">${roomCode}</span></h3>
                <p style="color: #fff; margin: 10px 0;">Share this link for players to join:</p>
                <input type="text" value="${joinUrl}" readonly onclick="this.select()" style="width: 80%; margin: 10px 0; cursor: pointer;" />
                <div id="qrcode" style="margin: 15px auto; background: white; padding: 10px; border-radius: 10px; display: inline-block;"></div>
                <p style="color: #6bcfff; font-size: 14px;">Players can scan the QR code to join!</p>
                <p style="color: #ffd93d; font-size: 13px; margin-top: 10px; font-weight: 600;">⚠️ IMPORTANT: Due to browser limitations, players joining from other devices won't appear here automatically.</p>
                <p style="color: #ff6b6b; font-size: 12px; margin-top: 5px;">✅ Recommended: After players join successfully, manually add their names using "➕ Add Player" button above.</p>
            </div>
        `;
        
        // Generate QR code
        generateQRCode(joinUrl);
    }
}

function generateQRCode(url) {
    const qrcodeDiv = document.getElementById("qrcode");
    if (qrcodeDiv) {
        qrcodeDiv.innerHTML = '';
        // Simple QR code generation using QR Server API
        const qrImg = document.createElement('img');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        qrImg.alt = "QR Code";
        qrImg.style.display = "block";
        qrcodeDiv.appendChild(qrImg);
    }
}

function syncPlayers() {
    if (!roomCode) return;
    
    const roomData = loadRoomData(roomCode);
    if (roomData && roomData.players) {
        // Check if players list has changed
        const currentPlayersStr = JSON.stringify(players.sort());
        const roomPlayersStr = JSON.stringify(roomData.players.sort());
        
        if (currentPlayersStr !== roomPlayersStr) {
            // Update players from room data
            players = [...roomData.players];
            
            // Clear and rebuild UI
            var child = document.getElementById("player-list").lastElementChild;
            while (child) {
                document.getElementById("player-list").removeChild(child);
                child = document.getElementById("player-list").lastElementChild;
            }
            
            players.forEach(name => {
                const btn = document.createElement("button");
                btn.id = name;
                btn.innerHTML = name;
                btn.addEventListener('click', function () {
                    id = name;
                });
                document.getElementById("player-list").appendChild(btn);
            });
            
            updatePlayerCount();
        }
    }
}

let syncInterval = null;

function startSyncInterval() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncPlayers, 2000); // Sync every 2 seconds
}

function closeRoom() {
    if (confirm("⚠️ Close this room? Players won't be able to join anymore.")) {
        if (roomCode) {
            // Mark room as closed instead of deleting it
            const roomData = {
                code: roomCode,
                players: players,
                timestamp: Date.now(),
                status: 'closed',
                hostActive: false,
                closedAt: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.ROOM_DATA + roomCode, JSON.stringify(roomData));
        }
        localStorage.removeItem(STORAGE_KEYS.ROOM_CODE);
        localStorage.removeItem(STORAGE_KEYS.IS_HOST);
        roomCode = null;
        isHost = false;
        
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
        }
        
        document.getElementById("room-info").innerHTML = '<p style="color: #ff6b6b; font-weight: 600;">Room closed successfully! No new players can join.</p>';
        
        setTimeout(() => {
            document.getElementById("room-info").innerHTML = '';
        }, 3000);
    }
}

// Listen for messages from joined players
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'PLAYER_JOINED' && event.data.roomCode === roomCode) {
        // Sync players from joining window
        syncPlayers();
    }
});

// Add event listeners to role inputs
window.addEventListener('load', function() {
    // Load saved players
    loadPlayersFromStorage();
    
    // Check if host and restore room
    const savedRoomCode = localStorage.getItem(STORAGE_KEYS.ROOM_CODE);
    const savedIsHost = localStorage.getItem(STORAGE_KEYS.IS_HOST);
    if (savedRoomCode && savedIsHost === 'true') {
        roomCode = savedRoomCode;
        isHost = true;
        displayRoomInfo();
        startSyncInterval();
    }
    
    document.getElementById("godfather-count").addEventListener('input', updateRoleDistribution);
    document.getElementById("mafia-count").addEventListener('input', updateRoleDistribution);
    document.getElementById("detective-count").addEventListener('input', updateRoleDistribution);
    document.getElementById("healer-count").addEventListener('input', updateRoleDistribution);
    
    // Add keyboard support for Enter key on player name input
    document.getElementById("player-name").addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            printPlayers();
        }
    });
    
    // Add keyboard support for Enter key on remove player input
    document.getElementById("player-remove").addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            removePlayers();
        }
    });
    
    // Add keyboard support for Enter key on dead player input
    document.getElementById("player-dead").addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            deadPlayers();
        }
    });
});

function printPlayers() {
    let rawName = document.getElementById("player-name").value.trim();
    
    // Validate: name should not be empty
    if (rawName === "") {
        alert("⚠️ Please enter a player name!");
        return;
    }
    
    // Validate: name length
    if (rawName.length < 2) {
        alert("⚠️ Player name must be at least 2 characters!");
        return;
    }
    
    if (rawName.length > 20) {
        alert("⚠️ Player name must be less than 20 characters!");
        return;
    }
    
    // Capitalize name properly (Title Case)
    let name = capitalizeName(rawName);
    
    // Validate: no duplicate names (case-insensitive check)
    if (players.some(p => p.toLowerCase() === name.toLowerCase())) {
        alert(`⚠️ Player "${name}" already exists!`);
        return;
    }
    
    // Validate: name should only contain letters, spaces, and basic punctuation
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
        alert("⚠️ Player name should only contain letters, spaces, hyphens, and apostrophes!");
        return;
    }
    
    const btn = document.createElement("button");
    btn.id = name;
    btn.addEventListener('click', function () {
        id = name;
    });
    
    players.push(name);
    btn.innerHTML = name;
    document.getElementById("player-list").appendChild(btn);
    document.getElementById("player-name").value = "";
    updatePlayerCount();
    savePlayersToStorage();
}

function removePlayers() {
    let rawName = document.getElementById("player-remove").value.trim();
    
    if (rawName === "") {
        alert("⚠️ Please enter a player name to remove!");
        return;
    }
    
    // Capitalize name to match stored format
    let name = capitalizeName(rawName);
    
    // Case-insensitive search
    let ind = players.findIndex((p) => p.toLowerCase() === name.toLowerCase());
    
    if (ind !== -1) {
        let actualName = players[ind];
        players.splice(ind, 1);

        var child = document.getElementById("player-list").lastElementChild;
        while (child) {
            document.getElementById("player-list").removeChild(child);
            child = document.getElementById("player-list").lastElementChild;
        }

            players.map((e) => {
                const btn = document.createElement("button");
                btn.innerHTML = e;
                btn.id = e;
                btn.addEventListener('click', function () {
                    id = e;
                });
                document.getElementById("player-list").appendChild(btn);
            })
    } else {
        alert(`⚠️ Player "${name}" not found!`);
    }
    
    document.getElementById("player-remove").value = "";
    updatePlayerCount();
    savePlayersToStorage();
}

function removePlayersfromActive(name) {
    if (activePlayer.includes(name)) {
        let ind = activePlayer.findIndex((e) => e == name);
        if (ind != -1) {
            activePlayer.splice(ind, 1);

            var child = document.getElementById("active-player").lastElementChild;
            while (child) {
                document.getElementById("active-player").removeChild(child);
                child = document.getElementById("active-player").lastElementChild;
            }

            activePlayer.map((e) => {
                const btn = document.createElement("button");
                btn.id = e;
                btn.addEventListener('click', function () {
                    id = e;
                });
                btn.innerHTML = e;
                document.getElementById("active-player").appendChild(btn);
            })
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffleArray(array) {
    let shuffled = [...array];
    let currentIndex = shuffled.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled;
}

async function assignRoles() {
    // Validate before proceeding
    if (!validateRoles()) {
        return;
    }
    
    // Reset game state
    dead = [];
    selectedTargets = {};
    detectiveCheckCount = {};
    
    // Clear UI
    var child = document.getElementById("player-dead-list").lastElementChild;
    while (child) {
        document.getElementById("player-dead-list").removeChild(child);
        child = document.getElementById("player-dead-list").lastElementChild;
    }
    child = document.getElementById("active-player").lastElementChild;
    while (child) {
        document.getElementById("active-player").removeChild(child);
        child = document.getElementById("active-player").lastElementChild;
    }

    // Get role counts
    let godfatherCount = parseInt(document.getElementById("godfather-count").value) || 0;
    let mafiaCount = parseInt(document.getElementById("mafia-count").value) || 0;
    let detectiveCount = parseInt(document.getElementById("detective-count").value) || 0;
    let healerCount = parseInt(document.getElementById("healer-count").value) || 0;

    // Shuffle players for random assignment
    let shuffledPlayers = shuffleArray(players);
    
    // Assign roles
    godfathers = [];
    mafias = [];
    detectives = [];
    healers = [];
    civilians = [];
    
    let index = 0;
    
    // Assign godfathers
    for (let i = 0; i < godfatherCount; i++) {
        godfathers.push(shuffledPlayers[index++]);
    }
    
    // Assign mafias
    for (let i = 0; i < mafiaCount; i++) {
        mafias.push(shuffledPlayers[index++]);
    }
    
    // Assign detectives
    for (let i = 0; i < detectiveCount; i++) {
        let detective = shuffledPlayers[index++];
        detectives.push(detective);
        detectiveCheckCount[detective] = 0; // Initialize check counter
    }
    
    // Assign healers
    for (let i = 0; i < healerCount; i++) {
        healers.push(shuffledPlayers[index++]);
    }
    
    // Remaining are civilians
    for (let i = index; i < shuffledPlayers.length; i++) {
        civilians.push(shuffledPlayers[i]);
    }
    
    id = "";
    timeRole = 3000;

    // Show roles to each player
    for (const player of players) {
        const para = document.createElement("h2");
        let role = "";
        
        if (godfathers.includes(player)) role = "godfather";
        else if (mafias.includes(player)) role = "mafia";
        else if (detectives.includes(player)) role = "detective";
        else if (healers.includes(player)) role = "healer";
        else role = "civilian";
        
        para.innerText = `${player} is `;
        document.getElementById("player-role").appendChild(para);
        await sleep(timeRole);
        document.getElementById("player-role").removeChild(para);

        para.innerText = `${role}`;
        document.getElementById("player-role").appendChild(para);
        await sleep(timeRole / 1.5);
        document.getElementById("player-role").removeChild(para);
    }
    
    // Set up active players
    activePlayer = shuffleArray([...players]);
    activePlayer.map((e) => {
        const btn = document.createElement("button");
        btn.id = e;
        btn.addEventListener('click', function () {
            id = e;
        });
        btn.innerHTML = e;
        document.getElementById("active-player").appendChild(btn);
    })

    // Initialize counters
    cntMafiaTeam = godfathers.length + mafias.length;
    cntOthers = players.length - cntMafiaTeam;
}

function deadPlayers() {
    let rawName = document.getElementById("player-dead").value.trim();
    
    if (rawName === "") {
        alert("⚠️ Please enter a player name!");
        return;
    }
    
    // Capitalize name to match stored format
    let name = capitalizeName(rawName);
    
    // Case-insensitive search
    let playerIndex = players.findIndex(p => p.toLowerCase() === name.toLowerCase());
    
    if (playerIndex === -1) {
        alert(`⚠️ Player "${name}" not found!`);
        document.getElementById("player-dead").value = "";
        return;
    }
    
    let actualName = players[playerIndex];
    
    // Check if already dead
    if (dead.some(p => p.toLowerCase() === actualName.toLowerCase())) {
        alert(`⚠️ Player "${actualName}" is already eliminated!`);
        document.getElementById("player-dead").value = "";
        return;
    }
    
    if (players.length > 0) {
        dead.push(actualName);
        const btn = document.createElement("button");
        btn.innerHTML = actualName;
        document.getElementById("player-dead-list").appendChild(btn);

        // Update counters based on role
        if (godfathers.includes(actualName) || mafias.includes(actualName)) {
            cntMafiaTeam--;
        } else {
            cntOthers--;
        }
        
        document.getElementById("player-dead").value = "";
        removePlayersfromActive(actualName);
    }
}

async function startGame() {
    id = "";

    let text = document.createElement("h1");

    // Check win conditions
    if (cntMafiaTeam == 0) {
        text.innerText = "Civilians and Special Roles Won!";
        str = text.innerText;
        document.getElementById("final-game").appendChild(text);
        document.getElementById("speech-btn").click();
        await sleep(3000);
        document.getElementById("final-game").removeChild(text);
        return;
    }
    if (cntMafiaTeam >= cntOthers) {
        text.innerText = "Mafia Team Won!";
        str = text.innerText;
        document.getElementById("final-game").appendChild(text);
        document.getElementById("speech-btn").click();
        await sleep(3000);
        document.getElementById("final-game").removeChild(text);
        return;
    }

    // Night begins
    text.innerText = "City goes to sleep";
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);

    // === MAFIA TEAM PHASE ===
    let aliveMafiaTeam = [...godfathers.filter(p => !dead.includes(p)), ...mafias.filter(p => !dead.includes(p))];
    
    if (aliveMafiaTeam.length > 0) {
        text.innerText = `Mafia team wake up (${aliveMafiaTeam.length} members)`;
        str = text.innerText;
        document.getElementById("final-game").appendChild(text);
        document.getElementById("speech-btn").click();
        await sleep(timeSet);
        document.getElementById("final-game").removeChild(text);

        text.innerText = "Mafia team, select your victim";
        str = text.innerText;
        document.getElementById("final-game").appendChild(text);
        document.getElementById("speech-btn").click();
        await sleep(timeSet);
        
        selectedTargets.mafiaKill = id;
        
        document.getElementById("final-game").removeChild(text);
    }

    text.innerText = "Mafia team goes to sleep";
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);

    // === DETECTIVE PHASE ===
    let aliveDetectives = detectives.filter(d => !dead.includes(d));
    
    if (aliveDetectives.length > 0) {
        for (let detective of aliveDetectives) {
            text.innerText = `${detective} (detective) wake up`;
            str = text.innerText;
            document.getElementById("final-game").appendChild(text);
            document.getElementById("speech-btn").click();
            await sleep(timeSet);
            document.getElementById("final-game").removeChild(text);

            text.innerText = "Who do you want to investigate?";
            str = text.innerText;
            document.getElementById("final-game").appendChild(text);
            document.getElementById("speech-btn").click();
            await sleep(timeSet);
            
            let investigated = id;
            
            document.getElementById("final-game").removeChild(text);

            // Determine result
            let result = "No";
            if (mafias.includes(investigated)) {
                result = "Yes, Mafia!";
            } else if (godfathers.includes(investigated)) {
                // Godfather appears innocent first 2 times per detective
                if (detectiveCheckCount[detective] < 2) {
                    result = "No";
                    detectiveCheckCount[detective]++;
                } else {
                    result = "Yes, Godfather!";
                }
            }
            
            text.innerText = result;
            str = text.innerText;
            document.getElementById("final-game").appendChild(text);
            document.getElementById("speech-btn").click();
            await sleep(timeSet);
            document.getElementById("final-game").removeChild(text);

            text.innerText = `${detective} goes to sleep`;
            str = text.innerText;
            document.getElementById("final-game").appendChild(text);
            document.getElementById("speech-btn").click();
            await sleep(timeSet);
            document.getElementById("final-game").removeChild(text);
        }
    }

    // === HEALER PHASE ===
    let aliveHealers = healers.filter(h => !dead.includes(h));
    let savedPlayers = [];
    
    if (aliveHealers.length > 0) {
        for (let healer of aliveHealers) {
            text.innerText = `${healer} (healer) wake up`;
            str = text.innerText;
            document.getElementById("final-game").appendChild(text);
            document.getElementById("speech-btn").click();
            await sleep(timeSet);
            document.getElementById("final-game").removeChild(text);

            text.innerText = "Who do you want to heal?";
            str = text.innerText;
            document.getElementById("final-game").appendChild(text);
            document.getElementById("speech-btn").click();
            await sleep(timeSet);
            
            let saved = id;
            if (saved) savedPlayers.push(saved);
            
            document.getElementById("final-game").removeChild(text);

            text.innerText = `${healer} goes to sleep`;
            str = text.innerText;
            document.getElementById("final-game").appendChild(text);
            document.getElementById("speech-btn").click();
            await sleep(timeSet);
            document.getElementById("final-game").removeChild(text);
        }
    }

    // === MORNING ===
    text.innerText = "City wakes up";
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);

    // Determine who died
    let victim = selectedTargets.mafiaKill;
    let actualVictim = "no one";
    
    if (victim && !savedPlayers.includes(victim)) {
        actualVictim = victim;
        dead.push(victim);
        
        // Update counters
        if (godfathers.includes(victim) || mafias.includes(victim)) {
            cntMafiaTeam--;
        } else {
            cntOthers--;
        }
        
        const btn = document.createElement("button");
        btn.innerHTML = victim;
        document.getElementById("player-dead-list").appendChild(btn);
        removePlayersfromActive(victim);
    }

    text.innerText = `Last night, ${actualVictim} died`;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);
}
