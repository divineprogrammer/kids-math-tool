/**
 * ========================================
 * KIDS MATH PRACTICE APP - MAIN SCRIPT
 * ========================================
 * 
 * HOW TO RUN:
 * Simply open index.html in a web browser (Chrome, Safari, Edge, Firefox)
 * Works on iPad Safari and desktop browsers
 * No backend or server required - everything runs in the browser
 * 
 * FEATURES:
 * - Parent setup screen to configure practice session
 * - Child-friendly practice screen with on-screen number pad
 * - Results review with detailed feedback
 * - Colorful celebration animation on good performance
 * - Fully responsive for iPad and desktop
 * 
 * ========================================
 */

// ===== STATE MANAGEMENT =====
let appState = {
    currentScreen: 'setup',
    config: {
        operations: ['addition'],
        minDigits: 1,
        maxDigits: 2,
        minTerms: 2,
        maxTerms: 3,
        questionCount: 10,
        timeLimit: 2 // in minutes
    },
    questions: [],
    currentQuestionIndex: 0,
    currentAnswer: '',
    timerId: null,
    timeRemaining: 0,
    sessionActive: false
};

// ===== DOM ELEMENTS =====
const setupScreen = document.getElementById('setupScreen');
const practiceScreen = document.getElementById('practiceScreen');
const resultScreen = document.getElementById('resultScreen');

// Setup screen elements
const additionCheck = document.getElementById('additionCheck');
const subtractionCheck = document.getElementById('subtractionCheck');
const minDigitsSelect = document.getElementById('minDigits');
const maxDigitsSelect = document.getElementById('maxDigits');
const minTermsSelect = document.getElementById('minTerms');
const maxTermsSelect = document.getElementById('maxTerms');
const questionCountInput = document.getElementById('questionCount');
const timeLimitInput = document.getElementById('timeLimit');
const startBtn = document.getElementById('startBtn');
const setupError = document.getElementById('setupError');

// Slider value displays
const minDigitsValue = document.getElementById('minDigitsValue');
const maxDigitsValue = document.getElementById('maxDigitsValue');
const minTermsValue = document.getElementById('minTermsValue');
const maxTermsValue = document.getElementById('maxTermsValue');

// Practice screen elements
const questionNum = document.getElementById('questionNum');
const totalQuestions = document.getElementById('totalQuestions');
const timer = document.getElementById('timer');
const expression = document.getElementById('expression');
const answerValue = document.getElementById('answerValue');
const numButtons = document.querySelectorAll('.num-button');
const clearBtn = document.getElementById('clearBtn');
const backspaceBtn = document.getElementById('backspaceBtn');
const submitBtn = document.getElementById('submitBtn');

// Result screen elements
const statCorrect = document.getElementById('statCorrect');
const statWrong = document.getElementById('statWrong');
const statUnanswered = document.getElementById('statUnanswered');
const scoreNum = document.getElementById('scoreNum');
const scoreTotal = document.getElementById('scoreTotal');
const percentageDisplay = document.getElementById('percentageDisplay');
const encouragement = document.getElementById('encouragement');
const reviewList = document.getElementById('reviewList');
const practiceAgainBtn = document.getElementById('practiceAgainBtn');
const backToSetupBtn = document.getElementById('backToSetupBtn');
const confettiContainer = document.getElementById('confettiContainer');

// ===== UTILITY FUNCTIONS =====

/**
 * Switch to a different screen (setup, practice, result)
 */
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    appState.currentScreen = screenName;
    
    if (screenName === 'setup') {
        setupScreen.classList.add('active');
    } else if (screenName === 'practice') {
        practiceScreen.classList.add('active');
    } else if (screenName === 'result') {
        resultScreen.classList.add('active');
    }
}

/**
 * Show error message on setup screen
 */
function showError(message) {
    setupError.textContent = message;
    setupError.classList.add('show');
}

/**
 * Hide error message on setup screen
 */
