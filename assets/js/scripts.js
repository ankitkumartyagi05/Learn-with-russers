// ==========================================
// ROUTE GUARD & AUTH MIDDLEWARE
// ==========================================

// List of pages that require authentication
const PROTECTED_ROUTES = [
    'dashboard-page',
    'learning-page',
    'practice-page',
    'chat-page',
    'rewards-page',
    'test-page',
    'certificate-page',
    'career-page',
    'referral-page'
];

const PUBLIC_ROUTES = ['auth-page', 'quiz-page'];

// Backend API base URL supports three modes:
// 1) Explicit deploy config via window.LWR_API_BASE_URL
// 2) Local file mode fallback to localhost backend
// 3) Same-origin hosted mode fallback
const DEPLOY_API_BASE_URL = (window.LWR_API_BASE_URL || '').trim();
const API_BASE_URL = DEPLOY_API_BASE_URL
    || (window.location.protocol === 'file:'
        ? 'http://127.0.0.1:8000/api/v1'
        : `${window.location.origin}/api/v1`);

async function apiRequest(endpoint, options = {}) {
    const { method = 'GET', body = null, token = AppState.authToken } = options;
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    const raw = await response.text();
    let data = null;
    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch (_error) {
            data = { detail: raw };
        }
    }

    if (!response.ok) {
        const message = data?.detail || 'Request failed. Please try again.';
        throw new Error(message);
    }

    return data;
}

function isLoginMode() {
    return document.getElementById('login-tab')?.classList.contains('btn-primary');
}

/**
 * Check if user is authenticated
 * In a real app, this would check JWT validity
 */
function isAuthenticated() {
    return !!AppState.user && !!AppState.authToken;
}

/**
 * Middleware to protect routes
 * Redirects to auth-page if not logged in
 */
function guardRoute(pageId) {
    if (PROTECTED_ROUTES.includes(pageId) && !isAuthenticated()) {
        console.warn('Access denied. Redirecting to login.');
        showToast('Session expired. Please login again.', 'warning');
        return 'auth-page';
    }

    // If trying to access auth-page while logged in, redirect to dashboard
    if (pageId === 'auth-page' && isAuthenticated()) {
        return 'dashboard-page';
    }

    return pageId;
}

// ==========================================
// LOGOUT SYSTEM
// ==========================================

/**
 * Step 1: User clicks logout, show confirmation modal
 */
function requestLogout() {
    const modal = document.getElementById('logout-modal');
    modal.classList.add('active');
}

/**
 * Step 2: Close modal without logging out
 */
function closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    modal.classList.remove('active');
}

/**
 * Step 3: Perform the actual logout
 * 1. Calls Backend API (Simulated)
 * 2. Clears LocalStorage
 * 3. Clears In-Memory State
 * 4. Reloads page to prevent "Back" button exploits
 */
async function performLogout() { 
    localStorage.removeItem("isLoggedIn");
    const logoutBtn = document.querySelector('#logout-modal .btn-danger');
    logoutBtn.innerText = 'Logging out...';
    logoutBtn.disabled = true;

    try {
        if (AppState.authToken) {
            await apiRequest('/auth/logout', { method: 'POST' });
        }

        // --- CLIENT SIDE CLEANUP ---

        // 1. Clear LocalStorage (Session/Token store)
        localStorage.removeItem('learnWithRussers');

        // 2. Clear Cookies (if any were used for refresh tokens)
        // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // 3. Reset In-Memory State completely
        // We create a fresh copy of the default state structure
        const defaultState = {
            currentPage: 'auth-page',
            previousPage: null,
            isDarkMode: true,
            isLargeFonts: false,
            isHighContrast: false,
            isReducedMotion: false,
            isEyeComfort: false,
            isTTSEnabled: false,
            isVoiceListening: false,
            authToken: null,
            user: null,
            xp: 0,
            level: 1,
            streak: 0,
            lessonsCompleted: 0,
            practiceCompleted: 0,
            rewardsEarned: 0,
            currentQuizQuestion: 0,
            quizAnswers: [],
            currentLesson: 0,
            currentPracticeQuestion: 0,
            practiceScore: 0,
            currentTestQuestion: 0,
            testAnswers: [],
            testTimeRemaining: 1800,
            testTimerInterval: null,
            tabSwitchCount: 0,
            chatHistory: [],
            weeklyProgress: [false, false, false, false, false, false, false],
            dailyChallenges: [],
            unlockedRewards: []
        };

        // Wipe the old state object properties
        Object.keys(AppState).forEach(key => {
            delete AppState[key];
        });
        // Re-assign default values
        Object.assign(AppState, defaultState);

        showToast('Logged out successfully', 'success');

        // --- SECURITY: RELOAD PAGE ---
        // We reload the page to ensure:
        // 1. All Javascript variables are purged from memory.
        // 2. The browser history cache is cleared for this session.
        // 3. The "Back" button will not restore the logged-in view.

        setTimeout(() => {
            window.location.href = window.location.href;
        }, 500);

    } catch (error) {
        console.error('Logout failed:', error);
        // Ensure logout always succeeds locally even if API fails
        localStorage.removeItem('learnWithRussers');
        showToast('Logged out (Offline Mode)', 'warning');
        setTimeout(() => {
            window.location.href = window.location.href;
        }, 1000);
    }
}

// ==========================================
// APPLICATION STATE
// ==========================================
const AppState = {
    currentPage: 'auth-page',
    previousPage: null,
    isDarkMode: true,
    isLargeFonts: false,
    isHighContrast: false,
    isReducedMotion: false,
    isEyeComfort: false,
    isTTSEnabled: false,
    isVoiceListening: false,

    user: null,
    authToken: null,
    xp: 0,
    level: 1,
    streak: 0,
    lessonsCompleted: 0,
    practiceCompleted: 0,
    rewardsEarned: 0,

    currentQuizQuestion: 0,
    quizAnswers: [],

    currentLesson: 0,
    currentPracticeQuestion: 0,
    practiceScore: 0,

    currentTestQuestion: 0,
    testAnswers: [],
    testTimeRemaining: 1800, // 30 minutes
    testTimerInterval: null,
    tabSwitchCount: 0,

    chatHistory: [],

    weeklyProgress: [false, false, false, false, false, false, false],
    dailyChallenges: [],
    unlockedRewards: []
};

