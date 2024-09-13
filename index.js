console.log("css and speech reset");

timeSet = 5000;
let players = [];
let activePlayer = [];
let dead = [];
let mafia = "";
let godfather = "";
let healer = "";
let detective = ""
let civilians = [];
var cnt = 1;
let cntmafia = 0;
let cntcivilians = 0;
id = ""
str = ""

function speakOutLoud() {
    // str = "hello world";
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

function printPlayers() {
    let name = document.getElementById("player-name").value;
    const btn = document.createElement("button")
    btn.id = name;
    btn.addEventListener('click', function () {
        console.log(name + ' is clicked!');
        id = name;
    });
    // btn.getAttributeNames
    if (players.includes(name) || name == "") {
        return;
    } else {
        players.push(name);
        btn.innerHTML = name;
        document.getElementById("player-list").appendChild(btn);
        document.getElementById("player-name").value = "";
    }
    startcnt = 1;
}

function removePlayers() {
    let name = document.getElementById("player-remove").value;
    if (players.includes(name)) {
        let ind = players.findIndex((e) => e == name);
        if (ind != -1) {
            players.splice(ind, 1);

            var child = document.getElementById("player-list").lastElementChild;
            while (child) {
                document.getElementById("player-list").removeChild(child);
                child = document.getElementById("player-list").lastElementChild;
            }

            players.map((e) => {
                const btn = document.createElement("button");
                btn.innerHTML = e;
                document.getElementById("player-list").appendChild(btn);
            })
        }
    }
    document.getElementById("player-remove").value = "";
}

function removePlayersfromActive(name) {
    // let name = document.getElementById("player-remove").value;
    if (activePlayer.includes(name)) {
        let ind = activePlayer.findIndex((e) => e == name);
        if (ind != -1) {
            activePlayer.splice(ind, 1);

            var child = document.getElementById("active-player").lastElementChild;
            while (child) {
                document.getElementById("active-player").removeChild(child);
                child = document.getElementById("active-player").lastElementChild;
            }

            // activePlayer.map((e)=>{
            //     const btn = document.createElement("button");
            //     btn.innerHTML = e;
            //     document.getElementById("active-player").appendChild(btn);
            // })

            activePlayer.map((e) => {
                const btn = document.createElement("button")
                btn.id = e;
                btn.addEventListener('click', function () {
                    console.log(e + ' is clicked!');
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

async function assignRoles() {
    dead = [];
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

    let currentIndex = players.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [players[currentIndex], players[randomIndex]] = [
            players[randomIndex], players[currentIndex]];
    }
    //   console.log(players);
    n = players.length;
    k = Math.floor(Math.random());
    mafia = players[k % n]
    godfather = players[(k + 1) % n]
    healer = players[(k + 2) % n]
    detective = players[(k + 3) % n]
    // console.log(players);
    civilians = players.filter((e) => {
        return (e != mafia && e != godfather && e != detective && e != healer);
    })
    cnt = 1;
    id = "";

    timeRole = 3000;

    // let data = await Promise.all
    for (const e of players) {
        // (players.map(async (e)=>{
        const para = document.createElement("h2");
        if (civilians.includes(e)) role = "civilian";
        else if (e == mafia) role = "mafia";
        else if (e == godfather) role = "godfather";
        else if (e == healer) role = "healer";
        else role = "detective";
        //  return {e,role};
        para.innerText = `${e} is `;
        document.getElementById("player-role").appendChild(para);
        await sleep(timeRole);
        document.getElementById("player-role").removeChild(para);

        para.innerText = `${role}`;
        document.getElementById("player-role").appendChild(para);
        await sleep(timeRole / 1.5);
        document.getElementById("player-role").removeChild(para);

    }
    activePlayer = [...players];
    activePlayer = activePlayer.map(value => ({ value, sort: Math.random() }))
                            .sort((a, b) => a.sort - b.sort)
                            .map(({ value }) => value)

    activePlayer.map((e) => {
        const btn = document.createElement("button")
        btn.id = e;
        btn.addEventListener('click', function () {
            console.log(e + ' is clicked!');
            id = e;
        });
        btn.innerHTML = e;
        document.getElementById("active-player").appendChild(btn);
    })

    cntmafia = 2;
    cntcivilians = players.length - cntmafia;
}

function deadPlayers() {
    // cntcivilians = players.length - cntmafia;
    let name = document.getElementById("player-dead").value;
    if (players.includes(name) && !dead.includes(name) && players.length > 0) {
        dead.push(name);
        const btn = document.createElement("button")
        btn.innerHTML = name;
        document.getElementById("player-dead-list").appendChild(btn);


        dead.map((e) => {
            if (e == name) {
                if (e == mafia || e == godfather) cntmafia--;
                else cntcivilians--;
                document.getElementById("player-dead").value = "";
                removePlayersfromActive(e);
            }

        })
    }
    // console.log(cntmafia,cntcivilians);
}

async function startGame() {
    // assignRoles();
    console.log(['mafia', 'godfather', 'healer', 'detective', 'civlians...']);
    console.log(players);
    // console.log(`dead are: `+dead)
    id = ""

    t1 = "city goes to sleep"
    t2 = "godfather wake up"
    t3 = "mafia wake up"
    t4 = "whom do you wanna kill?"
    t5 = "detective wake up"
    t6 = "whom do you wanna detect?"
    t7 = "healer wake up"
    t8 = "whom do you wanna heal?"

    let text = document.createElement("h1");

    if (cntmafia == 0) {
        text.innerText = "civilians won";
        str = text.innerText;
        document.getElementById("final-game").appendChild(text);
        document.getElementById("speech-btn").click();
        await sleep(2000);
        document.getElementById("final-game").removeChild(text);
        return;
    }
    if (cntmafia >= cntcivilians) {
        text.innerText = "mafia won";
        str = text.innerText;
        document.getElementById("final-game").appendChild(text);
        document.getElementById("speech-btn").click();
        await sleep(2000);
        document.getElementById("final-game").removeChild(text);
        return;
    }

    text.innerText = t1;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);


    text.innerText = t2;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);


    text.innerText = t3;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);

    document.getElementById("final-game").removeChild(text);


    text.innerText = t4;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    person = id;
    console.log(`killed ${id}`);
    document.getElementById("final-game").removeChild(text);


    text.innerText = t1;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);


    text.innerText = t5;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);


    text.innerText = t6;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    console.log(`detected ${id}`);
    if (id == mafia) {
        document.getElementById("final-game").removeChild(text);
        text.innerText = "Yes";
        document.getElementById("final-game").appendChild(text);

    } else if (id == godfather) {
        if (cnt != 2) {
            document.getElementById("final-game").removeChild(text);
            text.innerText = "No";
            document.getElementById("final-game").appendChild(text);
            cnt++;

        } else {
            document.getElementById("final-game").removeChild(text);
            text.innerText = "Yes";
            document.getElementById("final-game").appendChild(text);
        }
    } else {
        document.getElementById("final-game").removeChild(text);
        text.innerText = "No";
        document.getElementById("final-game").appendChild(text);

    }
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);


    text.innerText = t1;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);


    text.innerText = t7;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);


    text.innerText = t8;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);

    if (dead.includes(healer)) id = "";
    console.log(`healed ${id}`);
    if (id == person) {
        person = "no one"
    } else {
        dead.push(person);
        cntcivilians--;
    }
    document.getElementById("final-game").removeChild(text);


    text.innerText = t1;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);


    text.innerText = `city wakes up and find ${person} dead`;
    str = text.innerText;
    document.getElementById("final-game").appendChild(text);
    document.getElementById("speech-btn").click();
    await sleep(timeSet);
    document.getElementById("final-game").removeChild(text);

    if (person != "no one") {
        const btn = document.createElement("button")
        btn.innerHTML = person;
        document.getElementById("player-dead-list").appendChild(btn);
        removePlayersfromActive(person);
    }


}