function clearError() {
    setupError.textContent = '';
    setupError.classList.remove('show');
}

/**
 * Validate setup configuration
 */
function validateSetup() {
    clearError();

    // Check if at least one operation is selected
    if (!additionCheck.checked && !subtractionCheck.checked) {
        showError('Please select at least one operation.');
        return false;
    }

    const minDigits = parseInt(minDigitsSelect.value);
    const maxDigits = parseInt(maxDigitsSelect.value);
    const minTerms = parseInt(minTermsSelect.value);
    const maxTerms = parseInt(maxTermsSelect.value);
    const questionCount = parseInt(questionCountInput.value);
    const timeLimit = parseInt(timeLimitInput.value);

    // Validate digit range
    if (minDigits > maxDigits) {
        showError('Minimum digits cannot be greater than maximum digits.');
        return false;
    }

    // Validate term range
    if (minTerms > maxTerms) {
        showError('Minimum terms cannot be greater than maximum terms.');
        return false;
    }

    // Validate counts
    if (questionCount < 1 || questionCount > 50) {
        showError('Number of questions must be between 1 and 50.');
        return false;
    }

    if (timeLimit < 1 || timeLimit > 60) {
        showError('Time limit must be between 1 and 60 minutes.');
        return false;
    }

    return true;
}

/**
 * Save configuration from setup screen
 */