// ==========================================
// DATA
// ==========================================
const QuizQuestions = [
    {
        question: "Programming mein 'variable' kya hota hai?",
        options: [
            "Ek dabba jisme data store karte hain",
            "Ek calculator",
            "Ek game",
            "Ek photo"
        ],
        correct: 0,
        level: "beginner"
    },
    {
        question: "'if' statement ka kya kaam hai?",
        options: [
            "Photo dikhana",
            "Condition check karna - agar ye true hai to ye karo",
            "Music bajana",
            "Game khelna"
        ],
        correct: 1,
        level: "beginner"
    },
    {
        question: "Loop ka kya use hai?",
        options: [
            "Ek hi kaam bar bar karna",
            "Photo edit karna",
            "Video banana",
            "Chat karna"
        ],
        correct: 0,
        level: "intermediate"
    },
    {
        question: "Function kya hai?",
        options: [
            "Ek party",
            "Ek task jo bar bar use ho sakta hai",
            "Ek file",
            "Ek folder"
        ],
        correct: 1,
        level: "intermediate"
    },
    {
        question: "Array kya hota hai?",
        options: [
            "Ek single value",
            "Multiple values ka collection",
            "Ek photo",
            "Ek video"
        ],
        correct: 1,
        level: "intermediate"
    }
];

const Lessons = [
    {
        id: 1,
        title: "Variables - Data ka Ghar",
        content: `
            <h3>Variables Kya Hain?</h3>
            <p>Socho variables ek tarah ke dabbe hain jisme tum kuch bhi store kar sakte ho - jaise tumhari age, naam, ya fir koi bhi information.</p>
            
            <h3>Real Life Example</h3>
            <p>Imagine karo tumhare paas ek diary hai. Us diary mein tum likhte ho:</p>
            <pre><code>meraNaam = "Rahul"
meriUmar = 20
meraShehar = "Delhi"</code></pre>
            
            <p>Yahan <code>meraNaam</code>, <code>meriUmar</code>, <code>meraShehar</code> - ye sab variables hain!</p>
            
            <h3>Important Rules</h3>
            <p>1. Variable ka naam meaningful hona chahiye<br>
            2. Number se start nahi hona chahiye<br>
            3. Space nahi hona chahiye</p>
            
            <h3>Practice Tip</h3>
            <p>Next time jab bhi koi variable banao, socho - "Ye dabba kya store karega?"</p>
        `,
        xp: 50,
        topic: "basics"
    },
    {
        id: 2,
        title: "Data Types - Data ke Rang",
        content: `
            <h3>Data Types Kyun Important Hain?</h3>
            <p>Jaise real life mein cheezein alag hoti hain - kuch number hain, kuch text, kuch true/false - waise hi programming mein bhi data ke types hote hain.</p>
            
            <h3>Main Data Types</h3>
            <p><strong>String (Text):</strong> Quotes mein likha hota hai</p>
            <pre><code>naam = "Priya"  # Ye string hai</code></pre>
            
            <p><strong>Integer (Number):</strong> Decimal ke bina</p>
            <pre><code>umar = 25  # Ye integer hai</code></pre>
            
            <p><strong>Float (Decimal Number):</strong> Point ke saath</p>
            <pre><code>price = 99.99  # Ye float hai</code></pre>
            
            <p><strong>Boolean (True/False):</strong> Sirf do values</p>
            <pre><code>isStudent = True  # Ye boolean hai</code></pre>
            
            <h3>Yaad Rakhne Ka Tarika</h3>
            <p>String = "Quotes mein"<br>
            Integer = Pura number<br>
            Float = Point wala number<br>
            Boolean = Haan ya Na</p>
        `,
        xp: 50,
        topic: "basics"
    },
    {
        id: 3,
        title: "Conditions - Agar Toh",
        content: `
            <h3>Condition Kya Hai?</h3>
            <p>Conditions tumhare decisions hain - "Agar ye hota hai, toh wo karo". Programming mein ise if-else kehte hain.</p>
            
            <h3>Real Life Example</h3>
            <p>Socho tum shopping kar rahe ho:</p>
            <pre><code>agar (price < 500) {
    "Khareed lo!"
} nahi toh {
    "Paisa bachao!"
}</code></pre>
            
            <h3>Comparison Operators</h3>
            <p><code>==</code> : Barabar hai?<br>
            <code>!=</code> : Barabar nahi hai?<br>
            <code>></code> : Bada hai?<br>
            <code><</code> : Chota hai?<br>
            <code>>=</code> : Bada ya barabar?<br>
            <code><=</code> : Chota ya barabar?</p>
            
            <h3>Tip</h3>
            <p>Hamesha socho - "Main kya check karna chahta hoon?"</p>
        `,
        xp: 60,
        topic: "basics"
    },
    {
        id: 4,
        title: "Loops - Repeat Ka Magic",
        content: `
            <h3>Loop Kyun Chahiye?</h3>
            <p>Jab koi kaam bar bar karna ho, loop use karo. Manually karna time waste hai!</p>
            
            <h3>For Loop</h3>
            <p>Jab pata ho kitni baar karna hai:</p>
            <pre><code>for i in range(5):
    print("Hello!")  # 5 baar print hoga</code></pre>
            
            <h3>While Loop</h3>
            <p>Jab condition tak karna hai:</p>
            <pre><code>count = 0
while count < 5:
    print(count)
    count = count + 1</code></pre>
            
            <h3>Infinite Loop Warning!</h3>
            <p>Kabhi mat likho:</p>
            <pre><code>while True:
    print("Stuck!")  # Ye kabhi nahi rukega!</code></pre>
            
            <h3>Tip</h3>
            <p>Loop se pehle socho: "Kahan rukna hai?"</p>
        `,
        xp: 70,
        topic: "intermediate"
    },
    {
        id: 5,
        title: "Functions - Apna Assistant",
        content: `
            <h3>Function Kya Hai?</h3>
            <p>Function ek chhota program hai jo ek specific kaam karta hai. Tum use bar bar bula sakte ho!</p>
            
            <h3>Function Banana</h3>
            <pre><code>def namaste(naam):
    print("Namaste, " + naam + "!")

namaste("Rahul")  # Namaste, Rahul!</code></pre>
            
            <h3>Return Value</h3>
            <p>Function kuch bhej bhi sakta hai:</p>
            <pre><code>def add(a, b):
    return a + b

result = add(5, 3)  # result = 8</code></pre>
            
            <h3>Benefits</h3>
            <p>1. Code reusable hai<br>
            2. Debug karna easy hai<br>
            3. Code clean dikhta hai</p>
            
            <h3>Tip</h3>
            <p>Ek function = Ek kaam. Multiple kaam ke liye multiple functions banao!</p>
        `,
        xp: 80,
        topic: "intermediate"
    }
];

