/* ======================================================================= */
/* FILE: js/lesson.js                                                      */
/* PURPOSE: Handles all logic for the lesson page, including tabs,         */
/* rendering content, quizzes, and flashcards.                             */
/* VERSION: 3.0 - Full Feature Implementation                              */
/* ======================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // This script only runs on the lesson page
    if (!window.location.pathname.endsWith('lesson.html')) return;

    // --- CONFIGURATION & INITIALIZATION ---
    const GITHUB_REPO = 'abdallah-7amza/MED-Portal-NUB';
    const github = new GitHubService(GITHUB_REPO);
    const aiTutor = new AITutor();

    // --- DOM ELEMENTS ---
    const lessonTitleEl = document.getElementById('lesson-title');
    const lessonBodyEl = document.getElementById('lesson-body');
    const lessonBodySkeleton = document.getElementById('lesson-body-skeleton');
    const quizContainer = document.getElementById('quiz-container');
    const quizBodySkeleton = document.getElementById('quiz-body-skeleton');
    const flashcardsContainer = document.getElementById('flashcards-container');
    const flashcardsBodySkeleton = document.getElementById('flashcards-body-skeleton');
    const backLink = document.getElementById('back-to-lessons-link');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- STATE ---
    let lessonData = {}; // Will hold all data for the current lesson
    let quizState = { currentQuestionIndex: 0, userAnswers: [], score: 0, isFinished: false };
    let flashcardState = { currentCardIndex: 0 };

    // --- INITIALIZATION ---
    const params = new URLSearchParams(window.location.search);
    lessonData.year = params.get('year');
    lessonData.branch = params.get('branch');
    lessonData.lessonName = params.get('lesson');

    if (lessonData.year && lessonData.branch && lessonData.lessonName) {
        backLink.href = `lessons-list.html?year=${lessonData.year}&branch=${lessonData.branch}`;
        loadContent();
    }

    // --- EVENT LISTENERS ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // --- CORE FUNCTIONS ---
    async function loadContent() {
        try {
            const lessonPath = `lessons/${lessonData.year}/${lessonData.branch}/${lessonData.lessonName}.md`;
            const quizPath = `questions/${lessonData.year}/${lessonData.branch}/${lessonData.lessonName}.json`;
            
            const [lessonMd, quizJson] = await Promise.all([
                github.getRawFile(lessonPath),
                github.getJsonFile(quizPath).catch(() => ({})) // Gracefully fail if JSON doesn't exist
            ]);

            lessonData.lessonMd = lessonMd;
            lessonData.quizJson = quizJson;
            aiTutor.setContext(lessonData);

            renderAll();
        } catch (error) {
            console.error(error);
            lessonBodyEl.innerHTML = `<p class="error-message">Failed to load lesson content. Please check the file path and repository settings.</p>`;
        } finally {
            // Hide all skeletons regardless of outcome
            lessonBodySkeleton.style.display = 'none';
            quizBodySkeleton.style.display = 'none';
            flashcardsBodySkeleton.style.display = 'none';
        }
    }

    function renderAll() {
        lessonTitleEl.textContent = formatName(lessonData.lessonName);
        renderLesson();
        renderFlashcards();
        renderQuiz();
    }

    function renderLesson() {
        lessonBodyEl.innerHTML = marked.parse(lessonData.lessonMd);
    }

    // --- FLASHCARDS LOGIC ---
    function renderFlashcards() {
        const flashcards = lessonData.quizJson?.flashcards;
        if (!flashcards || flashcards.length === 0) {
            flashcardsContainer.innerHTML = '<p class="message-box">No flash cards available for this lesson.</p>';
            return;
        }

        flashcardState.currentCardIndex = 0;
        
        flashcardsContainer.innerHTML = `
            <div class="flashcard" id="flashcard">
                <div class="flashcard-inner">
                    <div class="flashcard-front"></div>
                    <div class="flashcard-back"></div>
                </div>
            </div>
            <div class="flashcard-nav">
                <button id="flashcard-prev-btn">&larr; Previous</button>
                <span id="flashcard-counter"></span>
                <button id="flashcard-next-btn">Next &rarr;</button>
            </div>
        `;

        const card = document.getElementById('flashcard');
        card.addEventListener('click', () => card.classList.toggle('is-flipped'));

        document.getElementById('flashcard-prev-btn').addEventListener('click', () => navigateFlashcard(-1));
        document.getElementById('flashcard-next-btn').addEventListener('click', () => navigateFlashcard(1));

        updateFlashcardContent();
    }

    function updateFlashcardContent() {
        const flashcards = lessonData.quizJson.flashcards;
        const index = flashcardState.currentCardIndex;
        const cardData = flashcards[index];

        document.querySelector('.flashcard-front').textContent = cardData.front;
        document.querySelector('.flashcard-back').textContent = cardData.back;
        document.getElementById('flashcard-counter').textContent = `${index + 1} / ${flashcards.length}`;
        
        document.getElementById('flashcard-prev-btn').disabled = index === 0;
        document.getElementById('flashcard-next-btn').disabled = index === flashcards.length - 1;

        document.getElementById('flashcard').classList.remove('is-flipped');
    }

    function navigateFlashcard(direction) {
        const newIndex = flashcardState.currentCardIndex + direction;
        const totalCards = lessonData.quizJson.flashcards.length;
        if (newIndex >= 0 && newIndex < totalCards) {
            flashcardState.currentCardIndex = newIndex;
            updateFlashcardContent();
        }
    }

    // --- QUIZ (MCQs) LOGIC ---
    function renderQuiz() {
        const mcqs = lessonData.quizJson?.mcqs;
        if (!mcqs || mcqs.length === 0) {
            quizContainer.innerHTML = '<p class="message-box">No MCQs available for this lesson.</p>';
            return;
        }

        quizState = { currentQuestionIndex: 0, userAnswers: new Array(mcqs.length).fill(null), score: 0, isFinished: false };
        renderQuestion();
    }

    function renderQuestion() {
        const index = quizState.currentQuestionIndex;
        const question = lessonData.quizJson.mcqs[index];
        const userAnswer = quizState.userAnswers[index];

        quizContainer.innerHTML = `
            <div class="quiz-progress">
                <span>Question ${index + 1} of ${lessonData.quizJson.mcqs.length}</span>
                <div class="progress-bar"><div class="progress-bar-inner" style="width: ${((index + 1) / lessonData.quizJson.mcqs.length) * 100}%"></div></div>
            </div>
            <div class="quiz-question">
                <h4>${question.stem}</h4>
                <div class="quiz-options">
                    ${question.options.map((option, i) => `
                        <button class="option-btn" data-index="${i}">${option}</button>
                    `).join('')}
                </div>
                <div class="quiz-explanation" style="display: none;"></div>
            </div>
            <div class="quiz-nav">
                <button id="quiz-prev-btn" ${index === 0 ? 'disabled' : ''}>&larr; Previous</button>
                <button id="quiz-next-btn">${index === lessonData.quizJson.mcqs.length - 1 ? 'Finish' : 'Next &rarr;'}</button>
            </div>
        `;

        document.getElementById('quiz-prev-btn').addEventListener('click', () => navigateQuestion(-1));
        document.getElementById('quiz-next-btn').addEventListener('click', () => navigateQuestion(1));
        
        const optionButtons = quizContainer.querySelectorAll('.option-btn');
        if (userAnswer !== null) {
            showAnswerFeedback(question, userAnswer);
        } else {
            optionButtons.forEach(btn => {
                btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
            });
        }
    }

    function selectAnswer(selectedIndex) {
        const index = quizState.currentQuestionIndex;
        if (quizState.userAnswers[index] !== null) return; // Already answered

        quizState.userAnswers[index] = selectedIndex;
        const question = lessonData.quizJson.mcqs[index];
        showAnswerFeedback(question, selectedIndex);
    }
    
    function showAnswerFeedback(question, selectedIndex) {
        const optionButtons = quizContainer.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => btn.disabled = true);

        const correctIndex = question.answerIndex;
        
        if (selectedIndex === correctIndex) {
            optionButtons[selectedIndex].classList.add('correct');
        } else {
            if (selectedIndex !== null) {
                optionButtons[selectedIndex].classList.add('incorrect');
            }
            optionButtons[correctIndex].classList.add('correct');
        }

        const explanationEl = quizContainer.querySelector('.quiz-explanation');
        explanationEl.textContent = question.explanation;
        explanationEl.style.display = 'block';
    }

    function navigateQuestion(direction) {
        const newIndex = quizState.currentQuestionIndex + direction;
        const totalQuestions = lessonData.quizJson.mcqs.length;

        if (direction === 1 && quizState.currentQuestionIndex === totalQuestions - 1) {
            showQuizResults();
            return;
        }

        if (newIndex >= 0 && newIndex < totalQuestions) {
            quizState.currentQuestionIndex = newIndex;
            renderQuestion();
        }
    }

    function showQuizResults() {
        quizState.isFinished = true;
        let score = 0;
        quizState.userAnswers.forEach((answer, index) => {
            if (answer === lessonData.quizJson.mcqs[index].answerIndex) {
                score++;
            }
        });
        quizState.score = score;
        const total = lessonData.quizJson.mcqs.length;

        quizContainer.innerHTML = `
            <div class="quiz-results">
                <h3>Quiz Complete</h3>
                <p class="score">You scored ${score} out of ${total} (${Math.round((score/total)*100)}%)</p>
                <div id="quiz-review"></div>
                <button id="restart-quiz-btn" class="modal-btn primary">Restart Quiz</button>
            </div>
        `;

        const reviewContainer = document.getElementById('quiz-review');
        lessonData.quizJson.mcqs.forEach((q, index) => {
            const userAnswer = quizState.userAnswers[index];
            const isCorrect = userAnswer === q.answerIndex;
            const reviewEl = document.createElement('div');
            reviewEl.className = 'quiz-review-item';
            reviewEl.innerHTML = `
                <p><strong>Q: ${q.stem}</strong></p>
                <p class="${isCorrect ? 'correct-text' : 'incorrect-text'}">Your answer: ${userAnswer !== null ? q.options[userAnswer] : 'Not answered'}</p>
                ${!isCorrect ? `<p class="correct-text">Correct answer: ${q.options[q.answerIndex]}</p>` : ''}
            `;
            reviewContainer.appendChild(reviewEl);
        });

        document.getElementById('restart-quiz-btn').addEventListener('click', renderQuiz);
    }

    function formatName(name) {
        return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
});

