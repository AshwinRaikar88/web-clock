
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
    let timeString = (seconds%2==0)? hours + ":" + minutes+':'+seonds: hours+ " " + minutes+' '+seonds;
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