const PracticeQuestions = [
    {
        question: "Variable ka naam kya hona chahiye?",
        options: ["Meaningful", "Kuch bhi", "Bahut lamba", "Number se start"],
        correct: 0,
        explanation: "Variable ka naam meaningful hona chahiye taaki pata chale usme kya store hai!"
    },
    {
        question: "String kaise likhte hain?",
        options: ["Quotes mein", "Brackets mein", "Curly braces mein", "Without anything"],
        correct: 0,
        explanation: "String hamesha quotes (single ya double) mein likhte hain!"
    },
    {
        question: "Boolean mein kitne values hote hain?",
        options: ["1", "2", "3", "Infinite"],
        correct: 1,
        explanation: "Boolean mein sirf 2 values hoti hain - True aur False!"
    },
    {
        question: "Loop ka kya kaam hai?",
        options: ["Ek kaam bar bar karna", "Photo edit karna", "File delete karna", "Internet connect karna"],
        correct: 0,
        explanation: "Loop se hum kisi bhi kaam ko bar bar kar sakte hain without writing same code!"
    },
    {
        question: "Function mein 'return' kya karta hai?",
        options: ["Value bhejta hai", "Program rokta hai", "Error dikhata hai", "Print karta hai"],
        correct: 0,
        explanation: "Return function se value bahar bhejta hai jise hum use kar sakte hain!"
    },
    {
        question: "if-else mein 'else' kab chalta hai?",
        options: ["Hamesha", "Kabhi nahi", "Jab if false ho", "Jab if true ho"],
        correct: 2,
        explanation: "Else tab chalta hai jab if ki condition false ho!"
    },
    {
        question: "Array kya hai?",
        options: ["Single value", "Multiple values ka collection", "Ek function", "Ek loop"],
        correct: 1,
        explanation: "Array mein hum multiple values store kar sakte hain ek hi naam se!"
    },
    {
        question: "'==' operator kya check karta hai?",
        options: ["Value assign karta hai", "Barabar hai ya nahi", "Bada hai ya nahi", "Chota hai ya nahi"],
        correct: 1,
        explanation: "'==' check karta hai ki dono values barabar hain ya nahi!"
    }
];

const TestQuestions = [
    {
        question: "Programming mein variable ka correct syntax kya hai?",
        options: ["variable name = value", "name = value", "var name = value", "v name = value"],
        correct: 1
    },
    {
        question: "Kaunsa data type decimal number ke liye use hota hai?",
        options: ["int", "str", "float", "bool"],
        correct: 2
    },
    {
        question: "if statement ke baad kya aata hai?",
        options: ["Variable", "Condition in brackets", "Loop", "Function"],
        correct: 1
    },
    {
        question: "for loop mein range(5) kitne iterations deta hai?",
        options: ["4", "5", "6", "0"],
        correct: 1
    },
    {
        question: "Function define karne ke liye kaunsa keyword use hota hai?",
        options: ["function", "func", "def", "define"],
        correct: 2
    },
    {
        question: "Array ka index 0 se start kyon hota hai?",
        options: ["Programming rule", "Memory optimization", "Historical reason", "Random choice"],
        correct: 2
    },
    {
        question: "Infinite loop se kaise bachenge?",
        options: ["More loops", "Proper exit condition", "More variables", "Faster computer"],
        correct: 1
    },
    {
        question: "Function ka return type kya ho sakta hai?",
        options: ["Only numbers", "Only strings", "Any data type", "Nothing"],
        correct: 2
    },
    {
        question: "Boolean mein 'True' aur 'true' mein kya farak hai?",
        options: ["No difference", "Case sensitivity", "Different languages", "Different meanings"],
        correct: 1
    },
    {
        question: "Code readability ke liye kya important hai?",
        options: ["Short variables", "Meaningful names", "More loops", "Less functions"],
        correct: 1
    }
];

const Rewards = [
    { id: 1, name: "First Step", description: "Complete your first lesson", xpRequired: 50, icon: "star", unlocked: false },
    { id: 2, name: "Quick Learner", description: "Complete 5 lessons", xpRequired: 200, icon: "zap", unlocked: false },
    { id: 3, name: "Practice Master", description: "Complete 10 practice questions", xpRequired: 150, icon: "target", unlocked: false },
    { id: 4, name: "Streak Starter", description: "3 day learning streak", xpRequired: 100, icon: "flame", unlocked: false },
    { id: 5, name: "Rising Star", description: "Reach Level 5", xpRequired: 500, icon: "award", unlocked: false },
    { id: 6, name: "Knowledge Seeker", description: "Complete all basics lessons", xpRequired: 300, icon: "book", unlocked: false },
    { id: 7, name: "Doubt Solver", description: "Ask 10 questions to AI", xpRequired: 100, icon: "message", unlocked: false },
    { id: 8, name: "Certified Learner", description: "Pass the final test", xpRequired: 400, icon: "check", unlocked: false }
];

const CareerPaths = [
    {
        title: "Frontend Developer",
        description: "Beautiful websites banane ka expert bano. HTML, CSS, JavaScript seekho!",
        skills: ["HTML", "CSS", "JavaScript"],
        match: 85,
        recommended: true
    },
    {
        title: "Backend Developer",
        description: "Server-side programming master karo. Database aur API expert bano!",
        skills: ["Python", "Node.js", "Database"],
        match: 70,
        recommended: false
    },
    {
        title: "Data Analyst",
        description: "Data se insights nikalna seekho. Numbers ka expert bano!",
        skills: ["Python", "SQL", "Excel"],
        match: 65,
        recommended: false
    },
    {
        title: "Mobile App Developer",
        description: "iOS aur Android apps banao. Creative aur technical skills combine karo!",
        skills: ["React Native", "Flutter", "Mobile UI"],
        match: 60,
        recommended: false
    }
];

