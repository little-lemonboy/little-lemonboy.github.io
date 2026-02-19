/* --- VARIABLES --- */
var highestZ = 100;
var isDragging = false;
var currentWindow = null;
var initialX, initialY;

/* --- START MENU --- */
function toggleStartMenu(event) {
    if (event) event.stopPropagation();

    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-btn');

    if (menu.style.display === 'flex') {
        menu.style.display = 'none';
        btn.classList.remove('active');
    } else {
        menu.style.display = 'flex';
        btn.classList.add('active');
        highestZ++;
        menu.style.zIndex = highestZ + 1000;
    }
}

document.addEventListener('click', function(event) {
    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-btn');
    
    if (menu.style.display === 'flex' && !menu.contains(event.target) && !btn.contains(event.target)) {
        menu.style.display = 'none';
        btn.classList.remove('active');
    }
});

/* --- WINDOWS LOGIC --- */

// Standard open (from desktop icon)
function openWindow(id) {
    var win = document.getElementById(id);
    var taskBtn = document.getElementById('task-' + id);

    win.style.display = 'flex';
    if (taskBtn) taskBtn.style.display = 'flex';
    bringToFront(id);
}

// Close Button
function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
    var taskBtn = document.getElementById('task-' + id);
    if (taskBtn) taskBtn.style.display = 'none';
}

// Minimize Button
function minimizeWindow(id) {
    document.getElementById(id).style.display = 'none';
    var taskBtn = document.getElementById('task-' + id);
    if (taskBtn) taskBtn.classList.remove('active');
}

// TASKBAR TOGGLE LOGIC
function toggleWindow(id) {
    var win = document.getElementById(id);
    var taskBtn = document.getElementById('task-' + id);
    
    // If window is currently hidden (minimized or closed), open it and bring to front
    if (win.style.display === 'none') {
        win.style.display = 'flex';
        bringToFront(id);
    } 
    // If window is open, check if it's on top
    else {
        // We check if it is the "active" window by checking Z-index or class
        // Easier way: Check if the title bar has 'active-bar'
        var titleBar = win.querySelector('.title-bar');
        
        if (titleBar.classList.contains('active-bar')) {
            // It is active -> Minimize it
            minimizeWindow(id);
        } else {
            // It is open but in background -> Bring to front
            bringToFront(id);
        }
    }
}

function bringToFront(id) {
    highestZ++;
    var win = document.getElementById(id);
    
    if (win) {
        win.style.zIndex = highestZ;

        document.querySelectorAll('.title-bar').forEach(function(tb) {
            tb.classList.remove('active-bar');
        });
        var titleBar = win.querySelector('.title-bar');
        if (titleBar) titleBar.classList.add('active-bar');

        document.querySelectorAll('.task-button').forEach(function(btn) {
            btn.classList.remove('active');
        });
        var taskBtn = document.getElementById('task-' + id);
        if (taskBtn) taskBtn.classList.add('active');
    }
}

/* --- TABS LOGIC (COMMS) --- */
function switchTab(tabId, tabElement) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(function(content) {
        content.classList.remove('active-content');
    });
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(function(tab) {
        tab.classList.remove('active-tab');
    });

    // Show selected content and highlight tab
    document.getElementById(tabId).classList.add('active-content');
    tabElement.classList.add('active-tab');
}

/* --- PAINT LOGIC --- */
var canvas = document.getElementById('paintCanvas');
var ctx = canvas.getContext('2d');
var painting = false;
var currentColor = 'black';

// Canvas Setup
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

    // We need to calculate position relative to the canvas element, not the window
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    ctx.strokeStyle = currentColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Mouse Event Listeners for Canvas
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
// Also end if mouse leaves canvas
canvas.addEventListener('mouseleave', endPosition);

function setColor(color, element) {
    currentColor = color;
    // Visual update
    document.querySelectorAll('.color-box').forEach(function(box) {
        box.classList.remove('active-color');
    });
    element.classList.add('active-color');
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/* --- DRAGGING --- */
function startDrag(e, id) {
    e.preventDefault();
    bringToFront(id);
    
    currentWindow = document.getElementById(id);
    initialX = e.clientX - currentWindow.offsetLeft;
    initialY = e.clientY - currentWindow.offsetTop;
    isDragging = true;
}

function drag(e) {
    if (isDragging && currentWindow) {
        e.preventDefault();
        currentWindow.style.left = (e.clientX - initialX) + "px";
        currentWindow.style.top = (e.clientY - initialY) + "px";
    }
}

function endDrag() {
    isDragging = false;
    currentWindow = null;
}

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', endDrag);

/* --- CLOCK --- */
function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    document.getElementById('clock').textContent = hours + ':' + minutes + ' ' + ampm;
}

/* --- INIT --- */
setInterval(updateClock, 1000);
updateClock();
if (document.getElementById('win-me')) {
    openWindow('win-me');
}
