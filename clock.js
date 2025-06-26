
var clock = document.getElementById('digitalClock')
var bg = document.querySelector('body')
var container = document.getElementById('clock-container')
var hourHand = document.getElementById('hour-hand')
var minuteHand = document.getElementById('minute-hand')
var secondHand = document.getElementById('second-hand')

var dayMode = document.getElementsByClassName('day-mode')[0]
var autoMode = document.getElementsByClassName('auto-mode')[0]
var nightMode = document.getElementsByClassName('night-mode')[0]

var github = document.getElementsByClassName('github')[0]

var auto = true
var day = false
var night = false

let sessionInterval = null;


function nightModeStart() {
    auto = false;
    bg.classList.add('night')
    bg.classList.remove('day')

    container.classList.add('containerNight')
    container.classList.remove('containerDay')
    clock.style.color = 'white'; 
    github.style.color = 'white'
}
function dayModeStart() {
    bg.classList.add('day')
    bg.classList.remove('night')

    container.classList.remove('containerNight')
    container.classList.add('containerDay')
    clock.style.color = '#333'; 
    github.style.color = '#333'
}
function autoModeStart() {
    auto=true;
}

function timeNow() {
    dateNow = new Date();

    hours = dateNow.getHours();
    minutes = dateNow.getMinutes();
    seconds = dateNow.getSeconds();
    var sec_ang = 6*seconds;
    var min_ang = 6*minutes + (1/60)*seconds;
    var hour_ang = 30*hours + (1/60)*minutes;

    hourHand.style.transform = 'rotate('+hour_ang+'deg)'; 
    minuteHand.style.transform = 'rotate('+min_ang+'deg)'; 
    secondHand.style.transform = 'rotate('+sec_ang+'deg)'; 

    if(hours < 10)
        hours = "0" + hours;
    if(minutes < 10)
        minutes = "0" + minutes;
    if(seconds < 10)
        seconds = "0" + seconds;
    let timeString = hours + ":" + minutes+':'+seconds;
    return timeString;
}
setInterval(() => {
        clock.innerHTML = String(timeNow());
        let shortHours = ((hours > 24) ? hours - 12 : hours);
        if (auto){
        if ((shortHours > 21) || (shortHours < 8)){
            nightModeStart()
        }
        else if ((shortHours < 21) || (shortHours > 6)){
            dayModeStart()
        }
    }
}, 1000);

let log = JSON.parse(localStorage.getItem("clockLog")) || [];
let clockedInAt = null;

window.onload = () => {
    updateLogUI();
    updateButtons();
};

function formatTimeString(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}${ampm}`;
}

function formatFullDate(date) {
    const options = { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options); // e.g., Wed, June 25, 2025
}

function clockIn() {
    clockedInAt = new Date();
    updateButtons();
    startSessionTimer();
}

function clockOut() {
    if (!clockedInAt) return;

    stopSessionTimer();

    const clockedOutAt = new Date();
    const durationMs = clockedOutAt - clockedInAt;

    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let durationParts = [];
    if (hours > 0) durationParts.push(`${hours} Hr${hours > 1 ? "s" : ""}`);
    if (minutes > 0) durationParts.push(`${minutes} Min`);
    if (seconds > 0) durationParts.push(`${seconds} Sec`);
    const durationStr = durationParts.join(" ");

    const logEntry = {
        start: formatTimeString(clockedInAt),
        end: formatTimeString(clockedOutAt),
        duration: durationStr,
        date: formatFullDate(clockedOutAt)
    };

    log.push(logEntry);
    localStorage.setItem("clockLog", JSON.stringify(log));

    clockedInAt = null;
    updateLogUI();
    updateButtons();
}

function startSessionTimer() {
    const timerDisplay = document.getElementById("current-session-timer");
    if (!timerDisplay) return;

    // Reset display immediately
    timerDisplay.textContent = "Current session 00hr:00min:00s";

    // Clear any existing interval just in case
    if (sessionInterval) clearInterval(sessionInterval);

    sessionInterval = setInterval(() => {
        const now = new Date();
        const elapsedMs = now - clockedInAt;
        timerDisplay.textContent = "Current session " + formatDuration(elapsedMs);
    }, 1000);
}

function stopSessionTimer() {
    const timerDisplay = document.getElementById("current-session-timer");
    if (!timerDisplay) return;

    if (sessionInterval) {
        clearInterval(sessionInterval);
        sessionInterval = null;
    }
    timerDisplay.textContent = ""; // Clear the session display when stopped
}


function updateButtons() {
    const inBtn = document.getElementById("clockInBtn");
    const outBtn = document.getElementById("clockOutBtn");
    const digitalClock = document.getElementById("digitalClock");

    // Remove all conflicting classes first
    inBtn.classList.remove("clock-out");
    outBtn.classList.remove("clock-in");
    inBtn.classList.remove("clock-in");
    outBtn.classList.remove("clock-out");

    if (clockedInAt) {
        // Hide Clock In, show Clock Out
        inBtn.style.display = "none";
        outBtn.style.display = "inline-block";
        outBtn.classList.add("clock-out");
        digitalClock.classList.add("clock-active");
    } else {
        // Show Clock In, hide Clock Out
        outBtn.style.display = "none";
        inBtn.style.display = "inline-block";
        inBtn.classList.add("clock-in");
        digitalClock.classList.remove("clock-active");
    }
}



function updateLogUI() {
    const logList = document.getElementById("log-list");
    logList.innerHTML = "";

    const grouped = {};

    log.forEach(entry => {
        if (!grouped[entry.date]) {
            grouped[entry.date] = [];
        }
        grouped[entry.date].push(entry);
    });

    Object.keys(grouped).forEach(date => {
        // Create date header
        const dateItem = document.createElement("li");
        dateItem.textContent = date;
        dateItem.style.fontWeight = "bold";
        dateItem.style.marginTop = "20px";
        logList.appendChild(dateItem);

        // Divider
        const divider = document.createElement("hr");
        divider.style.border = "1px solid #999";
        divider.style.margin = "5px 0 10px";
        logList.appendChild(divider);

        // Add sessions
        grouped[date].forEach(entry => {
            const item = document.createElement("li");
            item.textContent = `${entry.start} - ${entry.end}, ${entry.duration}`;
            logList.appendChild(item);
        });
    });
}


function downloadLog() {
    const grouped = {};

    log.forEach(entry => {
        if (!grouped[entry.date]) {
            grouped[entry.date] = [];
        }
        grouped[entry.date].push(entry);
    });

    let logText = "";
    Object.keys(grouped).forEach(date => {
        logText += `${date}\n--------------------------\n`;
        grouped[date].forEach(entry => {
            logText += `${entry.start} - ${entry.end}, ${entry.duration}\n`;
        });
        logText += `\n`;
    });

    const blob = new Blob([logText], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = "clock-log.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
}


function clearLog() {
    log = [];
    clockedInAt = null;
    localStorage.removeItem("clockLog");
    updateLogUI();
    updateButtons();
}


function formatDuration(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    // Pad with zeros
    const pad = (n) => (n < 10 ? "0" + n : n);

    return `${hours}hr:${pad(minutes)}min:${pad(seconds)}s`;
}
