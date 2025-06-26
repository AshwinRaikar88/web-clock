var clock, bg, container, hourHand, minuteHand, secondHand;
var dayMode, autoMode, nightMode, github;

var auto = true;
var day = false;
var night = false;

let sessionInterval = null;
let sessionClockInterval = null;

function nightModeStart() {
  auto = false;
  if (bg) bg.classList.add('night');
  if (bg) bg.classList.remove('day');
  if (container) container.classList.add('containerNight');
  if (container) container.classList.remove('containerDay');
  if (github) github.style.color = 'white';
}

function dayModeStart() {
  if (bg) bg.classList.add('day');
  if (bg) bg.classList.remove('night');
  if (container) container.classList.remove('containerNight');
  if (container) container.classList.add('containerDay');
  if (github) github.style.color = '#333';
}

function autoModeStart() {
  auto = true;
}

function getAmPmTimeString(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

function updateMainClock() {
  const now = new Date();
  if (clock) clock.textContent = getAmPmTimeString(now);

  let shortHours = now.getHours();
  if (auto) {
    if ((shortHours >= 21 || shortHours < 8)) {
      nightModeStart();
    } else {
      dayModeStart();
    }
  }

  let sec_ang = 6 * now.getSeconds();
  let min_ang = 6 * now.getMinutes() + (1 / 60) * now.getSeconds();
  let hour_ang = 30 * (now.getHours() % 12) + (1 / 60) * now.getMinutes();

  if (hourHand && minuteHand && secondHand) {
    hourHand.style.transform = `rotate(${hour_ang}deg)`;
    minuteHand.style.transform = `rotate(${min_ang}deg)`;
    secondHand.style.transform = `rotate(${sec_ang}deg)`;
  }
}

let log = JSON.parse(localStorage.getItem("clockLog")) || [];
let clockedInAt = null;

window.onload = () => {
  clock = document.getElementById('digitalClock');
  bg = document.querySelector('body');
  container = document.getElementById('clock-container');
  hourHand = document.getElementById('hour-hand');
  minuteHand = document.getElementById('minute-hand');
  secondHand = document.getElementById('second-hand');
  dayMode = document.getElementsByClassName('day-mode')[0];
  autoMode = document.getElementsByClassName('auto-mode')[0];
  nightMode = document.getElementsByClassName('night-mode')[0];
  github = document.getElementsByClassName('github')[0];

  setInterval(updateMainClock, 1000);

  const savedTab = localStorage.getItem("activeTab") || "main-tab";
  switchTab(savedTab);

  updateLogUI();
  updateHistoryTable();
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
  return date.toLocaleDateString('en-US', options);
}

function clockIn() {
  clockedInAt = new Date();
  updateButtons();
  startSessionTimer();
  startSessionClock();
}

function clockOut() {
  if (!clockedInAt) return;

  stopSessionTimer();
  stopSessionClock();

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
  updateHistoryTable();
  updateButtons();
}

function startSessionTimer() {
  const timerDisplay = document.getElementById("current-session-timer");
  if (!timerDisplay) return;

  if (sessionInterval) clearInterval(sessionInterval);
  timerDisplay.textContent = "Current session 0s";

  sessionInterval = setInterval(() => {
    const now = new Date();
    const elapsedMs = now - clockedInAt;
    timerDisplay.textContent = "Current session " + formatNaturalDuration(elapsedMs);
  }, 1000);
}

function stopSessionTimer() {
  const timerDisplay = document.getElementById("current-session-timer");
  if (!timerDisplay) return;

  if (sessionInterval) clearInterval(sessionInterval);
  sessionInterval = null;
  timerDisplay.textContent = "";
}

function startSessionClock() {
  let sessionClockBlock = document.getElementById("sessionClockBlock");

  if (!sessionClockBlock) {
    sessionClockBlock = document.createElement("div");
    sessionClockBlock.id = "sessionClockBlock";
    sessionClockBlock.innerHTML = `
      <div id="sessionClock" class="clock-active"></div>
      <div id="current-session-timer"></div>
    `;
    const clockElement = document.getElementById("digitalClock");
    clockElement.insertAdjacentElement('afterend', sessionClockBlock);
  }

  sessionClockBlock.style.display = "block";

  const sessionClock = document.getElementById("sessionClock");
  if (sessionClockInterval) clearInterval(sessionClockInterval);

  sessionClockInterval = setInterval(() => {
    const now = new Date();
    const elapsed = now - clockedInAt;
    sessionClock.textContent = formatNaturalDuration(elapsed);
  }, 1000);
}

function stopSessionClock() {
  const sessionClockBlock = document.getElementById("sessionClockBlock");
  if (sessionClockBlock) {
    sessionClockBlock.style.display = "none";
  }
  if (sessionClockInterval) clearInterval(sessionClockInterval);
  sessionClockInterval = null;
}

function updateButtons() {
  const inBtn = document.getElementById("clockInBtn");
  const outBtn = document.getElementById("clockOutBtn");

  if (!inBtn || !outBtn) return;

  inBtn.classList.remove("clock-out", "clock-in");
  outBtn.classList.remove("clock-in", "clock-out");

  if (clockedInAt) {
    inBtn.style.display = "none";
    outBtn.style.display = "inline-block";
    outBtn.classList.add("clock-out");
  } else {
    outBtn.style.display = "none";
    inBtn.style.display = "inline-block";
    inBtn.classList.add("clock-in");
  }
}

function updateLogUI() {
  const logList = document.getElementById("log-list");
  if (!logList) return;

  logList.innerHTML = "";

  const grouped = {};

  log.forEach(entry => {
    if (!grouped[entry.date]) {
      grouped[entry.date] = [];
    }
    grouped[entry.date].push(entry);
  });

  Object.keys(grouped).forEach(date => {
    const dateItem = document.createElement("li");
    dateItem.textContent = date;
    dateItem.style.fontWeight = "bold";
    dateItem.style.marginTop = "20px";
    logList.appendChild(dateItem);

    const divider = document.createElement("hr");
    divider.style.border = "1px solid #999";
    divider.style.margin = "5px 0 10px";
    logList.appendChild(divider);

    grouped[date].forEach(entry => {
      const item = document.createElement("li");
      item.textContent = `${entry.start} - ${entry.end}, ${entry.duration}`;
      logList.appendChild(item);
    });
  });
}

function updateHistoryTable() {
  const tbody = document.querySelector("#history-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  log.forEach(entry => {
    const row = document.createElement("tr");

    const date = document.createElement("td");
    date.textContent = entry.date;

    const start = document.createElement("td");
    start.textContent = entry.start;

    const end = document.createElement("td");
    end.textContent = entry.end;

    const duration = document.createElement("td");
    duration.textContent = entry.duration;

    row.append(date, start, end, duration);
    tbody.appendChild(row);
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
  updateHistoryTable();
  updateButtons();
}

function formatDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;

  const pad = (n) => (n < 10 ? "0" + n : n);

  return `${hours}hr:${pad(minutes)}min:${pad(seconds)}s`;
}

function formatNaturalDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds % 3600) / 60);
  let seconds = totalSeconds % 60;

  let result = [];
  if (hours > 0) result.push(`${hours} Hr${hours > 1 ? "s" : ""}`);
  if (minutes > 0) result.push(`${minutes} Min`);
  if (seconds > 0 || result.length === 0) result.push(`${seconds}s`);
  return result.join(" ");
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active-tab');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add('active-tab');

  const clickedBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn =>
    btn.textContent.toLowerCase().includes(tabId.split('-')[0])
  );
  if (clickedBtn) clickedBtn.classList.add('active');

  localStorage.setItem("activeTab", tabId);

  if (tabId === "history-tab") {
    updateHistoryTable();
  }
}
