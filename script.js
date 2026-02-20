var highestZ = 100;
var isDragging = false;
var currentWindow = null;
var initialX, initialY;
var canvas, ctx, painting = false, currentColor = 'black';

var isSelecting = false;
var selStartX, selStartY;
var selBox;
var isDraggingIcon = false;
var currentIcon = null;
var hasDraggedIcon = false;

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
document.addEventListener('click', function(e) { 
    var menu = document.getElementById('start-menu');
    var btn = document.getElementById('start-btn');
    if (menu.style.display === 'flex' && !menu.contains(e.target) && !btn.contains(e.target)) {
        closeStartMenu();
    }
});

/* --- WINDOWS --- */
function openWindow(id) {
    var win = document.getElementById(id);
    if (!win) return;
    
    win.style.display = 'flex';
    var taskBtn = document.getElementById('task-' + id);
    if (taskBtn) taskBtn.style.display = 'flex';
    
    document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
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

/* --- DRAG WINDOWS --- */
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

/* --- DRAG ICONS --- */
function startIconDrag(e, id) {
    if (e.button !== 0) return;
    hasDraggedIcon = false; 
    document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
    currentIcon = document.getElementById(id);
    currentIcon.classList.add('selected');
    var rect = currentIcon.getBoundingClientRect();
    initialX = e.clientX - rect.left;
    initialY = e.clientY - rect.top;
    isDraggingIcon = true;
}

function handleIconClick(id) {
    if (!hasDraggedIcon) openWindow(id);
}

/* --- DESKTOP SELECTION BOX --- */
document.addEventListener('mousedown', function(e) {
    if (e.target.tagName.toLowerCase() === 'body' || e.target.classList.contains('desktop-icons') || e.target.id === 'selection-marquee') {
        isSelecting = true;
        selStartX = e.clientX;
        selStartY = e.clientY;
        selBox.style.left = selStartX + 'px';
        selBox.style.top = selStartY + 'px';
        selBox.style.width = '0px';
        selBox.style.height = '0px';
        selBox.style.display = 'block';
        document.querySelectorAll('.icon').forEach(icon => icon.classList.remove('selected'));
    }
});

/* --- GLOBAL MOUSE MOVE --- */
document.addEventListener('mousemove', function(e) {
    if (isDragging && currentWindow) {
        e.preventDefault(); 
        currentWindow.style.left = (e.clientX - initialX) + "px";
        currentWindow.style.top = (e.clientY - initialY) + "px";
    }
    
    if (isDraggingIcon && currentIcon) {
        e.preventDefault();
        hasDraggedIcon = true; 
        currentIcon.style.left = (e.clientX - initialX) + "px";
        currentIcon.style.top = (e.clientY - initialY) + "px";
    }

    if (isSelecting) {
        e.preventDefault(); 
        var currentX = e.clientX;
        var currentY = e.clientY;
        var left = Math.min(selStartX, currentX);
        var top = Math.min(selStartY, currentY);
        var width = Math.abs(selStartX - currentX);
        var height = Math.abs(selStartY - currentY);
        
        selBox.style.left = left + 'px';
        selBox.style.top = top + 'px';
        selBox.style.width = width + 'px';
        selBox.style.height = height + 'px';

        document.querySelectorAll('.icon').forEach(icon => {
            var rect = icon.getBoundingClientRect();
            if (rect.left < left + width && rect.right > left && rect.top < top + height && rect.bottom > top) {
                icon.classList.add('selected');
            } else {
                icon.classList.remove('selected');
            }
        });
    }
});

/* --- GLOBAL MOUSE UP --- */
document.addEventListener('mouseup', function() { 
    isDragging = false; currentWindow = null; 
    
    if (isDraggingIcon && currentIcon) {
        var currentX = parseInt(currentIcon.style.left) || 0;
        var currentY = parseInt(currentIcon.style.top) || 0;
        var snappedX = Math.max(10, Math.round((currentX - 10) / 90) * 90 + 10);
        var snappedY = Math.max(10, Math.round((currentY - 10) / 90) * 90 + 10);
        currentIcon.style.left = snappedX + "px";
        currentIcon.style.top = snappedY + "px";
    }
    
    isDraggingIcon = false; currentIcon = null;
    if (isSelecting) { isSelecting = false; selBox.style.display = 'none'; }
});

/* --- COMMS GATEKEEPER --- */
function acceptCommsWarning() {
    document.getElementById('comms-warning').style.display = 'none';
    document.getElementById('comms-content').style.display = 'flex';
}

/* --- IMAGE VIEWER --- */
function openImagePreview(src) {
    document.getElementById('preview-img').src = src;
    openWindow('win-preview');
}

/* --- PAINT --- */
function setColor(color, element) {
    currentColor = color;
    document.querySelectorAll('.color-box').forEach(b => b.classList.remove('active-color'));
    element.classList.add('active-color');
}
function clearCanvas() { ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

function exportCanvas() {
    var link = document.createElement('a');
    link.download = 'c4tling_drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/* --- INIT --- */
window.onload = function() {
    selBox = document.getElementById('selection-marquee');

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

    document.querySelectorAll('.window').forEach(function(win) {
        win.addEventListener('mousedown', function(e) { bringToFront(this.id); });
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