function saveConfiguration() {
    const operations = [];
    if (additionCheck.checked) operations.push('addition');
    if (subtractionCheck.checked) operations.push('subtraction');

    appState.config = {
        operations: operations,
        minDigits: parseInt(minDigitsSelect.value),
        maxDigits: parseInt(maxDigitsSelect.value),
        minTerms: parseInt(minTermsSelect.value),
        maxTerms: parseInt(maxTermsSelect.value),
        questionCount: parseInt(questionCountInput.value),
        timeLimit: parseInt(timeLimitInput.value)
    };
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random number with specified number of digits
 * 1 digit: 0-9
 * 2 digits: 10-99
 * 3 digits: 100-999
 */
function getRandomNumberWithDigits(numDigits) {
    if (numDigits === 1) {
        return randomInt(0, 9);
    } else if (numDigits === 2) {
        return randomInt(10, 99);
    } else if (numDigits === 3) {
        return randomInt(100, 999);
    }
    return 0;
}

/**
 * Get a random digit count within the configured range
 */
function getRandomDigitCount() {
    return randomInt(appState.config.minDigits, appState.config.maxDigits);
}

/**
 * Get a random operator from selected operations
 */
function getRandomOperator() {
    const ops = appState.config.operations;
    const operator = ops[Math.floor(Math.random() * ops.length)];
    return operator === 'addition' ? '+' : '-';
}

/**
 * Generate a single math expression ensuring no negative running total
 * Returns object: { expression: string, correctAnswer: number }
 */
function generateExpression() {
    const minTerms = appState.config.minTerms;
    const maxTerms = appState.config.maxTerms;
    const termCount = randomInt(minTerms, maxTerms);
    
    let expression = '';
    let runningTotal = 0;
    let operators = [];
    let terms = [];
    
    // Generate first term
    let digitCount = getRandomDigitCount();
    let firstTerm = getRandomNumberWithDigits(digitCount);
    terms.push(firstTerm);
    runningTotal = firstTerm;
    expression = String(firstTerm);
    
    // Generate remaining terms
    for (let i = 1; i < termCount; i++) {
        let operator = getRandomOperator();
        operators.push(operator);
        
        let nextTerm;
        
        if (operator === '+') {
            // For addition, generate any valid number
            digitCount = getRandomDigitCount();
            nextTerm = getRandomNumberWithDigits(digitCount);
        } else {
            // For subtraction, ensure running total doesn't go negative
            // Generate a number that's <= running total and respects digit range
            const maxAllowed = runningTotal;
            digitCount = getRandomDigitCount();
            
            const minForDigits = digitCount === 1 ? 0 : (digitCount === 2 ? 10 : 100);
            const maxForDigits = digitCount === 1 ? 9 : (digitCount === 2 ? 99 : 999);
            
            // Adjust to ensure we don't go negative
            const minTerm = minForDigits;
            const maxTerm = Math.min(maxForDigits, maxAllowed);
            
            if (minTerm <= maxTerm) {
                nextTerm = randomInt(minTerm, maxTerm);
            } else {
                // If the digit range doesn't fit, just use a number <= running total
                nextTerm = randomInt(0, maxAllowed);
            }
        }
        
        terms.push(nextTerm);
        expression += ` ${operator} ${nextTerm}`;
        
        // Update running total
        if (operator === '+') {
            runningTotal += nextTerm;
        } else {
            runningTotal -= nextTerm;
        }
    }
    
    return {
        expression: expression + ' = ?',
        expressionOnly: expression,
        correctAnswer: runningTotal,
        terms: terms,
        operators: operators
    };
}

/**
 * Generate all questions for the practice session
 */
function generateQuestions() {
    appState.questions = [];
    for (let i = 0; i < appState.config.questionCount; i++) {
        const q = generateExpression();
        appState.questions.push({
            expression: q.expression,
            correctAnswer: q.correctAnswer,
            userAnswer: null,
            status: 'unanswered'
        });
    }
}

/**
 * Format time in mm:ss format
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Update the timer display
 */
function updateTimer() {
    if (appState.timeRemaining <= 0) {
        endPracticeSession();
        return;
    }
    
    timer.textContent = formatTime(appState.timeRemaining);
    
    // Add warning animation when less than 30 seconds
    if (appState.timeRemaining <= 30) {
        timer.classList.add('warning');
    } else {
        timer.classList.remove('warning');
    }
    
    appState.timeRemaining--;
}

/**
 * Start the practice session timer
 */
function startTimer() {
    appState.timeRemaining = appState.config.timeLimit * 60;
    updateTimer(); // Display initial time
    
    appState.timerId = setInterval(updateTimer, 1000);
    appState.sessionActive = true;
}

/**
 * Stop the timer
 */
function stopTimer() {
    if (appState.timerId) {
        clearInterval(appState.timerId);
        appState.timerId = null;
    }
    appState.sessionActive = false;
}

/**
 * Display current question
 */
function displayQuestion() {
    const question = appState.questions[appState.currentQuestionIndex];
    questionNum.textContent = appState.currentQuestionIndex + 1;
    totalQuestions.textContent = appState.config.questionCount;
    expression.textContent = question.expression;
    appState.currentAnswer = '';
    updateAnswerDisplay();
    updateProgressBar();
}

/**
 * Update the progress bar visual
 */
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((appState.currentQuestionIndex) / appState.config.questionCount) * 100;
        progressBar.style.width = progress + '%';
    }
}

/**
 * Update the answer display (shows _ or the entered digits)
 */
function updateAnswerDisplay() {
    if (appState.currentAnswer === '') {
        answerValue.textContent = '_';
    } else {
        answerValue.textContent = appState.currentAnswer;
    }
}

/**
 * Add a digit to current answer
 */
function addDigit(digit) {
    if (!appState.sessionActive) return;
    
    // Limit answer length to 4 digits (reasonable for grade 2 math)
    if (appState.currentAnswer.length < 4) {
        appState.currentAnswer += digit;
        updateAnswerDisplay();
    }
}

/**
 * Clear the current answer
 */
function clearAnswer() {
    if (!appState.sessionActive) return;
    
    appState.currentAnswer = '';
    updateAnswerDisplay();
}

/**
 * Remove last digit from answer
 */
function backspaceAnswer() {
    if (!appState.sessionActive) return;
    
    appState.currentAnswer = appState.currentAnswer.slice(0, -1);
    updateAnswerDisplay();
}

/**
 * Submit the current answer and move to next question
 */
