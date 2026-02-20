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
    var taskBtn = document.getElementById('task-' + id);
    if (taskBtn) taskBtn.classList.remove('active');
}

function toggleWindow(id) {
    var win = document.getElementById(id);
    if (win.style.display === 'none') { 
        openWindow(id); 
    } else {
        var titleBar = win.querySelector('.title-bar');
        if (titleBar && titleBar.classList.contains('active-bar')) {
            minimizeWindow(id);
        } else {
            bringToFront(id);
        }
    }
}

function bringToFront(id) {
    highestZ++;
    var win = document.getElementById(id);
    if (win) {
        win.style.zIndex = highestZ;
        
        document.querySelectorAll('.title-bar').forEach(tb => tb.classList.remove('active-bar'));
        var titleBar = win.querySelector('.title-bar');
        if (titleBar) titleBar.classList.add('active-bar');

        document.querySelectorAll('.task-button').forEach(btn => btn.classList.remove('active'));
        var taskBtn = document.getElementById('task-' + id);
        if (taskBtn) taskBtn.classList.add('active');
    }
}

/* --- DRAG --- */
function startDrag(e, id) {
    bringToFront(id);
    currentWindow = document.getElementById(id);
    
    var rect = currentWindow.getBoundingClientRect();
    currentWindow.style.transform = "none";
    currentWindow.style.left = rect.left + "px";
    currentWindow.style.top = rect.top + "px";

    initialX = e.clientX - rect.left;
    initialY = e.clientY - rect.top;
    isDragging = true;
}

document.addEventListener('mousemove', function(e) {
    if (isDragging && currentWindow) {
        e.preventDefault(); 
        currentWindow.style.left = (e.clientX - initialX) + "px";
        currentWindow.style.top = (e.clientY - initialY) + "px";
    }
});

document.addEventListener('mouseup', function() { 
    isDragging = false; 
    currentWindow = null; 
});

/* --- PAINT --- */
function setColor(color, element) {
    currentColor = color;
    document.querySelectorAll('.color-box').forEach(b => b.classList.remove('active-color'));
    element.classList.add('active-color');
}
function clearCanvas() { ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

/* --- EXPORT PAINTING --- */
// This is the receiver for your Save button!
function exportCanvas() {
    var link = document.createElement('a');
    link.download = 'c4tling_drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

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
        canvas.onmouseleave = function() { painting = false; };
    }

    setInterval(function() {
        var now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }, 1000);

    // This makes clicking ANYWHERE on a window bring it to the front
    document.querySelectorAll('.window').forEach(function(win) {
        win.addEventListener('mousedown', function() {
            bringToFront(this.id);
        });
    });
    
    if (document.getElementById('win-me')) openWindow('win-me');
};

/* --- TABS --- */
function switchTab(tabId, tabElement) {
    var windowBody = tabElement.closest('.window-body');
    if (!windowBody) return;
    
    windowBody.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-content'));
    windowBody.querySelectorAll('.tab').forEach(t => t.classList.remove('active-tab'));
    
    document.getElementById(tabId).classList.add('active-content');
    tabElement.classList.add('active-tab');
}
