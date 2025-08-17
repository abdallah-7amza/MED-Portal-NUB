/**
 * Main Application Logic for NUB Med Portal
 * Handles navigation and view rendering
 * 
 * Prepared by Abdallah Hamza
 */

import githubService from './github.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const views = {
        year: document.getElementById('year-view'),
        subject: document.getElementById('subject-view'),
        topic: document.getElementById('topic-view'),
        subjectTitle: document.getElementById('subject-view-title'),
        topicTitle: document.getElementById('topic-view-title'),
        subjectGrid: document.getElementById('subject-grid'),
        topicGrid: document.getElementById('topic-grid')
    };
    
    // Navigation state
    let currentState = {
        year: null,
        subject: null
    };
    
    // Initialize the application
    init();
    
    async function init() {
        // Add event listeners
        setupEventListeners();
        
        // Show initial view
        showView('year');
    }
    
    function setupEventListeners() {
        // Year selection
        document.querySelectorAll('#year-grid .card').forEach(card => {
            card.addEventListener('click', async () => {
                const year = card.dataset.year;
                currentState.year = year;
                
                // Fetch subjects for selected year
                const subjects = await githubService.getSubjects(year);
                if (subjects.length === 0) {
                    views.subjectGrid.innerHTML = '<p class="no-content">No subjects available for this year</p>';
                } else {
                    renderSubjects(subjects);
                }
                
                views.subjectTitle.textContent = `Subjects for ${year.replace('-', ' ')}`;
                showView('subject');
            });
        });
        
        // Subject selection
        document.querySelector('#subject-grid').addEventListener('click', async (e) => {
            const card = e.target.closest('.card');
            if (!card) return;
            
            const subject = card.dataset.subjectId;
            currentState.subject = subject;
            
            // Fetch topics for selected subject
            const topics = await githubService.getTopics(currentState.year, subject);
            if (topics.length === 0) {
                views.topicGrid.innerHTML = '<p class="no-content">No topics available for this subject</p>';
            } else {
                renderTopics(topics);
            }
            
            views.topicTitle.textContent = `Topics for ${subject.replace(/-/g, ' ')}`;
            showView('topic');
        });
        
        // Topic selection
        document.querySelector('#topic-grid').addEventListener('click', async (e) => {
            const card = e.target.closest('.card');
            if (!card) return;
            
            const topic = card.dataset.topicId;
            navigateToLesson(currentState.year, currentState.subject, topic);
        });
        
        // Back button in lesson.html
        if (document.getElementById('back-to-topics-btn')) {
            document.getElementById('back-to-topics-btn').addEventListener('click', () => {
                history.back();
            });
        }
    }
    
    function renderSubjects(subjects) {
        views.subjectGrid.innerHTML = subjects.map(subject => `
            <div class="card" data-subject-id="${subject.id}">
                <h3>${subject.title}</h3>
                <p>Click to view topics</p>
            </div>
        `).join('');
    }
    
    function renderTopics(topics) {
        views.topicGrid.innerHTML = topics.map(topic => `
            <div class="card" data-topic-id="${topic.id}">
                <h3>${topic.title}</h3>
                <p>Click to view lesson</p>
            </div>
        `).join('');
    }
    
    function showView(viewName) {
        // Hide all views
        Object.values(views).forEach(view => {
            if (view.classList) view.classList.remove('active');
        });
        
        // Show selected view
        if (views[viewName]) views[viewName].classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    function navigateToLesson(year, subject, topic) {
        // Encode parameters for URL
        const params = new URLSearchParams();
        params.set('year', year);
        params.set('subject', subject);
        params.set('topic', topic);
        
        // Navigate to lesson page
        window.location.href = `lesson.html?${params.toString()}`;
    }
});
