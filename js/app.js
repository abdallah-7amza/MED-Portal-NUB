// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const views = document.querySelectorAll('.view');
    const yearGrid = document.getElementById('year-grid');
    const subjectGrid = document.getElementById('subject-grid');
    const topicGrid = document.getElementById('topic-grid');
    const subjectTitle = document.getElementById('subject-view-title');
    const topicTitle = document.getElementById('topic-view-title');
    
    // Navigation state
    let navigationStack = [];
    let currentYear = null;
    let currentSubject = null;
    
    // Mock data for subjects and topics
    const subjectsData = {
        'first-year': [
            { id: 'anatomy', title: 'Anatomy' },
            { id: 'physiology', title: 'Physiology' },
            { id: 'biochemistry', title: 'Biochemistry' }
        ],
        'second-year': [
            { id: 'pharmacology', title: 'Pharmacology' },
            { id: 'microbiology', title: 'Microbiology' },
            { id: 'pathology', title: 'Pathology' }
        ],
        'third-year': [
            { id: 'medicine', title: 'Internal Medicine' },
            { id: 'surgery', title: 'Surgery' },
            { id: 'pediatrics', title: 'Pediatrics' }
        ],
        'fourth-year': [
            { id: 'obstetrics', title: 'Obstetrics' },
            { id: 'gynecology', title: 'Gynecology' },
            { id: 'psychiatry', title: 'Psychiatry' }
        ],
        'fifth-year': [
            { id: 'pediatrics', title: 'Pediatrics' },
            { id: 'obgyn', title: 'OB/GYN' },
            { id: 'psychiatry', title: 'Psychiatry' },
            { id: 'family-medicine', title: 'Family Medicine' },
            { id: 'community-medicine', title: 'Community Medicine' }
        ]
    };
    
    const topicsData = {
        'pediatrics': [
            { id: 'hematology', title: 'Hematology' },
            { id: 'neonatology', title: 'Neonatology' },
            { id: 'infectious-diseases', title: 'Infectious Diseases' }
        ],
        'obgyn': [
            { id: 'obstetrics', title: 'Obstetrics' },
            { id: 'gynecology', title: 'Gynecology' },
            { id: 'infertility', title: 'Infertility' }
        ],
        'psychiatry': [
            { id: 'depression', title: 'Depression' },
            { id: 'anxiety', title: 'Anxiety Disorders' },
            { id: 'psychosis', title: 'Psychotic Disorders' }
        ],
        'family-medicine': [
            { id: 'diabetes', title: 'Diabetes' },
            { id: 'hypertension', title: 'Hypertension' },
            { id: 'asthma', title: 'Asthma' }
        ],
        'community-medicine': [
            { id: 'epidemiology', title: 'Epidemiology' },
            { id: 'biostatistics', title: 'Biostatistics' },
            { id: 'public-health', title: 'Public Health' }
        ]
    };
    
    // Initialize the application
    init();
    
    function init() {
        // Add event listeners
        setupEventListeners();
        
        // Show initial view
        showView('year-view');
    }
    
    function setupEventListeners() {
        // Year selection
        yearGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;
            
            const year = card.dataset.year;
            showSubjects(year);
        });
        
        // Subject selection
        subjectGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;
            
            const subject = card.dataset.subjectId;
            showTopics(currentYear, subject);
        });
        
        // Topic selection
        topicGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;
            
            const topic = card.dataset.topicId;
            navigateToLesson(currentYear, currentSubject, topic);
        });
        
        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.dataset.target;
                navigateBack(targetView);
            });
        });
    }
    
    function showView(viewId) {
        views.forEach(view => view.classList.remove('active'));
        const newView = document.getElementById(viewId);
        newView.classList.add('active');
        window.scrollTo(0, 0);
    }
    
    function showSubjects(year) {
        currentYear = year;
        const subjects = subjectsData[year] || [];
        
        subjectTitle.textContent = `Subjects for ${year.replace('-', ' ')}`;
        subjectGrid.innerHTML = subjects.map(subject => `
            <div class="card" data-subject-id="${subject.id}">
                <h3>${subject.title}</h3>
            </div>
        `).join('');
        
        navigationStack.push({ viewId: 'subject-view', year });
        showView('subject-view');
    }
    
    function showTopics(year, subject) {
        currentSubject = subject;
        const topics = topicsData[subject] || [];
        
        topicTitle.textContent = `Topics for ${subject.replace('-', ' ')}`;
        topicGrid.innerHTML = topics.map(topic => `
            <div class="card" data-topic-id="${topic.id}">
                <h3>${topic.title}</h3>
            </div>
        `).join('');
        
        navigationStack.push({ viewId: 'topic-view', year, subject });
        showView('topic-view');
    }
    
    function navigateToLesson(year, subject, topic) {
        // Navigate to lesson page with parameters
        window.location.href = `lesson.html?year=${year}&subject=${subject}&topic=${topic}`;
    }
    
    function navigateBack(targetView) {
        // Pop the current view from the stack
        navigationStack.pop();
        
        // Get the previous view
        const previousView = navigationStack[navigationStack.length - 1];
        
        if (previousView) {
            if (previousView.viewId === 'subject-view') {
                showSubjects(previousView.year);
            } else if (previousView.viewId === 'topic-view') {
                showTopics(previousView.year, previousView.subject);
            }
        } else {
            showView('year-view');
        }
    }
});