function submitAnswer() {
    if (!appState.sessionActive) return;
    
    const question = appState.questions[appState.currentQuestionIndex];
    
    if (appState.currentAnswer === '') {
        // Unanswered
        question.userAnswer = null;
        question.status = 'unanswered';
    } else {
        question.userAnswer = parseInt(appState.currentAnswer);
        question.status = question.userAnswer === question.correctAnswer ? 'correct' : 'wrong';
    }
    
    // Move to next question
    appState.currentQuestionIndex++;
    
    if (appState.currentQuestionIndex >= appState.config.questionCount) {
        endPracticeSession();
    } else {
        displayQuestion();
    }
}

/**
 * End practice session and show results
 */
function endPracticeSession() {
    stopTimer();
    
    // Mark remaining questions as unanswered
    for (let i = appState.currentQuestionIndex; i < appState.questions.length; i++) {
        appState.questions[i].status = 'unanswered';
        appState.questions[i].userAnswer = null;
    }
    
    // Show "Time Up!" message if time expired (not all questions completed)
    if (appState.currentQuestionIndex < appState.config.questionCount && appState.timeRemaining <= 0) {
        showTimeUpMessage();
    } else {
        showResults();
    }
}

/**
 * Show "Time Up!" message briefly, then show results
 */
function showTimeUpMessage() {
    const message = document.createElement('div');
    message.className = 'time-up-message';
    message.textContent = '⏰ Time\'s Up!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
        showResults();
    }, 1500);
}

/**
 * Calculate stats from answers
 */
function calculateStats() {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    
    appState.questions.forEach(q => {
        if (q.status === 'correct') correct++;
        else if (q.status === 'wrong') wrong++;
        else unanswered++;
    });
    
    const total = appState.questions.length;
    const percentage = Math.round((correct / total) * 100);
    
    return { correct, wrong, unanswered, total, percentage };
}

// -----------------------------------------------------------------------------
// encouragement messages pools and helper
// -----------------------------------------------------------------------------

// returns a random element from a list
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// high score (>=90%) jokes with praise
const highScoreJokes = [
    "You're a math hero! Why was the number 6 afraid of 7? Because 7 8 9! 😄",
    "Wow! You're calculating faster than a cheetah! Why did 7 eat 9? Because you're great!",
    "You're on a roll! What did the triangle say to the circle? You're pointless! (But you're not!).",
    "Fantastic! What do you call friends who love math? Math pals!",
    "Amazing score! Why was six afraid of seven? Because 7 8 9! Keep eating up those problems.",
    "You're a star! What did the 0 say to the 8? Nice belt!",
    "Incredible! Why do bees love math? Because they love to multiply!",
    "Bravo! What kind of flower grows on your face? A tulips! You've got many!",
    "Superb! What do you call a number that can't keep still? A roaming numeral! You're not roaming, you're dominating!",
    "You're unstoppable! Why was the equal sign so humble? Because it knew it wasn't less than or greater than anyone else.",
    "You're brilliant! Why did the student do multiplication problems on the floor? The teacher told him not to use tables!",
    "Top score! Why was the math book sad? Because it had too many problems... but you've solved them all!",
    "You're a champ! Why did two 4s skip lunch? They already 8! Keep going!",
    "Outstanding! What do you call the king of the pencil case? The ruler! You're royalty in math!",
    "Magnificent! Why is six afraid of seven? Because 7 8 9 — but you just gave 7 a high-five!",
    "Awesome! Why did the number 2 go to school? To become a better number!",
    "You're a whiz! Why did seven eat nine? Because you're smart enough to catch it!",
    "Fantastic work! Why did four and five get married? Because they couldn't 2 (too) to gether without you!",
    "Super! What did one math book say to the other? I've got problems, but you're the solution!",
    "You're genius! What did the zero say to the eight? Nice belt!"
];