const DailyChallenges = [
    { id: 1, title: "Complete 1 lesson", xp: 30, completed: false },
    { id: 2, title: "Solve 3 practice questions", xp: 40, completed: false },
    { id: 3, title: "Ask AI tutor a question", xp: 20, completed: false }
];

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    // Load saved state
    loadState();

    // Auth Guard: If on a protected page but not logged in, go to auth immediately
    // This prevents back-button access after logout
    const currentPage = document.querySelector('.page.active')?.id || AppState.currentPage;
    if (PROTECTED_ROUTES.includes(currentPage) && !isAuthenticated()) {
        // Force clear storage if invalid state detected
        localStorage.removeItem('learnWithRussers');
        // Don't show splash, go straight to login
        document.getElementById('splash-screen').style.display = 'none';
        navigateTo('auth-page');
        return;
    }

    // Show splash screen
    setTimeout(() => {
        hideSplash();
    }, 3000);

    // Initialize UI
    updateUI();

    // Set up event listeners
    setupEventListeners();

    // Start challenge timer
    startChallengeTimer();
}

function hideSplash() {
    const splash = document.getElementById('splash-screen');
    splash.style.opacity = '0';
    setTimeout(() => {
        splash.style.display = 'none';

        // Check if user is logged in
        if (AppState.user) {
            navigateTo('dashboard-page');
        } else {
            navigateTo('auth-page');
        }
    }, 500);
}

function loadState() {
    const savedState = localStorage.getItem('learnWithRussers');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);

            // Basic validation to ensure corrupted data doesn't break app
            if (!parsed.user || !parsed.authToken) {
                console.log("No user found in saved state.");
                localStorage.removeItem('learnWithRussers');
                return;
            }

            Object.assign(AppState, parsed);

            // Apply saved settings
            if (!AppState.isDarkMode) {
                document.documentElement.setAttribute('data-theme', 'light');
                document.getElementById('theme-toggle').classList.remove('active');
            }
            if (AppState.isLargeFonts) {
                document.documentElement.setAttribute('data-large-fonts', 'true');
                document.getElementById('fonts-toggle').classList.add('active');
            }
            if (AppState.isHighContrast) {
                document.documentElement.setAttribute('data-high-contrast', 'true');
                document.getElementById('contrast-toggle').classList.add('active');
            }
            if (AppState.isReducedMotion) {
                document.documentElement.setAttribute('data-reduced-motion', 'true');
                document.getElementById('motion-toggle').classList.add('active');
            }
            if (AppState.isEyeComfort) {
                document.documentElement.setAttribute('data-eye-comfort', 'true');
                document.getElementById('eye-toggle').classList.add('active');
            }
        } catch (e) {
            console.error("Error parsing state", e);
            localStorage.removeItem('learnWithRussers');
        }
    }
}

function saveState() {
    if (!AppState.user) return; // Don't save state if no user is logged in

    const stateToSave = {
        user: AppState.user,
        authToken: AppState.authToken,
        xp: AppState.xp,
        level: AppState.level,
        streak: AppState.streak,
        lessonsCompleted: AppState.lessonsCompleted,
        practiceCompleted: AppState.practiceCompleted,
        rewardsEarned: AppState.rewardsEarned,
        weeklyProgress: AppState.weeklyProgress,
        isDarkMode: AppState.isDarkMode,
        isLargeFonts: AppState.isLargeFonts,
        isHighContrast: AppState.isHighContrast,
        isReducedMotion: AppState.isReducedMotion,
        isEyeComfort: AppState.isEyeComfort,
        unlockedRewards: AppState.unlockedRewards
    };
    localStorage.setItem('learnWithRussers', JSON.stringify(stateToSave));
}

function setupEventListeners() {
    // Anti-cheat: Tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Toggle switches keyboard support
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });
    });
}

// ==========================================
// NAVIGATION WITH GUARD
// ==========================================
function navigateTo(pageId) {
    // 1. Apply Route Guard
    const targetPage = guardRoute(pageId);

    // 2. Hide current page
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        currentPage.classList.remove('active');
    }

    // Store previous page
    AppState.previousPage = AppState.currentPage;
    AppState.currentPage = targetPage;

    // 3. Show new page
    const newPage = document.getElementById(targetPage);
    if (newPage) {
        setTimeout(() => {
            newPage.classList.add('active');
        }, 50);
    }

    // Update nav
    updateNavigation(targetPage);

    // Page-specific initialization
    initPage(targetPage);
}

function goBack() {
    if (AppState.previousPage) {
        navigateTo(AppState.previousPage);
    } else {
        navigateTo('dashboard-page');
    }
}

function updateNavigation(pageId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const navMapping = {
        'dashboard-page': 0,
        'learning-page': 1,
        'practice-page': 2,
        'chat-page': 3,
        'rewards-page': 4
    };

    const navItems = document.querySelectorAll('.nav-item');
    if (navMapping[pageId] !== undefined) {
        navItems[navMapping[pageId]].classList.add('active');
    }
}

function initPage(pageId) {
    switch (pageId) {
        case 'quiz-page':
            initQuiz();
            break;
        case 'dashboard-page':
            initDashboard();
            break;
        case 'learning-page':
            initLearning();
            break;
        case 'practice-page':
            initPractice();
            break;
        case 'rewards-page':
            initRewards();
            break;
        case 'test-page':
            initTest();
            break;
        case 'certificate-page':
            initCertificate();
            break;
        case 'career-page':
            initCareer();
            break;
        case 'referral-page':
            initReferral();
            break;
    }
}

// ==========================================
// AUTHENTICATION
// ==========================================
let isLogin = false;

function switchAuthTab(type) {
    isLogin = type === "login";

    document.getElementById("password-confirm-group").style.display =
        isLogin ? "none" : "block";

    document.getElementById("referral-group").style.display =
        isLogin ? "none" : "block";

    document.getElementById("auth-btn-text").innerText =
        isLogin ? "Login" : "Start Learning";
}

function handleAuth(e) {
    e.preventDefault();

    const name = document.getElementById("auth-name").value.trim();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value.trim();
    const confirmPassword = document
        .getElementById("auth-password-confirm")
        .value.trim();

    if (!email || !password) {
        alert("Email and password required");
        return;
    }

    // SIGNUP
    if (!isLogin) {
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const user = { name, email, password };
        localStorage.setItem("user", JSON.stringify(user));

        alert("Signup successful");
        switchAuthTab("login");
        return;
    }

    // LOGIN
    const savedUser = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem("isLoggedIn", "true");

    if (!savedUser) {
        alert("No user found. Signup first.");
        return;
    }

    if (
        savedUser.email === email &&
        savedUser.password === password
    ) {
        alert("Login successful");

        document.getElementById("auth-page").classList.remove("active");
        document.getElementById("dashboard-page").classList.add("active");

        document.getElementById("dashboard-username").innerText =
            "Hello, " + savedUser.name;
    } else {
        alert("Invalid credentials");
    }
}

