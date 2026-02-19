var highestZ = 100;
var isDragging = false;
var currentWindow = null;
var initialX, initialY;
var canvas, ctx, painting = false, currentColor = 'black';

/* --- SHUTDOWN --- */
function tvShutdown() {
    document.getElementById('shutdown-overlay').style.display = 'flex';
    closeStartMenu();
}
function reboot() { document.getElementById('shutdown-overlay').style.display = 'none'; }

/* --- START MENU --- */
function toggleStartMenu(event) {
    if (event) event.stopPropagation();
    var menu = document.getElementById('start-menu');
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}
function closeStartMenu() { document.getElementById('start-menu').style.display = 'none'; }
document.addEventListener('click', function() { closeStartMenu(); });

/* --- WINDOWS --- */
function openWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    
    win.style.display = 'flex';
    
    // Safety check for taskbar button
    var taskBtn = document.getElementById('task-' + id);
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
}

function toggleWindow(id) {
    var win = document.getElementById(id);
    if (win.style.display === 'none') { openWindow(id); } 
    else { minimizeWindow(id); }
}

function bringToFront(id) {
    highestZ++;
    var win = document.getElementById(id);
    if (win) win.style.zIndex = highestZ;
}

/* --- DRAG --- */
function startDrag(e, id) {
    bringToFront(id);
    currentWindow = document.getElementById(id);
    initialX = e.clientX - currentWindow.offsetLeft;
    initialY = e.clientY - currentWindow.offsetTop;
    isDragging = true;
}
document.addEventListener('mousemove', function(e) {
    if (isDragging && currentWindow) {
        currentWindow.style.left = (e.clientX - initialX) + "px";
        currentWindow.style.top = (e.clientY - initialY) + "px";
        currentWindow.style.transform = "none"; 
    }
});
document.addEventListener('mouseup', function() { isDragging = false; currentWindow = null; });

/* --- PAINT --- */
function setColor(color, element) {
    currentColor = color;
    document.querySelectorAll('.color-box').forEach(b => b.classList.remove('active-color'));
    element.classList.add('active-color');
}
function clearCanvas() { ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

/* --- INIT --- */
window.onload = function() {
    canvas = document.getElementById('paintCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        clearCanvas();
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        canvas.onmousedown = function(e) { painting = true; ctx.beginPath(); ctx.moveTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top); };
        canvas.onmousemove = function(e) {
            if (painting) {
                ctx.strokeStyle = currentColor;
                ctx.lineTo(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
                ctx.stroke();
            }
        };
        canvas.onmouseup = function() { painting = false; };
    }

    setInterval(function() {
        var now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }, 1000);
    
    // Open default window
    if (document.getElementById('win-me')) openWindow('win-me');
};

function switchTab(tabId, tabElement) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-content'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active-tab'));
    document.getElementById(tabId).classList.add('active-content');
    tabElement.classList.add('active-tab');
}
