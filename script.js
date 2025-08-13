document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
            if(themeToggleLightIcon) themeToggleLightIcon.style.display = 'block';
            if(themeToggleDarkIcon) themeToggleDarkIcon.style.display = 'none';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
            if(themeToggleLightIcon) themeToggleLightIcon.style.display = 'none';
            if(themeToggleDarkIcon) themeToggleDarkIcon.style.display = 'block';
        }
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('color-theme');
    applyTheme(savedTheme === 'dark' || (savedTheme === null && prefersDark));
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => applyTheme(!document.documentElement.classList.contains('dark')));
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.getAttribute('href').startsWith('mailto:')) { return; }
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            if(!mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
            const targetElement = document.querySelector(this.getAttribute('href'));
            if(targetElement) { targetElement.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    // --- Typing Animation ---
    const textToType = "Heya, apoorv here!";
    const typingElement = document.getElementById('typing-animation');
    if (typingElement) {
        let i = 0;
        typingElement.innerHTML = '<span class="blinking-cursor">|</span>';
        function type() {
            if (i < textToType.length) {
                typingElement.innerHTML = textToType.substring(0, i + 1) + '<span class="blinking-cursor">|</span>';
                i++;
                setTimeout(type, 120);
            } else {
                typingElement.innerHTML = textToType + '<span class="blinking-cursor">|</span>';
            }
        }
        setTimeout(type, 500);
    }

    // --- Galaxy Spiral Animation ---
    const canvas = document.getElementById('galaxy-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let frame = 0;

        function resizeCanvas() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }

        function drawBranch(x, y, len, angle, branchWidth) {
            ctx.beginPath();
            ctx.save();
            ctx.lineWidth = branchWidth;
            ctx.translate(x, y);
            ctx.rotate(angle * Math.PI / 180);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -len);
            ctx.strokeStyle = document.documentElement.classList.contains('dark') ? 'rgba(245, 245, 245, 0.5)' : 'rgba(26, 26, 26, 0.5)';
            ctx.stroke();
            if (len < 10) {
                ctx.restore();
                return;
            }
            drawBranch(0, -len, len * 0.8, angle + 10, branchWidth * 0.8);
            drawBranch(0, -len, len * 0.8, angle - 10, branchWidth * 0.8);
            ctx.restore();
        }

        function animate() {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const startY = canvas.height * 0.9;
            const len = canvas.height / 8;
            const initialAngle = Math.sin(frame * 0.005) * 20;
            drawBranch(centerX, startY, len, initialAngle, 4);
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();
    }

    // --- Projects Show More/Less ---
    const projectCards = Array.from(document.querySelectorAll('#projects .project-card'));
    const projectsToggleBtn = document.getElementById('projects-toggle');
    if (projectCards.length && projectsToggleBtn) {
        const initiallyVisible = 3;
        function applyProjectVisibility(showAll) {
            projectCards.forEach((card, index) => {
                if (!showAll && index >= initiallyVisible) {
                    card.classList.add('hidden');
                } else {
                    card.classList.remove('hidden');
                }
            });
            projectsToggleBtn.textContent = showAll ? 'Show less' : 'Show more';
        }
        let showingAll = false;
        applyProjectVisibility(showingAll);
        projectsToggleBtn.addEventListener('click', () => {
            showingAll = !showingAll;
            applyProjectVisibility(showingAll);
        });
    }

    // --- Experience Card Stack ---
    const deck = document.getElementById('experience-deck');
    if(deck) {
        const cards = Array.from(deck.querySelectorAll('.experience-card'));
        const prevBtn = document.getElementById('prev-exp');
        const nextBtn = document.getElementById('next-exp');
        let currentIndex = 0;
        let isThrottled = false;
        let touchStartX = 0;
        let touchEndX = 0;
        let lastWheelTime = 0;
        const WHEEL_COOLDOWN = 800;

        function updateCards() {
            cards.forEach((card, index) => {
                const offset = index - currentIndex;
                let transform, opacity, scale;
                if (offset === 0) {
                    scale = 1; transform = 'translate(-50%, -50%)'; opacity = 1;
                } else if (offset === 1 || offset === -cards.length + 1) {
                    scale = 0.85; transform = 'translate(2.5%, -50%)'; opacity = 0.4;
                } else if (offset === -1 || offset === cards.length - 1) {
                    scale = 0.85; transform = 'translate(-102.5%, -50%)'; opacity = 0.4;
                } else {
                    scale = 0.8; transform = 'translate(-50%, -50%)'; opacity = 0;
                }
                card.style.transform = `${transform} scale(${scale})`;
                card.style.opacity = opacity;
                card.style.zIndex = cards.length - Math.abs(offset);
                card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            prevBtn.disabled = false;
            nextBtn.disabled = false;
        }

        function navigate(direction) {
            if (isThrottled) return;
            isThrottled = true;
            currentIndex = (currentIndex + direction + cards.length) % cards.length;
            updateCards();
            setTimeout(() => { isThrottled = false; }, 500);
        }

        deck.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                const now = Date.now();
                if (now - lastWheelTime < WHEEL_COOLDOWN) { return; }
                if (Math.abs(e.deltaX) > 10) {
                    lastWheelTime = now;
                    if (e.deltaX > 0) { navigate(-1); } else { navigate(1); }
                }
            }
        }, { passive: false });

        deck.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        deck.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) { navigate(-1); } else { navigate(1); }
            }
        }

        let isDragging = false, startX = 0, currentX = 0;
        deck.addEventListener('mousedown', (e) => { isDragging = true; startX = e.clientX; currentX = startX; deck.style.cursor = 'grabbing'; });
        deck.addEventListener('mousemove', (e) => { if (!isDragging) return; currentX = e.clientX; });
        deck.addEventListener('mouseup', () => {
            if (!isDragging) return; isDragging = false; deck.style.cursor = 'grab';
            const dragDistance = currentX - startX;
            const dragThreshold = 100;
            if (Math.abs(dragDistance) > dragThreshold) {
                if (dragDistance > 0) { navigate(-1); } else { navigate(1); }
            }
        });
        deck.addEventListener('mouseleave', () => { if (isDragging) { isDragging = false; deck.style.cursor = 'grab'; } });

        prevBtn.addEventListener('click', () => navigate(-1));
        nextBtn.addEventListener('click', () => navigate(1));
        updateCards();
    }

    // --- Terminal Logic ---
    const terminalWindow = document.getElementById('terminal-window');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const terminalInputLine = document.getElementById('terminal-input-line');
    let animationFrameId;

    if (terminalWindow) {
        const welcomeMessage = "Welcome to my interactive terminal!\nType 'help' to see available commands, or just ask me a question.\n";
        printToTerminal(welcomeMessage);

        terminalInput.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const command = this.value.trim(); // Keep case for AI
                if (!command) return;

                printToTerminal(`<br><span class="text-deep-green">user@apoorv:~$</span> ${command}`);
                executeCommand(command);
                this.value = "";
                terminalWindow.scrollTop = terminalWindow.scrollHeight;
            }
        });
    }

    function printToTerminal(text) {
        terminalOutput.innerHTML += text.replace(/\n/g, '<br>');
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
    }

    function showPrompt() {
        terminalInputLine.style.display = 'flex';
        terminalInput.focus();
    }

    // ⭐ KEY CHANGE 1: Make this function 'async' to use 'await'
    async function executeCommand(command) {
        const lowerCaseCommand = command.toLowerCase();

        const quotes = [
            "The best way to predict the future is to invent it. - Alan Kay",
            "It's not a bug, it's an undocumented feature.",
            "Programming isn't about what you know; it's about what you can figure out. - Chris Pine",
            "The most dangerous phrase in the language is, 'We've always done it this way.' - Grace Hopper"
        ];
        const greetings = ['hi', 'hello', 'hey'];

        if (greetings.includes(lowerCaseCommand)) {
            printToTerminal(`\nHello! I hope you are doing well. Please write 'help' for more options or just ask me a question.`);
            return;
        }

        const commands = {
            'help': `<span class="text-gray-400">Available commands:</span>\n  <span class="text-deep-green">about</span>        - <span class="text-gray-400">Who am I?</span>\n  <span class="text-deep-green">experience</span>   - <span class="text-gray-400">My work experience.</span>\n  <span class="text-deep-green">projects</span>     - <span class="text-gray-400">View my recent work.</span>\n  <span class="text-deep-green">socials</span>      - <span class="text-gray-400">Display contact links.</span>\n  <span class="text-deep-green">location</span>     - <span class="text-gray-400">Shows my current location.</span>\n  <span class="text-deep-green">whereami</span>     - <span class="text-gray-400">Get *your* current location.</span>\n  <span class="text-deep-green">quote</span>        - <span class="text-gray-400">Display a random quote.</span>\n  <span class="text-deep-green">date</span>         - <span class="text-gray-400">Show the current date and time.</span>\n  <span class="text-deep-green">matrix</span>       - <span class="text-gray-400">Enter the matrix...</span>\n  <span class="text-deep-green">clear</span>        - <span class="text-gray-400">Clear the terminal screen.</span>`,
            'about': "Hello! I'm Apoorv, a Computer Science student based in New York with a deep passion for turning complex problems into elegant, functional software. I'm currently exploring AI and Quantum Computing.",
            'projects': 'My Projects:\n1. Voice Assistant Bot (Python)\n2. Password Manager (Web)\n3. Quantum Learning Portal (Web)\n4. Veridium — Web Authentication Service (WIP)\n5. Personal Portfolio (this website!)',
            'experience': 'My Experience:\n- API Development Intern @ Pair Bytes (Jun–Aug 2023)\n- Research Assistant — Quantum Computing & AI @ Adelphi University (Summer–Fall, Current)',
            'socials': `You can reach me at:\n- Email: <a href="mailto:er.apoorvsingh@gmail.com">er.apoorvsingh@gmail.com</a>\n- GitHub: <a href="https://github.com/apoorvvvv" target="_blank">https://github.com/apoorvvvv</a>\n- LinkedIn: <a href="https://www.linkedin.com/in/apoorv-singh-15490a216/" target="_blank">https://www.linkedin.com/in/apoorv-singh-15490a216/</a>`,
            'location': 'Currently based in New York, USA.',
            'quote': () => { printToTerminal(`\n${quotes[Math.floor(Math.random() * quotes.length)]}`); },
            'date': () => { printToTerminal(`\n${new Date().toLocaleString()}`); },
            'matrix': () => { runMatrix(); },
            'whereami': async () => {
                printToTerminal('\nFetching your location...');
                if (!navigator.geolocation) {
                    printToTerminal('\nGeolocation is not supported by your browser.'); return;
                }
                try {
                    const position = await new Promise((resolve, reject) => { navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }); });
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
                    const country = data.address.country || 'Unknown Country';
                    printToTerminal(`\nYour location is approximately: ${city}, ${country}`);
                } catch (error) {
                    printToTerminal('\nCould not retrieve your location. Please ensure you have granted permission.');
                }
            },
            'clear': () => {
                terminalOutput.innerHTML = '';
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId); animationFrameId = null;
                    const matrixCanvas = document.getElementById('matrix-canvas-fullscreen');
                    if(matrixCanvas) matrixCanvas.remove();
                    showPrompt();
                }
            }
        };

        const action = commands[lowerCaseCommand];
        if (typeof action === 'function') {
            await action();
        } else if (action) {
            printToTerminal(`\n${action}`);
        } else {
            // ⭐ KEY CHANGE 2: If the command is not found in our list, send it to the AI
            printToTerminal('\nThinking...'); // Let the user know something is happening
            try {
                const apiUrl = 'http://localhost:8000/query';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: command }) // Send the original command with case
                });

                if (!response.ok) {
                    throw new Error('Network response from AI server was not ok');
                }

                const data = await response.json();

                // Erase "Thinking..." and print the real answer
                terminalOutput.innerHTML = terminalOutput.innerHTML.replace('Thinking...', '');
                printToTerminal(data.response);

            } catch (error) {
                 // Erase "Thinking..." and print an error
                terminalOutput.innerHTML = terminalOutput.innerHTML.replace('Thinking...', '');
                printToTerminal('Sorry, I was unable to connect to my AI brain. Please make sure the local server is running.');
                console.error('Error fetching from AI:', error);
            }
        }
    }

    function runMatrix() {
        terminalInputLine.style.display = 'none';
        const matrixCanvas = document.createElement('canvas');
        matrixCanvas.id = 'matrix-canvas-fullscreen';
        matrixCanvas.style.position = 'fixed';
        matrixCanvas.style.top = '0';
        matrixCanvas.style.left = '0';
        matrixCanvas.style.width = '100vw';
        matrixCanvas.style.height = '100vh';
        matrixCanvas.style.backgroundColor = 'black';
        matrixCanvas.style.zIndex = '9999';
        document.body.appendChild(matrixCanvas);

        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const alphabet = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 16;
        const columns = matrixCanvas.width/fontSize;
        const rainDrops = [];
        for(let x=0; x<columns; x++) { rainDrops[x] = 1; }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0,0, matrixCanvas.width, matrixCanvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            for(let i=0; i<rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i*fontSize, rainDrops[i]*fontSize);
                if(rainDrops[i]*fontSize > matrixCanvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
            animationFrameId = requestAnimationFrame(draw);
        };
        draw();

        setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            if (matrixCanvas) matrixCanvas.remove();
            printToTerminal('\nWake up, Neo... \n');
            showPrompt();
        }, 5000);
    }
});