function generateReferralCode() {
    return 'LWR' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ==========================================
// LEVEL DETECTION QUIZ
// ==========================================
function initQuiz() {
    AppState.currentQuizQuestion = 0;
    AppState.quizAnswers = [];
    showQuizQuestion();
}

function showQuizQuestion() {
    const question = QuizQuestions[AppState.currentQuizQuestion];
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const progressEl = document.getElementById('quiz-progress');
    const progressBar = document.getElementById('quiz-progress-bar');

    questionEl.textContent = question.question;
    progressEl.textContent = `${AppState.currentQuizQuestion + 1}/${QuizQuestions.length}`;
    progressBar.style.width = `${((AppState.currentQuizQuestion + 1) / QuizQuestions.length) * 100}%`;

    optionsEl.innerHTML = question.options.map((option, index) => `
        <button class="quiz-option" onclick="selectQuizAnswer(${index})" data-index="${index}">
            ${option}
        </button>
    `).join('');

    document.getElementById('quiz-next-btn').disabled = true;
}

function selectQuizAnswer(index) {
    const options = document.querySelectorAll('#quiz-options .quiz-option');
    options.forEach(opt => opt.classList.remove('selected'));
    options[index].classList.add('selected');

    AppState.quizAnswers[AppState.currentQuizQuestion] = index;
    document.getElementById('quiz-next-btn').disabled = false;
}

function nextQuizQuestion() {
    AppState.currentQuizQuestion++;

    if (AppState.currentQuizQuestion >= QuizQuestions.length) {
        finishQuiz();
    } else {
        showQuizQuestion();
    }
}

function finishQuiz() {
    // Calculate score
    let correct = 0;
    AppState.quizAnswers.forEach((answer, index) => {
        if (answer === QuizQuestions[index].correct) {
            correct++;
        }
    });

    const score = (correct / QuizQuestions.length) * 100;

    // Determine level
    if (score >= 80) {
        AppState.level = 3;
    } else if (score >= 50) {
        AppState.level = 2;
    } else {
        AppState.level = 1;
    }

    AppState.xp += correct * 20;

    showToast(`Quiz Complete! Level ${AppState.level} unlocked`, 'success');
    saveState();

    navigateTo('dashboard-page');
}

function skipQuiz() {
    showToast('You can retake the quiz anytime!', 'warning');
    navigateTo('dashboard-page');
}

// ==========================================
// DASHBOARD
// ==========================================
function initDashboard() {
    updateDashboardStats();
    renderTopics();
    renderChallenges();
    renderStreakCalendar();
}

function updateDashboardStats() {
    document.getElementById('dashboard-username').textContent = `Hello, ${AppState.user?.name || 'Learner'}!`;
    document.getElementById('user-level-badge').textContent = AppState.level;
    document.getElementById('user-streak').textContent = AppState.streak;
    document.getElementById('user-xp').textContent = AppState.xp;
    document.getElementById('current-level').textContent = AppState.level;
    document.getElementById('next-level').textContent = AppState.level + 1;

    const xpForNextLevel = AppState.level * 100;
    const currentLevelXP = (AppState.level - 1) * 100;
    const progress = ((AppState.xp - currentLevelXP) / (xpForNextLevel - currentLevelXP)) * 100;
    document.getElementById('level-progress').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('xp-needed').textContent = Math.max(xpForNextLevel - AppState.xp, 0);

    document.getElementById('lessons-completed').textContent = AppState.lessonsCompleted;
    document.getElementById('practice-completed').textContent = AppState.practiceCompleted;
    document.getElementById('rewards-earned').textContent = AppState.rewardsEarned;
}

function renderTopics() {
    const topicsEl = document.getElementById('current-topics');

    const topics = [
        { name: 'Variables & Data Types', progress: AppState.lessonsCompleted > 0 ? 50 : 0 },
        { name: 'Conditions & Loops', progress: AppState.lessonsCompleted > 2 ? 50 : 0 },
        { name: 'Functions', progress: AppState.lessonsCompleted > 4 ? 100 : 0 }
    ];

    topicsEl.innerHTML = topics.map((topic, index) => `
        <div class="topic-card" onclick="startLesson(${index})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="font-size: 1rem;">${topic.name}</h4>
                <span style="color: var(--fg-secondary); font-size: 0.875rem;">${topic.progress}%</span>
            </div>
            <div class="topic-progress">
                <div class="topic-progress-fill" style="width: ${topic.progress}%;"></div>
            </div>
        </div>
    `).join('');
}

function renderChallenges() {
    const challengesEl = document.getElementById('daily-challenges');

    challengesEl.innerHTML = DailyChallenges.map(challenge => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: ${challenge.completed ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)'}; border-radius: 12px; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${challenge.completed ? 'var(--success)' : 'var(--border)'}; display: flex; align-items: center; justify-content: center;">
                    ${challenge.completed ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                </div>
                <span style="${challenge.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${challenge.title}</span>
            </div>
            <span class="xp-badge" style="font-size: 0.75rem;">+${challenge.xp} XP</span>
        </div>
    `).join('');
}

function renderStreakCalendar() {
    const calendarEl = document.getElementById('streak-calendar');
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay();

    calendarEl.innerHTML = days.map((day, index) => `
        <div class="streak-day ${AppState.weeklyProgress[index] ? 'completed' : ''} ${index === today ? 'today' : ''}">
            ${day}
        </div>
    `).join('');
}

// ==========================================
// LEARNING
// ==========================================
function initLearning() {
    showLesson();
}

function startLesson(index) {
    AppState.currentLesson = index * 2; // Rough mapping
    navigateTo('learning-page');
}

function showLesson() {
    const lesson = Lessons[AppState.currentLesson];

    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-content').innerHTML = lesson.content;
    document.getElementById('lesson-progress').style.width = `${((AppState.currentLesson + 1) / Lessons.length) * 100}%`;

    // Update buttons
    document.getElementById('prev-lesson-btn').disabled = AppState.currentLesson === 0;
    document.getElementById('next-lesson-btn').textContent = AppState.currentLesson >= Lessons.length - 1 ? 'Complete Lesson' : 'Next Lesson';

    // Scroll to top
    window.scrollTo(0, 0);
}

function nextLesson() {
    if (AppState.currentLesson >= Lessons.length - 1) {
        // Complete lesson
        AppState.lessonsCompleted++;
        AppState.xp += Lessons[AppState.currentLesson].xp;

        // Mark today's progress
        const today = new Date().getDay();
        AppState.weeklyProgress[today] = true;

        showToast(`+${Lessons[AppState.currentLesson].xp} XP earned!`, 'success');
        saveState();
        checkRewards();

        navigateTo('dashboard-page');
    } else {
        AppState.currentLesson++;
        showLesson();
    }
}

function previousLesson() {
    if (AppState.currentLesson > 0) {
        AppState.currentLesson--;
        showLesson();
    }
}

// ==========================================
// PRACTICE
// ==========================================
function initPractice() {
    AppState.currentPracticeQuestion = 0;
    AppState.practiceScore = 0;
    showPracticeQuestion();
}

function showPracticeQuestion() {
    const question = PracticeQuestions[AppState.currentPracticeQuestion];

    document.getElementById('practice-question').textContent = question.question;
    document.getElementById('practice-progress').style.width = `${((AppState.currentPracticeQuestion + 1) / PracticeQuestions.length) * 100}%`;
    document.getElementById('practice-score').textContent = AppState.practiceScore;

    const optionsEl = document.getElementById('practice-options');
    optionsEl.innerHTML = question.options.map((option, index) => `
        <button class="quiz-option" onclick="selectPracticeAnswer(${index})" data-index="${index}">
            ${option}
        </button>
    `).join('');

    document.getElementById('practice-feedback').style.display = 'none';
    document.getElementById('practice-next-btn').disabled = true;
}

function selectPracticeAnswer(index) {
    const question = PracticeQuestions[AppState.currentPracticeQuestion];
    const options = document.querySelectorAll('#practice-options .quiz-option');
    const feedbackEl = document.getElementById('practice-feedback');

    options.forEach(opt => opt.disabled = true);

    const isCorrect = index === question.correct;

    options[index].classList.add(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
        options[question.correct].classList.add('correct');
    }

    feedbackEl.style.display = 'block';
    feedbackEl.style.background = isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    feedbackEl.style.border = `1px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`;
    feedbackEl.innerHTML = `
        <p style="color: ${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight: 600; margin-bottom: 0.5rem;">
            ${isCorrect ? 'Correct!' : 'Not quite right'}
        </p>
        <p style="color: var(--fg-secondary);">${question.explanation}</p>
    `;

    if (isCorrect) {
        AppState.practiceScore += 10;
        AppState.xp += 10;
        document.getElementById('practice-score').textContent = AppState.practiceScore;
    }

    document.getElementById('practice-next-btn').disabled = false;
}

function nextPracticeQuestion() {
    AppState.currentPracticeQuestion++;

    if (AppState.currentPracticeQuestion >= PracticeQuestions.length) {
        // Complete practice
        AppState.practiceCompleted += PracticeQuestions.length;
        saveState();
        showToast(`Practice complete! Score: ${AppState.practiceScore}`, 'success');
        triggerConfetti();
        navigateTo('dashboard-page');
    } else {
        showPracticeQuestion();
    }
}

// ==========================================
// AI CHAT
// ==========================================
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addChatMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Simulate AI response
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateAIResponse(message);
        addChatMessage(response, 'ai');
    }, 1000 + Math.random() * 1000);
}

function addChatMessage(message, type) {
    const messagesEl = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${type}`;
    messageEl.innerHTML = `<p>${message}</p>`;
    messagesEl.appendChild(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTypingIndicator() {
    const messagesEl = document.getElementById('chat-messages');
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message ai';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();
}

function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Keyword-based responses in Hinglish
    if (lowerMessage.includes('variable') || lowerMessage.includes('varaible')) {
        return "Variable ek tarah ka container hai jisme hum data store karte hain. Socho ise ek dibbe ki tarah - tum usme kuch bhi rakh sakte ho! Jaise: `naam = 'Rahul'` - yahan `naam` variable hai aur usme 'Rahul' store hai.";
    }

    if (lowerMessage.includes('loop') || lowerMessage.includes('for') || lowerMessage.includes('while')) {
        return "Loop ka use tab karte hain jab koi kaam bar bar karna ho. Do main types hain: FOR loop (jab pata ho kitni baar karna) aur WHILE loop (jab condition tak karna). Example: `for i in range(5):` - ye 5 baar chalega!";
    }

    if (lowerMessage.includes('function') || lowerMessage.includes('func')) {
        return "Function ek reusable code block hai. Ek baar banao, bar bar use karo! Jaise: `def namaste(naam):` - ye ek function hai jo naam lekar 'Namaste' bolega. Functions se code clean aur organized rehta hai.";
    }

    if (lowerMessage.includes('array') || lowerMessage.includes('list')) {
        return "Array (ya Python mein List) ek collection hai jisme multiple values store kar sakte ho. Jaise: `fruits = ['apple', 'banana', 'mango']`. Index 0 se start hota hai, to `fruits[0]` = 'apple' milega!";
    }

    if (lowerMessage.includes('condition') || lowerMessage.includes('if') || lowerMessage.includes('else')) {
        return "Conditions se code decisions le sakta hai! IF-ELSE structure: `agar condition true hai to ye karo, nahi to wo karo`. Jaise: `if marks > 50: print('Pass') else: print('Fail')`. Simple!";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste')) {
        return "Namaste! Main aapka AI Tutor hoon. Aap mujhse programming ke baare mein kuch bhi pooch sakte ho. Main aapko Hinglish mein samjhaonga. Batao, aaj kya seekhna chahte ho?";
    }

    // Default response
    return "Achha sawal! Is baare mein main aapko detail mein samjha sakta hoon. Kya aap specifically ye jaanna chahte ho: 1) Ye kya hai? 2) Ye kaise kaam karta hai? 3) Iska real life example? Batao, main help karunga!";
}

function handleChatKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// ==========================================
// REWARDS
// ==========================================
function initRewards() {
    document.getElementById('rewards-xp').textContent = AppState.xp;
    renderRewards();
}

function renderRewards() {
    const rewardsEl = document.getElementById('rewards-list');

    rewardsEl.innerHTML = Rewards.map(reward => {
        const isUnlocked = AppState.unlockedRewards.includes(reward.id) || AppState.xp >= reward.xpRequired;

        return `
            <div class="reward-card ${isUnlocked ? 'unlocked' : 'locked'}" style="margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem; position: relative; z-index: 1;">
                    <div class="achievement-badge ${isUnlocked ? 'earned' : ''}">
                        ${getRewardIcon(reward.icon, isUnlocked)}
                    </div>
                    <div style="flex: 1;">
                        <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${reward.name}</h4>
                        <p style="color: var(--fg-secondary); font-size: 0.875rem;">${reward.description}</p>
                        <p style="color: var(--fg-muted); font-size: 0.75rem; margin-top: 0.5rem;">
                            ${isUnlocked ? 'Unlocked!' : `Requires ${reward.xpRequired} XP`}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getRewardIcon(icon, unlocked) {
    const color = unlocked ? 'var(--success)' : 'var(--fg-muted)';
    const icons = {
        star: `<svg width="32" height="32" viewBox="0 0 24 24" fill="${unlocked ? color : 'none'}" stroke="${color}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        zap: `<svg width="32" height="32" viewBox="0 0 24 24" fill="${unlocked ? color : 'none'}" stroke="${color}" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        target: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
        flame: `<svg width="32" height="32" viewBox="0 0 24 24" fill="${unlocked ? color : 'none'}" stroke="${color}" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
        award: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
        book: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
        message: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        check: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    };
    return icons[icon] || icons.star;
}

function checkRewards() {
    Rewards.forEach(reward => {
        if (!AppState.unlockedRewards.includes(reward.id) && AppState.xp >= reward.xpRequired) {
            AppState.unlockedRewards.push(reward.id);
            AppState.rewardsEarned++;
            showToast(`Reward Unlocked: ${reward.name}!`, 'success');
            triggerConfetti();
        }
    });
    saveState();
}

// ==========================================
// REFERRAL
// ==========================================
function initReferral() {
    document.getElementById('referral-code').textContent = AppState.user?.referralCode || 'LWRDEMO';
}

function copyReferralCode() {
    const code = AppState.user?.referralCode || 'LWRDEMO';
    navigator.clipboard.writeText(code).then(() => {
        showToast('Referral code copied!', 'success');
    });
}

// ==========================================
// TEST
// ==========================================
function initTest() {
    AppState.currentTestQuestion = 0;
    AppState.testAnswers = [];
    AppState.testTimeRemaining = 1800;
    AppState.tabSwitchCount = 0;

    showTestQuestion();
    startTestTimer();

    // Anti-cheat
    document.addEventListener('visibilitychange', handleTestVisibility);
}

function showTestQuestion() {
    const question = TestQuestions[AppState.currentTestQuestion];

    document.getElementById('test-current').textContent = AppState.currentTestQuestion + 1;
    document.getElementById('test-total').textContent = TestQuestions.length;
    document.getElementById('test-question').textContent = question.question;
    document.getElementById('test-progress').style.width = `${((AppState.currentTestQuestion + 1) / TestQuestions.length) * 100}%`;

    const optionsEl = document.getElementById('test-options');
    optionsEl.innerHTML = question.options.map((option, index) => `
        <button class="quiz-option" onclick="selectTestAnswer(${index})" data-index="${index}">
            ${option}
        </button>
    `).join('');
}

function selectTestAnswer(index) {
    AppState.testAnswers[AppState.currentTestQuestion] = index;

    const options = document.querySelectorAll('#test-options .quiz-option');
    options.forEach(opt => opt.classList.remove('selected'));
    options[index].classList.add('selected');
}

function nextTestQuestion() {
    AppState.currentTestQuestion++;

    if (AppState.currentTestQuestion >= TestQuestions.length) {
        finishTest();
    } else {
        showTestQuestion();
    }
}

function skipTestQuestion() {
    AppState.testAnswers[AppState.currentTestQuestion] = -1;
    nextTestQuestion();
}

function startTestTimer() {
    AppState.testTimerInterval = setInterval(() => {
        AppState.testTimeRemaining--;

        const minutes = Math.floor(AppState.testTimeRemaining / 60);
        const seconds = AppState.testTimeRemaining % 60;
        document.getElementById('timer-display').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (AppState.testTimeRemaining <= 300) {
            document.getElementById('test-timer').classList.add('warning');
        }

        if (AppState.testTimeRemaining <= 0) {
            finishTest();
        }
    }, 1000);
}

function handleTestVisibility() {
    if (document.hidden && AppState.currentPage === 'test-page') {
        AppState.tabSwitchCount++;

        if (AppState.tabSwitchCount >= 3) {
            finishTest();
        } else {
            document.getElementById('anti-cheat-overlay').classList.add('active');
        }
    }
}

function resumeTest() {
    document.getElementById('anti-cheat-overlay').classList.remove('active');
}

function finishTest() {
    clearInterval(AppState.testTimerInterval);
    document.removeEventListener('visibilitychange', handleTestVisibility);

    // Calculate score
    let correct = 0;
    AppState.testAnswers.forEach((answer, index) => {
        if (answer === TestQuestions[index].correct) {
            correct++;
        }
    });

    const score = (correct / TestQuestions.length) * 100;

    if (score >= 70) {
        AppState.xp += 200;
        showToast(`Congratulations! You passed with ${score}%!`, 'success');
        triggerConfetti();
        saveState();

        setTimeout(() => {
            navigateTo('certificate-page');
        }, 2000);
    } else {
        showToast(`You scored ${score}%. Try again!`, 'warning');
        navigateTo('dashboard-page');
    }
}

// ==========================================
// CERTIFICATE
// ==========================================
function initCertificate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('certificate-name').textContent = AppState.user?.name || 'Learner';
    document.getElementById('certificate-course').textContent = 'Introduction to Programming';
    document.getElementById('certificate-date').textContent = dateStr;
    document.getElementById('certificate-id').textContent = generateCertificateId();
}

function generateCertificateId() {
    return 'CERT-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
        Date.now().toString(36).toUpperCase();
}

function downloadCertificate() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    const userName = AppState.user?.name || 'Learner';
    const certId = generateCertificateId();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Background
    doc.setFillColor(240, 240, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    // Inner border
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(139, 92, 246);
    doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 120);
    doc.text('This is to certify that', 148.5, 70, { align: 'center' });

    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(30, 30, 50);
    doc.text(userName, 148.5, 90, { align: 'center' });

    // Course
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 120);
    doc.text('has successfully completed the course', 148.5, 105, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Introduction to Programming', 148.5, 120, { align: 'center' });

    // Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 120);
    doc.text('Completed on ' + dateStr, 148.5, 140, { align: 'center' });

    // Certificate ID
    doc.setFontSize(10);
    doc.text('Certificate ID: ' + certId, 148.5, 160, { align: 'center' });

    // Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(139, 92, 246);
    doc.text('Learn with Russers', 148.5, 180, { align: 'center' });

    // Save
    doc.save(`Certificate_${userName.replace(/\s+/g, '_')}.pdf`);

    showToast('Certificate downloaded!', 'success');
}

function shareCertificate() {
    showToast('Share feature coming soon!', 'warning');
}

// ==========================================
// CAREER
// ==========================================
function initCareer() {
    const careerList = document.getElementById('career-list');

    careerList.innerHTML = CareerPaths.map(career => `
        <div class="career-card ${career.recommended ? 'recommended' : ''}" style="margin-bottom: 1rem;">
            <h4 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${career.title}</h4>
            <p style="color: var(--fg-secondary); margin-bottom: 1rem;">${career.description}</p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                ${career.skills.map(skill => `
                    <span style="padding: 0.25rem 0.75rem; background: rgba(139, 92, 246, 0.1); border-radius: 20px; font-size: 0.875rem;">${skill}</span>
                `).join('')}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="progress-bar" style="flex: 1; margin-right: 1rem;">
                    <div class="progress-fill" style="width: ${career.match}%;"></div>
                </div>
                <span style="font-weight: 600; color: ${career.match >= 80 ? 'var(--success)' : 'var(--fg-primary)'};">${career.match}% Match</span>
            </div>
        </div>
    `).join('');
}

// ==========================================
// ACCESSIBILITY & UTILS
// ==========================================
function toggleAccessibilityPanel() {
    const panel = document.getElementById('accessibility-panel');
    panel.classList.toggle('open');
}

function toggleTheme() {
    AppState.isDarkMode = !AppState.isDarkMode;
    if (AppState.isDarkMode) {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('theme-toggle').classList.add('active');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('theme-toggle').classList.remove('active');
    }
    saveState();
}

function toggleLargeFonts() {
    AppState.isLargeFonts = !AppState.isLargeFonts;
    if (AppState.isLargeFonts) {
        document.documentElement.setAttribute('data-large-fonts', 'true');
        document.getElementById('fonts-toggle').classList.add('active');
    } else {
        document.documentElement.removeAttribute('data-large-fonts');
        document.getElementById('fonts-toggle').classList.remove('active');
    }
    saveState();
}

function toggleHighContrast() {
    AppState.isHighContrast = !AppState.isHighContrast;
    if (AppState.isHighContrast) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
        document.getElementById('contrast-toggle').classList.add('active');
    } else {
        document.documentElement.removeAttribute('data-high-contrast');
        document.getElementById('contrast-toggle').classList.remove('active');
    }
    saveState();
}

function toggleReducedMotion() {
    AppState.isReducedMotion = !AppState.isReducedMotion;
    if (AppState.isReducedMotion) {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
        document.getElementById('motion-toggle').classList.add('active');
    } else {
        document.documentElement.removeAttribute('data-reduced-motion');
        document.getElementById('motion-toggle').classList.remove('active');
    }
    saveState();
}

function toggleEyeComfort() {
    AppState.isEyeComfort = !AppState.isEyeComfort;
    if (AppState.isEyeComfort) {
        document.documentElement.setAttribute('data-eye-comfort', 'true');
        document.getElementById('eye-toggle').classList.add('active');
    } else {
        document.documentElement.removeAttribute('data-eye-comfort');
        document.getElementById('eye-toggle').classList.remove('active');
    }
    saveState();
}

function toggleTTS() {
    AppState.isTTSEnabled = !AppState.isTTSEnabled;
    document.getElementById('tts-toggle').classList.toggle('active');
    if (AppState.isTTSEnabled) {
        showToast('Text to Speech enabled', 'success');
    }
    saveState();
}

function speakText(text) {
    if (!AppState.isTTSEnabled && !text.includes('Accessibility settings')) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hinglish friendly
    window.speechSynthesis.speak(utterance);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span>${message}</span>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#8b5cf6', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
    }
}

function updateUI() {
    if (AppState.user) {
        updateDashboardStats();
    }
}

function startChallengeTimer() {
    setInterval(() => {
        const now = new Date();
        const night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const ms = night.getTime() - now.getTime();
        const h = Math.floor(ms / (1000 * 60 * 60));
        const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((ms % (1000 * 60)) / 1000);

        const timerEl = document.getElementById('challenge-timer');
        if (timerEl) {
            timerEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function handleVisibilityChange() {
    if (document.hidden && AppState.currentPage === 'test-page') {
        AppState.tabSwitchCount++;
        if (AppState.tabSwitchCount >= 3) {
            finishTest();
        } else {
            document.getElementById('anti-cheat-overlay').classList.add('active');
        }
    }
}

function handleKeydown(event) {
    // ALT + A for Accessibility
    if (event.altKey && event.key === '') {
        toggleAccessibilityPanel();
    }
}

function toggleVoiceAssistant() {
    const btn = document.getElementById('voice-btn-learning');
    AppState.isVoiceListening = !AppState.isVoiceListening;
    btn.classList.toggle('listening');

    if (AppState.isVoiceListening) {
        showToast('Listening...', 'success');
        // In a real app, we'd use SpeechRecognition API
        setTimeout(() => {
            const text = document.getElementById('lesson-content').innerText;
            speakText("Zaroor! Main aapko ye lesson samjhata hoon. " + text.substring(0, 100) + "...");
            btn.classList.remove('listening');
            AppState.isVoiceListening = false;
        }, 2000);
    }
}

function toggleVoiceInput() {
    const btn = document.getElementById('voice-btn-chat');
    AppState.isVoiceListening = !AppState.isVoiceListening;
    btn.classList.toggle('listening');

    if (AppState.isVoiceListening) {
        showToast('Listening...', 'success');
        setTimeout(() => {
            document.getElementById('chat-input').value = 'Variables kya hote hain?';
            sendMessage();
            btn.classList.remove('listening');
            AppState.isVoiceListening = false;
        }, 2000);
    }
}

// Initialize the app
init();



window.onload = function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const user = JSON.parse(localStorage.getItem("user"));

  if (isLoggedIn === "true" && user) {
    document.getElementById("auth-page").classList.remove("active");
    document.getElementById("dashboard-page").classList.add("active");

    document.getElementById("dashboard-username").innerText =
      "Hello, " + user.name;
  }
};
