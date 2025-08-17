/* ======================================================================= */
/* FILE: js/lesson.js                                                      */
/* ======================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.endsWith('lesson.html')) return;

    const GITHUB_REPO = 'abdallah-7amza/MED-Portal-NUB';
    const github = new GitHubService(GITHUB_REPO);
    const aiTutor = new AITutor();

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

    let lessonData = {};

    const params = new URLSearchParams(window.location.search);
    lessonData.year = params.get('year');
    lessonData.branch = params.get('branch');
    lessonData.lessonName = params.get('lesson');

    if (lessonData.year && lessonData.branch && lessonData.lessonName) {
        backLink.href = `lessons-list.html?year=${lessonData.year}&branch=${lessonData.branch}`;
        loadContent();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

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
            lessonBodyEl.innerHTML = `<p class="error">Failed to load lesson content.</p>`;
        } finally {
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

    function renderFlashcards() {
        const flashcards = lessonData.quizJson?.flashcards;
        if (!flashcards || flashcards.length === 0) {
            flashcardsContainer.innerHTML = '<p class="message-box">No flash cards available for this lesson.</p>';
            return;
        }
        // Placeholder for now
        flashcardsContainer.innerHTML = `<p class="message-box">Flash Cards feature is under construction.</p>`;
    }

    function renderQuiz() {
        const mcqs = lessonData.quizJson?.mcqs;
        if (!mcqs || mcqs.length === 0) {
            quizContainer.innerHTML = '<p class="message-box">No MCQs available for this lesson.</p>';
            return;
        }
        // Placeholder for now
        quizContainer.innerHTML = `<p class="message-box">MCQs feature is under construction.</p>`;
    }

    function formatName(name) {
        return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
});
