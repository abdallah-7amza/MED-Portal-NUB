// js/lesson.js
document.addEventListener('DOMContentLoaded', () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const year = urlParams.get('year');
    const subject = urlParams.get('subject');
    const topic = urlParams.get('topic');
    
    // DOM Elements
    const lessonTitle = document.getElementById('lesson-title');
    const lessonContent = document.getElementById('lesson-content');
    const quizContainer = document.getElementById('quiz-container');
    const backToTopicsBtn = document.getElementById('back-to-topics-btn');
    
    // Mock lesson content
    const lessonData = {
        title: `${topic} - ${subject}`,
        content: `
            <h3>Overview</h3>
            <p>This is a comprehensive lesson on ${topic} in the field of ${subject}. This topic is essential for medical students in their ${year} of study.</p>
            
            <h3>Key Concepts</h3>
            <ul>
                <li>Understanding the fundamental principles of ${topic}</li>
                <li>Clinical applications and relevance</li>
                <li>Current research and developments</li>
                <li>Case studies and practical examples</li>
            </ul>
            
            <h3>Clinical Significance</h3>
            <p>Knowledge of ${topic} is crucial for medical practitioners as it directly impacts patient care and treatment outcomes. This section explores the clinical significance in detail.</p>
            
            <h3>Diagnostic Approaches</h3>
            <p>Various diagnostic methods are used to identify conditions related to ${topic}. These include laboratory tests, imaging studies, and clinical assessments.</p>
            
            <h3>Treatment Modalities</h3>
            <p>Management of conditions related to ${topic} involves a multidisciplinary approach. Treatment options include pharmacological interventions, surgical procedures, and lifestyle modifications.</p>
            
            <h3>Recent Advances</h3>
            <p>Recent advances in the field of ${topic} have revolutionized our understanding and approach to patient care. This section highlights the latest research and innovations.</p>
        `,
        quiz: [
            {
                question: `What is the primary concern when managing ${topic}?`,
                options: [
                    "Patient compliance",
                    "Cost-effectiveness",
                    "Clinical outcomes",
                    "All of the above"
                ],
                answer: 3,
                explanation: "All of these factors are important when managing conditions related to this topic."
            },
            {
                question: `Which diagnostic method is most specific for ${topic}?`,
                options: [
                    "Physical examination",
                    "Laboratory tests",
                    "Imaging studies",
                    "Patient history"
                ],
                answer: 1,
                explanation: "Laboratory tests provide the most specific diagnostic information for this condition."
            },
            {
                question: `What is the first-line treatment for ${topic}?`,
                options: [
                    "Pharmacological intervention",
                    "Surgical procedure",
                    "Lifestyle modification",
                    "Observation"
                ],
                answer: 0,
                explanation: "Pharmacological intervention is typically the first-line treatment approach."
            }
        ]
    };
    
    // Initialize the lesson page
    init();
    
    function init() {
        // Set lesson title
        lessonTitle.textContent = lessonData.title;
        
        // Load lesson content
        loadLessonContent();
        
        // Load quiz
        loadQuiz();
        
        // Setup event listeners
        setupEventListeners();
    }
    
    function loadLessonContent() {
        // Hide skeleton loader
        document.getElementById('lesson-body-skeleton').style.display = 'none';
        
        // Create lesson content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'lesson-content';
        contentContainer.innerHTML = lessonData.content;
        
        // Replace skeleton with content
        lessonContent.innerHTML = '';
        lessonContent.appendChild(contentContainer);
    }
    
    function loadQuiz() {
        // Create quiz container
        const quizHtml = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <h3>Test Your Knowledge</h3>
                    <p>Complete this quiz to reinforce your learning</p>
                </div>
                <div class="quiz-questions">
                    ${lessonData.quiz.map((q, index) => `
                        <div class="quiz-question" data-index="${index}">
                            <h4>Question ${index + 1}</h4>
                            <p>${q.question}</p>
                            <div class="options">
                                ${q.options.map((opt, i) => `
                                    <div class="option">
                                        <input type="radio" id="q${index}-opt${i}" name="q${index}" value="${i}">
                                        <label for="q${index}-opt${i}">${opt}</label>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="explanation" style="display:none;">
                                <strong>Explanation:</strong> ${q.explanation}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="quiz-actions">
                    <button id="submit-quiz" class="test-button">Submit Quiz</button>
                </div>
            </div>
        `;
        
        quizContainer.innerHTML = quizHtml;
        
        // Add submit button event listener
        document.getElementById('submit-quiz').addEventListener('click', evaluateQuiz);
    }
    
    function evaluateQuiz() {
        let score = 0;
        const totalQuestions = lessonData.quiz.length;
        
        lessonData.quiz.forEach((q, index) => {
            const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
            const explanation = document.querySelector(`.quiz-question[data-index="${index}"] .explanation`);
            
            if (selectedOption) {
                const selectedIndex = parseInt(selectedOption.value);
                if (selectedIndex === q.answer) {
                    score++;
                    explanation.style.backgroundColor = '#e8f5e9';
                } else {
                    explanation.style.backgroundColor = '#ffebee';
                }
            } else {
                explanation.style.backgroundColor = '#ffebee';
            }
            
            explanation.style.display = 'block';
        });
        
        // Show results
        const percentage = Math.round((score / totalQuestions) * 100);
        const resultHtml = `
            <div class="quiz-results">
                <h4>Your Score: ${score}/${totalQuestions} (${percentage}%)</h4>
                <p>${percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good job!' : 'Keep studying!'}</p>
                <button id="retry-quiz" class="nav-btn">Retry Quiz</button>
            </div>
        `;
        
        document.querySelector('.quiz-actions').innerHTML = resultHtml;
        
        // Add retry button event listener
        document.getElementById('retry-quiz').addEventListener('click', () => {
            location.reload();
        });
    }
    
    function setupEventListeners() {
        // Back button
        backToTopicsBtn.addEventListener('click', () => {
            window.location.href = `index.html?year=${year}&subject=${subject}`;
        });
    }
});
