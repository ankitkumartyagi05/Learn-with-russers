/**
 * Learn with Russers - Core Application Logic
 * Version: 1.0.0
 * Author: Senior Architect AI
 */

const App = {
    // --- State Management ---
    state: {
        name: '',
        mobile: '',
        level: 1,
        xp: 0,
        streak: 0,
        goals: [],
        completedLessons: [],
        notes: [],
        currentQuestion: 0,
        score: 0,
        timerInterval: null,
        timerRunning: false,
        secondsLeft: 1500 // 25 mins
    },

    // --- Data Mocks (Simulating Backend) ---
    data: {
        lessons: [
            { id: 1, title: 'Variables', emoji: '📦', content: 'Variable ek container hota hai jisme hum data store karte hain. Jaise ek dabba jisme tum apni cheezein rakh sakte ho.', code: 'my_name = "Rohit"\nage = 15' },
            { id: 2, title: 'Data Types', emoji: '🏷️', content: 'Data types batate hain ki variable mein kaisa data hai. Jaise: Numbers, Text, True/False.', code: 'name = "Text"\nage = 25' }
        ],
        questions: [
            { q: 'Variable ka correct syntax kya hai?', opts: ['variable = "value"', '"value" = variable', 'var: value', 'variable -> value'], ans: 0 },
            { q: 'Kya "age = 25" mein 25 kya hai?', opts: ['Variable', 'Value', 'Function', 'Keyword'], ans: 1 },
            { q: 'String data type kis cheez ka example hai?', opts: ['25', 'True', '"Hello"', 'None'], ans: 2 },
            { q: 'Boolean mein kitne values hote hain?', opts: ['1', '2', '10', 'Infinite'], ans: 1 },
            { q: 'Kya "print()" ek variable hai?', opts: ['Haan', 'Nahi, ye function hai', 'Shayad', 'Pata nahi'], ans: 1 }
        ],
        tasks: [
            { id: 1, text: 'Complete 1 Lesson', done: false },
            { id: 2, text: 'Solve 5 Questions', done: false },
            { id: 3, text: 'Use Focus Timer', done: false }
        ],
        careers: {
            web: {
                title: 'Web Developer',
                emoji: '💻',
                subtitle: 'Build beautiful and interactive websites',
                steps: [
                    { title: 'HTML & CSS Basics', desc: 'Foundation of web development', status: 'done' },
                    { title: 'JavaScript Fundamentals', desc: 'Making pages interactive', status: 'current' },
                    { title: 'React Framework', desc: 'Building modern single-page apps', status: 'pending' },
                    { title: 'Backend with Node.js', desc: 'Server-side development', status: 'pending' },
                    { title: 'Databases & APIs', desc: 'Storing and retrieving data', status: 'pending' },
                    { title: 'Full Stack Projects', desc: 'Combine frontend & backend', status: 'pending' }
                ]
            },
            mobile: {
                title: 'Mobile App Developer',
                emoji: '📱',
                subtitle: 'Create amazing mobile applications',
                steps: [
                    { title: 'JavaScript/TypeScript', desc: 'Core programming language', status: 'done' },
                    { title: 'React Native Basics', desc: 'Cross-platform mobile development', status: 'current' },
                    { title: 'Mobile UI Design', desc: 'Beautiful user interfaces', status: 'pending' },
                    { title: 'API Integration', desc: 'Connecting to backend services', status: 'pending' },
                    { title: 'App Publishing', desc: 'Deploy to App Store & Play Store', status: 'pending' },
                    { title: 'Advanced Features', desc: 'Notifications, Offline Mode, etc.', status: 'pending' }
                ]
            },
            data: {
                title: 'Data Scientist',
                emoji: '📊',
                subtitle: 'Unlock insights from data',
                steps: [
                    { title: 'Python Fundamentals', desc: 'Programming basics', status: 'done' },
                    { title: 'Data Analysis with Pandas', desc: 'Working with datasets', status: 'current' },
                    { title: 'Data Visualization', desc: 'Charts, graphs, dashboards', status: 'pending' },
                    { title: 'Statistics & Probability', desc: 'Mathematical foundations', status: 'pending' },
                    { title: 'Machine Learning Basics', desc: 'Popular ML algorithms', status: 'pending' },
                    { title: 'Real-world Projects', desc: 'Build your portfolio', status: 'pending' }
                ]
            },
            cloud: {
                title: 'Cloud Engineer',
                emoji: '☁️',
                subtitle: 'Build scalable cloud solutions',
                steps: [
                    { title: 'Linux Fundamentals', desc: 'Operating system basics', status: 'done' },
                    { title: 'AWS Basics', desc: 'Cloud computing essentials', status: 'current' },
                    { title: 'Networking & Security', desc: 'VPCs, firewalls, encryption', status: 'pending' },
                    { title: 'Infrastructure as Code', desc: 'Terraform, CloudFormation', status: 'pending' },
                    { title: 'Containerization', desc: 'Docker and Kubernetes', status: 'pending' },
                    { title: 'CI/CD Pipelines', desc: 'Automation and deployment', status: 'pending' }
                ]
            },
            ai: {
                title: 'AI/ML Engineer',
                emoji: '🤖',
                subtitle: 'Build intelligent systems',
                steps: [
                    { title: 'Python & Libraries', desc: 'NumPy, Pandas, Scikit-learn', status: 'done' },
                    { title: 'Deep Learning Basics', desc: 'Neural networks fundamentals', status: 'current' },
                    { title: 'TensorFlow & PyTorch', desc: 'Popular ML frameworks', status: 'pending' },
                    { title: 'Computer Vision', desc: 'Image processing & recognition', status: 'pending' },
                    { title: 'Natural Language Processing', desc: 'Text & language understanding', status: 'pending' },
                    { title: 'Production ML Models', desc: 'Deploy and monitor models', status: 'pending' }
                ]
            },
            devops: {
                title: 'DevOps Engineer',
                emoji: '⚙️',
                subtitle: 'Streamline development & operations',
                steps: [
                    { title: 'Linux & Shell Scripting', desc: 'System administration', status: 'done' },
                    { title: 'Git & Version Control', desc: 'Collaboration and version management', status: 'current' },
                    { title: 'Docker Containerization', desc: 'Package applications', status: 'pending' },
                    { title: 'Kubernetes Orchestration', desc: 'Container management at scale', status: 'pending' },
                    { title: 'CI/CD with Jenkins', desc: 'Continuous integration & deployment', status: 'pending' },
                    { title: 'Monitoring & Logging', desc: 'System observability', status: 'pending' }
                ]
            }
        }
    },

    // --- Initialization ---
    init() {
        // Load saved state from LocalStorage
        const saved = localStorage.getItem('russers_state');
        if (saved) {
            this.state = JSON.parse(saved);
        }

        // Hide Loader
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');

            // Initial Route Logic
            if (this.state.name) {
                this.navigateTo('dashboard');
            } else {
                this.navigateTo('login');
            }
        }, 1500);
    },

    saveState() {
        localStorage.setItem('russers_state', JSON.stringify(this.state));
    },

    // --- Navigation Engine ---
    navigateTo(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        // Show target screen
        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.add('active');
        } else {
            console.error(`Screen ${screenId} not found`);
            return;
        }

        // Screen specific initialization
        this.onScreenEnter(screenId);
    },

    navTo(element) {
        const target = element.getAttribute('data-target');
        if (target) this.navigateTo(target);
    },

    onScreenEnter(screenId) {
        // Update UI elements based on state when entering screen
        switch (screenId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'study':
                this.loadLesson();
                break;
            case 'practice':
                this.loadQuestion();
                break;
            case 'planner':
                this.loadTasks();
                break;
            case 'progress':
                this.loadStats();
                break;
            case 'notes':
                this.loadNotes();
                break;
            case 'career':
                this.loadCareerScreen();
                break;
            case 'test':
                document.getElementById('cert-name').innerText = this.state.name;
                break;
        }
    },

    // --- Authentication ---
    login() {
        const name = document.getElementById('login-name').value;
        const mobile = document.getElementById('login-mobile').value;

        if (!name) {
            this.showToast('Please enter your name');
            return;
        }

        this.state.name = name;
        this.state.mobile = mobile;
        this.saveState();

        this.navigateTo('onboarding');
    },

    logout() {
        localStorage.removeItem('russers_state');
        location.reload();
    },

    setLevel(level) {
        this.state.level = level === 'Beginner' ? 1 : (level === 'Intermediate' ? 5 : 10);
        this.showToast(`${level} level selected!`);
        this.saveState();
    },

    toggleChip(chip) {
        chip.classList.toggle('active');
    },

    // --- Dashboard Logic ---
    updateDashboard() {
        document.getElementById('dash-name').innerText = this.state.name;
        document.getElementById('dash-level').innerText = this.state.level;
        document.getElementById('dash-xp').innerText = this.state.xp;
        document.getElementById('dash-streak').innerText = this.state.streak;

        const progress = (this.state.xp % 100); // Assuming 100 XP per level
        document.getElementById('dash-xp-bar').style.width = `${progress}%`;
    },

    // --- Study Logic ---
    currentLessonIndex: 0,
    loadLesson() {
        // In a real app, this fetches from backend. Here we cycle through mocks.
        const lesson = this.data.lessons[this.currentLessonIndex % this.data.lessons.length];

        document.getElementById('study-topic').innerText = lesson.title;
        document.getElementById('study-title').innerText = lesson.title;
        document.getElementById('study-content').innerHTML = `<p>${lesson.content}</p>`;
        document.getElementById('study-code').innerText = lesson.code;
    },

    explainAgain() {
        this.showToast('Simpler explanation loading...');
        // Simulate content change
        const content = document.getElementById('study-content');
        content.innerHTML += "<p><strong>Simple View:</strong> Variable sirf ek naam hai jise value dete hain.</p>";
    },

    completeLesson() {
        this.addXp(10);
        this.currentLessonIndex++;
        this.state.completedLessons.push(this.currentLessonIndex);
        this.saveState();
        this.showToast('Lesson Complete! +10 XP');
        this.navigateTo('practice');
    },

    copyCode() {
        const code = document.getElementById('study-code').innerText;
        navigator.clipboard.writeText(code).then(() => {
            this.showToast('Code copied!');
        });
    },

    // --- Practice Logic ---
    loadQuestion() {
        const q = this.data.questions[this.state.currentQuestion % this.data.questions.length];
        document.getElementById('q-text').innerText = q.q;
        document.getElementById('q-num').innerText = this.state.currentQuestion + 1;
        document.getElementById('btn-next-q').classList.add('hidden');

        const optionsList = document.getElementById('options-list');
        optionsList.innerHTML = '';

        q.opts.forEach((opt, index) => {
            const div = document.createElement('div');
            div.className = 'option-item';
            div.innerText = opt;
            div.onclick = () => this.selectOption(div, index);
            optionsList.appendChild(div);
        });

        this.updateDots();
    },

    selectOption(element, index) {
        // Reset previous selection
        document.querySelectorAll('.option-item').forEach(e => e.classList.remove('selected'));
        element.classList.add('selected');

        // Check answer
        const q = this.data.questions[this.state.currentQuestion % this.data.questions.length];
        if (index === q.ans) {
            element.classList.add('correct');
            this.addXp(5);
            this.state.score += 10;
            document.getElementById('practice-score').innerText = this.state.score;
            this.showToast('Correct! +5 XP');

            // Enable next button
            setTimeout(() => {
                document.getElementById('btn-next-q').classList.remove('hidden');
            }, 500);
        } else {
            element.classList.add('wrong');
            this.showToast('Oops! Wrong answer.');
        }
    },

    nextQuestion() {
        this.state.currentQuestion++;
        this.saveState();
        if (this.state.currentQuestion >= 5) {
            this.navigateTo('test'); // Go to certificate/results
            this.state.currentQuestion = 0;
        } else {
            this.loadQuestion();
        }
    },

    updateDots() {
        const container = document.getElementById('question-dots');
        container.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot ' + (i === this.state.currentQuestion ? 'active' : '');
            container.appendChild(dot);
        }
    },

    // --- Doubt Logic ---
    sendDoubt() {
        const input = document.getElementById('doubt-input');
        const text = input.value;
        if (!text) return;

        const chatArea = document.getElementById('chat-area');

        // Add User Bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-bubble user';
        userBubble.innerHTML = `<div class="chat-msg"><p>${text}</p></div>`;
        chatArea.appendChild(userBubble);
        input.value = '';

        // Simulate AI Response
        setTimeout(() => {
            const aiBubble = document.createElement('div');
            aiBubble.className = 'chat-bubble ai';
            aiBubble.innerHTML = `
                <div class="chat-avatar">🤖</div>
                <div class="chat-msg">
                    <p>Main samajh gaya! "${text}" ke baare mein yeh hai simple explanation...</p>
                    <p>Abhi demo mode mein hoon, jaldi hi full AI aayega! 😊</p>
                </div>
            `;
            chatArea.appendChild(aiBubble);
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 1000);

        chatArea.scrollTop = chatArea.scrollHeight;
    },

    voiceInput() {
        this.showToast('Listening... (Feature coming soon)');
    },

    // --- Planner Logic ---
    loadTasks() {
        const container = document.getElementById('tasks-list');
        container.innerHTML = '';

        // Load from state or use default
        const tasks = this.state.goals.length ? this.state.goals : this.data.tasks;

        tasks.forEach((task, idx) => {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.onclick = () => this.toggleTask(idx);
            div.innerHTML = `
                <div class="check-box ${task.done ? 'checked' : ''}">${task.done ? '✓' : ''}</div>
                <span style="${task.done ? 'text-decoration: line-through; opacity: 0.6' : ''}">${task.text}</span>
            `;
            container.appendChild(div);
        });

        // Update header progress
        const doneCount = tasks.filter(t => t.done).length;
        document.getElementById('goals-done').innerText = doneCount;
        document.getElementById('goals-bar').style.width = `${(doneCount / tasks.length) * 100}%`;
    },

    toggleTask(index) {
        if (!this.state.goals.length) this.state.goals = [...this.data.tasks];
        this.state.goals[index].done = !this.state.goals[index].done;
        this.saveState();
        this.loadTasks(); // Re-render
        if (this.state.goals[index].done) this.addXp(2);
    },

    // --- Timer Logic ---
    toggleTimer() {
        const btn = document.getElementById('timer-btn');
        const display = document.getElementById('timer-display');

        if (this.state.timerRunning) {
            clearInterval(this.state.timerInterval);
            btn.innerText = "Resume";
        } else {
            this.state.timerInterval = setInterval(() => {
                if (this.state.secondsLeft <= 0) {
                    clearInterval(this.state.timerInterval);
                    this.showToast("Time's up! Great focus! 🎉");
                    this.addXp(20);
                    this.state.secondsLeft = 1500;
                    btn.innerText = "Start Focus";
                } else {
                    this.state.secondsLeft--;
                    const mins = Math.floor(this.state.secondsLeft / 60);
                    const secs = this.state.secondsLeft % 60;
                    display.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                }
            }, 1000);
            btn.innerText = "Pause";
        }
        this.state.timerRunning = !this.state.timerRunning;
    },

    // --- Misc Logic ---
    loadStats() {
        document.getElementById('stat-lessons').innerText = this.state.completedLessons.length;
        document.getElementById('stat-accuracy').innerText = this.state.score > 0 ? Math.min(100, Math.floor((this.state.score / 50) * 100)) + '%' : '0%';
    },

    loadNotes() {
        const container = document.getElementById('notes-container');
        container.innerHTML = '';

        if (this.state.notes.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No notes yet. Study a lesson to save notes!</p>';
            return;
        }

        this.state.notes.forEach(note => {
            const div = document.createElement('div');
            div.className = 'note-card';
            div.innerHTML = `<h4>${note.title}</h4><p>${note.text}</p>`;
            container.appendChild(div);
        });
    },

    addNote() {
        const title = prompt("Note Title:");
        const text = prompt("Note Content:");
        if (title && text) {
            this.state.notes.push({ title, text });
            this.saveState();
            this.loadNotes();
            this.showToast('Note saved!');
        }
    },

    scanLink() {
        const input = document.getElementById('security-link').value;
        if (!input) return;

        const resultDiv = document.getElementById('scan-result');
        resultDiv.classList.remove('hidden');

        // Simple mock check
        if (input.includes("https")) {
            resultDiv.innerHTML = `
                <div class="card" style="border: 2px solid var(--accent-green); background: #f0fdf4;">
                    <h3 style="color: #15803d;">✅ Safe Link</h3>
                    <p class="text-muted">This link seems secure.</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="card" style="border: 2px solid var(--accent-red); background: #fef2f2;">
                    <h3 style="color: #b91c1c;">⚠️ Warning</h3>
                    <p class="text-muted">This link might be unsafe or not encrypted.</p>
                </div>
            `;
        }
    },

    // --- Utility Functions ---
    addXp(amount) {
        this.state.xp += amount;
        // Check for level up
        if (this.state.xp >= this.state.level * 100) {
            this.state.level++;
            this.showToast(`LEVEL UP! You are now Level ${this.state.level} 🎉`);
        }
        this.saveState();
        this.showXpPopup(amount);
        this.updateDashboard();
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    },

    showXpPopup(amount) {
        const popup = document.getElementById('xp-popup');
        const val = document.getElementById('xp-val');
        val.innerText = amount;
        popup.classList.remove('hidden');

        setTimeout(() => {
            popup.classList.add('hidden');
        }, 1500);
    },

    // --- Career Roadmap Logic ---
    loadCareerScreen() {
        // Show domain selector by default
        document.getElementById('career-domain-selector').classList.remove('hidden');
        document.getElementById('career-roadmap-view').classList.add('hidden');
    },

    selectDomain(domainName, domainKey) {
        const career = this.data.careers[domainKey];
        if (!career) return;

        // Hide domain selector, show roadmap
        document.getElementById('career-domain-selector').classList.add('hidden');
        document.getElementById('career-roadmap-view').classList.remove('hidden');

        // Update roadmap header
        document.getElementById('roadmap-emoji').innerText = career.emoji;
        document.getElementById('roadmap-title').innerText = career.title;
        document.getElementById('roadmap-subtitle').innerText = career.subtitle;

        // Generate roadmap steps
        const container = document.getElementById('roadmap-container');
        container.innerHTML = '';

        career.steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = `roadmap-step ${step.status}`;
            stepDiv.innerHTML = `
                <div class="step-dot"></div>
                <div class="step-content">
                    <h4>${step.title}</h4>
                    <p>${step.desc}</p>
                </div>
            `;
            container.appendChild(stepDiv);
        });

        this.showToast(`Welcome to ${career.title} path! 🚀`);
    },

    backToDomainSelector() {
        document.getElementById('career-domain-selector').classList.remove('hidden');
        document.getElementById('career-roadmap-view').classList.add('hidden');
    }
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());