// good score (70–89%) strong praise
const strongPraiseMessages = [
    "Great job! You're doing really well.",
    "Nice work! Keep those good answers coming.",
    "You're getting smarter every question!",
    "Fantastic effort! Your brain is shining.",
    "Keep it up! You're on the right track.",
    "Super job! I'm proud of how hard you're trying.",
    "You're doing amazing — don't stop now!",
    "Way to go! You're really improving.",
    "You're a math whiz in the making!",
    "Wow! That was really impressive.",
    "Keep practicing and you'll be a pro!",
    "Excellent work today, superstar!",
    "Your answers are getting stronger and stronger.",
    "You're showing great focus, keep it up.",
    "Terrific job! You're making wonderful progress.",
    "You're doing such a great job — high five!",
    "You're learning so much — great work!",
    "Bravo! You're really good at this.",
    "You're on a roll, keep solving those problems!",
    "Wow, you're doing fantastic!"
];

// medium score (40–69%) motivational messages
const motivationalMessages = [
    "Nice try! Keep practicing and you'll get there.",
    "Don't worry, every question helps you learn more.",
    "You're doing okay — let's aim for even better next time.",
    "Practice makes perfect, keep at it!",
    "You can do it! Just a little more practice.",
    "Keep going, you're getting stronger.",
    "Every mistake is a step forward.",
    "You're doing better than you think!",
    "Stay focused — you have what it takes.",
    "Keep trying and you'll surprise yourself.",
    "You're improving with each question.",
    "A little more practice and you'll ace it!",
    "Don't give up — you can do this!",
    "You're on the right path, keep moving.",
    "Take your time and practice, you've got this.",
    "You're brave for trying — keep practicing.",
    "One step at a time and you'll get there.",
    "Keep your chin up and try again.",
    "You're learning — that's what's important.",
    "Stay positive and keep solving!"
];

// low score (<40%) gentle motivation
const gentleMotivationMessages = [
    "It's okay, you're still awesome! Let's try again soon.",
    "No worries — every practice helps you grow.",
    "You're doing your best, and that's wonderful.",
    "Mistakes are how we learn! Keep going.",
    "You're not alone, everyone starts somewhere.",
    "Be proud of yourself for trying.",
    "Take a break and come back stronger.",
    "You're brave for practicing — keep it up.",
    "Slow and steady wins the race.",
    "You're doing fine; we're just warming up.",
    "You're learning new things every question.",
    "It's okay to make mistakes — you're learning.",
    "You're a superstar for giving it a try.",
    "Every effort counts — you're doing great.",
    "Keep your head up and try again later.",
    "You're capable of so much — don't give up.",
    "You're doing better than you think!",
    "A fresh try tomorrow will be even better.",
    "You're amazing just for trying.",
    "Take a breath and try again — you've got this."
];

/**
 * Get encouragement message based on score
 */
function getEncouragementMessage(percentage) {
    if (percentage >= 90) {
        return pickRandom(highScoreJokes);
    } else if (percentage >= 70) {
        return pickRandom(strongPraiseMessages);
    } else if (percentage >= 40) {
        return pickRandom(motivationalMessages);
    } else {
        return pickRandom(gentleMotivationMessages);
    }
}

/**
 * Create confetti animation
 */
function createConfetti() {
    const container = confettiContainer;
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fa709a', '#fee140'];
    
    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.background = color;
        
        const startX = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 1;
        
        confetti.style.left = startX + '%';
        confetti.style.top = '-10px';
        confetti.style.animation = `confettiFall ${duration}s linear ${delay}s forwards`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        container.appendChild(confetti);
    }
    
    // Clear confetti after animation
    setTimeout(() => {
        container.innerHTML = '';
    }, 3500);
}

/**
 * Display results screen
 */
