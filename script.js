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
        // Only snap to the grid if the icon was actually moved
        if (hasDraggedIcon) {
            var currentX = currentIcon.offsetLeft;
            var currentY = currentIcon.offsetTop;
            var snappedX = Math.max(10, Math.round((currentX - 10) / 90) * 90 + 10);
            var snappedY = Math.max(10, Math.round((currentY - 10) / 90) * 90 + 10);
            currentIcon.style.left = snappedX + "px";
            currentIcon.style.top = snappedY + "px";
        }
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

/* --- DIGITAL ASSISTANT LOGIC --- */
document.addEventListener("DOMContentLoaded", () => {
    const assistant = document.getElementById("assistant-character");
    const bubble = document.getElementById("assistant-speech-bubble");
    const dialogueBox = document.getElementById("assistant-dialogue");
    const closeBtn = document.getElementById("bubble-close-btn");

    const dialogues = [
        "Are you lost? Try the start menu.",
        "It looks like you are trying to build a website.",
        "Stop dawdling and click something.",
        "I'm keeping an eye on your cursor.",
        "Don't forget to bookmark this page!",
        "Have you tried turning it off and on again?"
    ];

    let currentState = 1;
    let interactionTimer = null;
    let speechTimer = null;

    // Wiggle Detection Variables
    let lastX = 0;
    let wiggleDirection = 0;
    let wiggleCounter = 0;
    let wiggleResetTimer = null;

    // Helper: Change the image state
    function setAssistantState(stateNum) {
        // Only change if it's a new state and we aren't currently in a reaction state (3 or 4)
        if (currentState !== stateNum) {
             // Don't override click/wiggle reactions with proximity sensor
            if((currentState === 3 || currentState === 4) && stateNum === 2) return;

            currentState = stateNum;
            assistant.src = `assets/assistant/state${stateNum}.png`;
        }
    }

    // Helper: Trigger a temporary reaction state, then return to idle
    function triggerReaction(stateNum, duration = 2500) {
        clearTimeout(interactionTimer); // Clear pending returns
        currentState = stateNum;
        assistant.src = `assets/assistant/state${stateNum}.png`;
        
        interactionTimer = setTimeout(() => {
            currentState = 1; // Reset state variable
            setAssistantState(1); // Visually return to idle
        }, duration);
    }

    // Helper: Close dialogue
    function closeDialogue() {
         bubble.style.display = "none";
         clearTimeout(speechTimer);
    }

    // --- Event Listeners ---

    // 1. Close bubble on click
    closeBtn.addEventListener("click", closeDialogue);

    // 2. Random Dialogue Every 30 Seconds
    setInterval(() => {
        if(bubble.style.display === 'block') return; // Don't interrupt if already talking

        const randomText = dialogues[Math.floor(Math.random() * dialogues.length)];
        dialogueBox.innerText = randomText;
        bubble.style.display = "block";
        
        // Auto-hide after 8 seconds if not manually closed
        clearTimeout(speechTimer);
        speechTimer = setTimeout(closeDialogue, 8000);
    }, 30000);


    // 3. Proximity Detection (State 2) on the DOCUMENT level
    document.addEventListener("mousemove", (e) => {
        // If currently reacting (clicked or wiggled), ignore proximity
        if (currentState === 3 || currentState === 4) return; 

        const rect = assistant.getBoundingClientRect();
        // Calculate center of assistant
        const charX = rect.left + (rect.width / 2);
        const charY = rect.top + (rect.height / 2);
        
        // Distance formula
        const distance = Math.hypot(e.clientX - charX, e.clientY - charY);
        // Increased distance threshold since character is bigger
        if (distance < 300) {
            setAssistantState(2); // Close by
        } else {
            setAssistantState(1); // Idle
        }
    });

    // 4. Click Detection (State 3) with dynamic bounce and immediate reset
    assistant.addEventListener("click", () => {
        // Clear any existing reaction timers so they don't overlap
        clearTimeout(interactionTimer);
        
        // Remember what state we were in (likely State 2, since your mouse is hovering)
        const prevState = (currentState === 3 || currentState === 4) ? 1 : currentState;

        // Immediately set the scared state
        currentState = 3;
        assistant.src = `assets/assistant/state3.png`;
        
        // Add the scared bounce animation class
        assistant.classList.add("scared");
        
        // Exactly at 600ms (when the CSS bounce finishes), revert the class AND the state
        interactionTimer = setTimeout(() => {
            assistant.classList.remove("scared");
            currentState = prevState; 
            assistant.src = `assets/assistant/state${prevState}.png`;
        }, 600);
    });

    // 5. Improved Wiggle Detection (State 4) on the element level
    assistant.addEventListener("mousemove", (e) => {
        // Don't detect wiggles if already reacting to a wiggle or click
        if (currentState === 3 || currentState === 4) return;

        const currentX = e.clientX;
        // Determine current direction (1 for right, -1 for left)
        let newDirection = currentX > lastX ? 1 : -1;

        // If direction changed since last move, increase counter
        if (newDirection !== wiggleDirection && lastX !== 0) {
            wiggleCounter++;
        }
        
        // Update trackers
        wiggleDirection = newDirection;
        lastX = currentX;

        // Reset wiggle counter if movement stops for a moment
        clearTimeout(wiggleResetTimer);
        wiggleResetTimer = setTimeout(() => {
            wiggleCounter = 0;
            lastX = 0; // Reset position tracker too
        }, 20); // Stop wiggling for 20ms resets the count

        // Trigger threshold (needs 6 direction changes quickly)
        if (wiggleCounter >= 6) {
            wiggleCounter = 0; // Reset counter immediately so it doesn't re-trigger
            triggerReaction(4, 3000); // State 4 for 3 seconds
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const img = document.getElementById('screensaver');
    
    // If you forgot to add the HTML, this will yell at you in the console instead of just breaking quietly.
    if (!img) {
        console.error("Screensaver image not found! Check your HTML.");
        return; 
    }

    // Set initial position randomly within the window
    let posX = Math.random() * (window.innerWidth - 100);
    let posY = Math.random() * (window.innerHeight - 100);
    let velX = .75; 
    let velY = .75;
    const imgSize = 100; // This must match your image width/height

    function update() {
        posX += velX;
        posY += velY;

        // Bounce off right and left walls
        if (posX + imgSize >= window.innerWidth || posX <= 0) {
            velX *= -1;
            posX = posX <= 0 ? 0 : window.innerWidth - imgSize;
        }

        // Bounce off top and bottom walls
        if (posY + imgSize >= window.innerHeight || posY <= 0) {
            velY *= -1;
            posY = posY <= 0 ? 0 : window.innerHeight - imgSize;
        }

        // Apply movement visually
        img.style.transform = `translate(${posX}px, ${posY}px)`;
        
        // Stay behind the active window using your existing system
        img.style.zIndex = Math.max(0, highestZ - 1);

        requestAnimationFrame(update);
    }

    // Start the loop
    update();
});
