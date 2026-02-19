/* --- VARIABLES --- */
var highestZ = 100;
var isDragging = false;
var currentWindow = null;
var initialX, initialY;

/* --- START MENU --- */
function toggleStartMenu(event) {
    // Stop the click from bubbling up to the document
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

// Close menu if clicking anywhere on the document (that isn't the menu or button)
document.addEventListener('click', function(event) {
    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-btn');
    
    // Check if the click happened outside the menu and outside the start button
    if (menu.style.display === 'flex' && !menu.contains(event.target) && !btn.contains(event.target)) {
        menu.style.display = 'none';
        btn.classList.remove('active');
    }
});

/* --- WINDOWS --- */
function openWindow(id) {
    var win = document.getElementById(id);
    var taskBtn = document.getElementById('task-' + id);

    win.style.display = 'flex';
    if (taskBtn) taskBtn.style.display = 'flex';
    bringToFront(id);
}

function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
    var taskBtn = document.getElementById('task-' + id);
    if (taskBtn) taskBtn.style.display = 'none';
}

function minimizeWindow(id) {
    document.getElementById(id).style.display = 'none';
    var taskBtn = document.getElementById('task-' + id);
    if (taskBtn) taskBtn.classList.remove('active');
}

function bringToFront(id) {
    highestZ++;
    var win = document.getElementById(id);
    
    if (win) {
        win.style.zIndex = highestZ;

        // Visuals: Active Title Bar
        document.querySelectorAll('.title-bar').forEach(function(tb) {
            tb.classList.remove('active-bar');
        });
        var titleBar = win.querySelector('.title-bar');
        if (titleBar) titleBar.classList.add('active-bar');

        // Visuals: Active Taskbar Button
        document.querySelectorAll('.task-button').forEach(function(btn) {
            btn.classList.remove('active');
        });
        var taskBtn = document.getElementById('task-' + id);
        if (taskBtn) taskBtn.classList.add('active');
    }
}

/* --- DRAGGING --- */
function startDrag(e, id) {
    e.preventDefault(); // Stop text selection
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

// Global Drag Listeners
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
// Just run the clock immediately
setInterval(updateClock, 1000);
updateClock();
// Open default window (ensure this element exists)
if (document.getElementById('win-me')) {
    openWindow('win-me');
}