function showResults() {
    const stats = calculateStats();
    
    // Update stats
    statCorrect.textContent = stats.correct;
    statWrong.textContent = stats.wrong;
    statUnanswered.textContent = stats.unanswered;
    
    // Update score
    scoreNum.textContent = stats.correct;
    scoreTotal.textContent = stats.total;
    percentageDisplay.textContent = `${stats.percentage}%`;
    
    // Encouragement message
    encouragement.textContent = getEncouragementMessage(stats.percentage);
    
    // Confetti for good scores
    if (stats.percentage >= 70) {
        createConfetti();
    }
    
    // Build review list
    buildReviewList();
    
    switchScreen('result');
}

/**
 * Build the review list showing all questions and answers
 */
function buildReviewList() {
    reviewList.innerHTML = '';
    
    appState.questions.forEach((q, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${q.status}`;
        
        const statusText = q.status === 'correct' ? '✓ Correct' : 
                          q.status === 'wrong' ? '✗ Wrong' : 
                          '○ Unanswered';
        
        const userAnswerText = q.userAnswer === null ? '(not answered)' : q.userAnswer;
        
        reviewItem.innerHTML = `
            <div class="review-label">Question ${index + 1}</div>
            <div class="review-expression">${q.expression}</div>
            <div class="review-answer">
                <div class="review-answer-item">
                    <span class="review-answer-label">Your Answer:</span>
                    <span class="review-answer-value">${userAnswerText}</span>
                </div>
                <div class="review-answer-item">
                    <span class="review-answer-label">Correct Answer:</span>
                    <span class="review-answer-value">${q.correctAnswer}</span>
                </div>
            </div>
            <span class="review-status ${q.status}">${statusText}</span>
        `;
        
        reviewList.appendChild(reviewItem);
    });
}

/**
 * Start a new practice session
 */
function startPractice() {
    appState.currentQuestionIndex = 0;
    appState.currentAnswer = '';
    generateQuestions();
    switchScreen('practice');
    displayQuestion();
    startTimer();
}

/**
 * Reset everything and go back to setup
 */
function resetToSetup() {
    stopTimer();
    appState.currentQuestionIndex = 0;
    appState.currentAnswer = '';
    appState.questions = [];
    switchScreen('setup');
}

// ===== EVENT LISTENERS =====

// prevent iPad Safari double-tap zoom when quickly tapping blank areas
// but allow rapid taps on the number-pad itself
(function preventDoubleTapZoom() {
    let lastTap = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        // if second tap occurs within 300ms and it didn't happen on a pad button,
        // preventDefault to stop the zoom.  Otherwise let the event through so
        // the digit can be registered.
        if (now - lastTap <= 300 && !e.target.closest('.pad-button')) {
            e.preventDefault();
        }
        lastTap = now;
    }, { passive: false });
})();

// Slider value updates
minDigitsSelect.addEventListener('input', () => {
    minDigitsValue.textContent = minDigitsSelect.value;
});
maxDigitsSelect.addEventListener('input', () => {
    maxDigitsValue.textContent = maxDigitsSelect.value;
});
minTermsSelect.addEventListener('input', () => {
    minTermsValue.textContent = minTermsSelect.value;
});
maxTermsSelect.addEventListener('input', () => {
    maxTermsValue.textContent = maxTermsSelect.value;
});

// Setup screen
startBtn.addEventListener('click', () => {
    if (validateSetup()) {
        saveConfiguration();
        startPractice();
    }
});

// Practice screen - number buttons
numButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        addDigit(btn.dataset.num);
    });
});

clearBtn.addEventListener('click', clearAnswer);
backspaceBtn.addEventListener('click', backspaceAnswer);
submitBtn.addEventListener('click', submitAnswer);

// Result screen
practiceAgainBtn.addEventListener('click', startPractice);
backToSetupBtn.addEventListener('click', resetToSetup);

// ===== INITIALIZATION =====
// Initialize slider value displays
minDigitsValue.textContent = minDigitsSelect.value;
maxDigitsValue.textContent = maxDigitsSelect.value;
minTermsValue.textContent = minTermsSelect.value;
maxTermsValue.textContent = maxTermsSelect.value;

// App starts on setup screen which is already active in HTML

