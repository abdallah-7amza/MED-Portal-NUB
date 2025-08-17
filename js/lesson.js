/**
 * Lesson View Logic for NUB Med Portal
 * Handles lesson content rendering and quizzes
 * 
 * Prepared by Abdallah Hamza
 */

import githubService from './github.js';

document.addEventListener('DOMContentLoaded', () => {
    // Only run on lesson.html
    if (!document.getElementById('lesson-content')) return;
    
    const params = new URLSearchParams(window.location.search);
    const year = params.get('year');
    const subject = params.get('subject');
    const topic = params.get('topic');
    
    if (!year || !subject || !topic) {
        renderError('Invalid lesson parameters');
        return;
    }
    
    // Set lesson title
    document.getElementById('lesson-title').textContent = 
        topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Load lesson content
    loadLessonContent(year, subject, topic);
    
    // Setup back button
    document.getElementById('back-to-topics-btn').addEventListener('click', () => {
        window.location.href = `index.html?year=${year}&subject=${subject}`;
    });
});

async function loadLessonContent(year, subject, topic) {
    try {
        const { content, quiz } = await githubService.getLessonContent(year, subject, topic);
        
        // Render lesson content
        renderLessonContent(content);
        
        // Render quiz if available
        if (quiz && quiz.length > 0) {
            renderQuiz(quiz, topic);
        }
        
        // Hide skeleton loader
        document.getElementById('lesson-body-skeleton').style.display = 'none';
    } catch (error) {
        console.error('Error loading lesson content:', error);
        renderError('Failed to load lesson content');
    }
}

function renderLessonContent(markdownContent) {
    const contentElement = document.getElementById('lesson-content');
    
    // Convert markdown to HTML
    const htmlContent = marked.parse(markdownContent);
    
    // Create lesson container
    const lessonContainer = document.createElement('div');
    lessonContainer.className = 'lesson-content';
    lessonContainer.innerHTML = htmlContent;
    
    // Replace the skeleton with actual content
    contentElement.replaceWith(lessonContainer);
}

function renderQuiz(quizData, topicName) {
    const quizContainer = document.getElementById('quiz-container');
    
    // Quiz header
    const quizHeader = document.createElement('div');
    quizHeader.className = 'quiz-header';
    quizHeader.innerHTML = `
        <h3>Test Your Knowledge: ${topicName.replace(/-/g, ' ')}</h3>
        <p>Complete this quiz to reinforce your learning</p>
    `;
    
    // Quiz questions
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'quiz-questions';
    
    quizData.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'quiz-question';
        questionElement.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.stem}</p>
            <div class="options">
                ${question.options.map((opt, i) => `
                    <div class="option">
                        <input type="radio" id="q${index}-opt${i}" name="q${index}" value="${i}">
                        <label for="q${index}-opt${i}">${opt}</label>
                    </div>
                `).join('')}
            </div>
            <div class="explanation" style="display:none;">
                <strong>Explanation:</strong> ${question.explanation}
            </div>
        `;
        questionsContainer.appendChild(questionElement);
    });
    
    // Submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'submit-quiz';
    submitButton.textContent = 'Submit Quiz';
    submitButton.addEventListener('click', () => {
        evaluateQuiz(quizData);
    });
    
    // Assemble quiz
    quizContainer.innerHTML = '';
    quizContainer.appendChild(quizHeader);
    quizContainer.appendChild(questionsContainer);
    quizContainer.appendChild(submitButton);
}

function evaluateQuiz(quizData) {
    let score = 0;
    const results = [];
    
    quizData.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        const explanation = document.querySelectorAll('.explanation')[index];
        
        if (!selectedOption) {
            explanation.style.display = 'block';
            explanation.style.backgroundColor = '#ffeeee';
            results.push({ question: index + 1, correct: false });
            return;
        }
        
        const isCorrect = parseInt(selectedOption.value) === question.answerIndex;
        if (isCorrect) {
            explanation.style.display = 'block';
            explanation.style.backgroundColor = '#eeffee';
            score++;
            results.push({ question: index + 1, correct: true });
        } else {
            explanation.style.display = 'block';
            explanation.style.backgroundColor = '#ffeeee';
            results.push({ question: index + 1, correct: false });
        }
    });
    
    // Show results
    const percentage = Math.round((score / quizData.length) * 100);
    const resultsHTML = `
        <div class="quiz-results">
            <h4>Your Score: ${score}/${quizData.length} (${percentage}%)</h4>
            <p>${percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good job!' : 'Keep studying!'}</p>
            <button id="retry-quiz">Retry Quiz</button>
        </div>
    `;
    
    document.querySelector('.submit-quiz').insertAdjacentHTML('afterend', resultsHTML);
    document.querySelector('.submit-quiz').style.display = 'none';
    
    // Retry button
    document.getElementById('retry-quiz').addEventListener('click', () => {
        document.querySelectorAll('.explanation').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('input[type="radio"]').forEach(el => {
            el.checked = false;
        });
        document.querySelector('.quiz-results').remove();
        document.querySelector('.submit-quiz').style.display = 'block';
    });
}

function renderError(message) {
    const contentElement = document.getElementById('lesson-content');
    contentElement.innerHTML = `
        <div class="error-message">
            <h3>Error Loading Content</h3>
            <p>${message}</p>
            <button onclick="location.href='index.html'">Return to Home</button>
        </div>
    `;
    document.getElementById('lesson-body-skeleton').style.display = 'none';
}
