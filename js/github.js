/**
 * GitHub Service for NUB Med Portal
 * Handles all interactions with GitHub API
 * 
 * Prepared by Abdallah Hamza
 */

const GITHUB_OWNER = 'abdallah-7amza';
const GITHUB_REPO = 'nub-med-portal';
const BASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

class GitHubService {
    constructor() {
        this.cache = new Map();
    }

    async getAcademicYears() {
        const cacheKey = 'academic-years';
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
        
        try {
            const response = await fetch(`${BASE_URL}/years`);
            if (!response.ok) throw new Error('Failed to fetch academic years');
            
            const data = await response.json();
            const years = data
                .filter(item => item.type === 'dir')
                .map(item => item.name.replace('.json', ''));
            
            this.cache.set(cacheKey, years);
            return years;
        } catch (error) {
            console.error('GitHubService.getAcademicYears:', error);
            return [];
        }
    }

    async getSubjects(year) {
        const cacheKey = `subjects-${year}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
        
        try {
            const response = await fetch(`${BASE_URL}/years/${year}`);
            if (!response.ok) throw new Error(`Failed to fetch subjects for ${year}`);
            
            const data = await response.json();
            const subjects = data
                .filter(item => item.type === 'dir')
                .map(item => ({
                    id: item.name,
                    title: item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    path: item.path
                }));
            
            this.cache.set(cacheKey, subjects);
            return subjects;
        } catch (error) {
            console.error(`GitHubService.getSubjects for ${year}:`, error);
            return [];
        }
    }

    async getTopics(year, subject) {
        const cacheKey = `topics-${year}-${subject}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
        
        try {
            const response = await fetch(`${BASE_URL}/years/${year}/${subject}`);
            if (!response.ok) throw new Error(`Failed to fetch topics for ${subject}`);
            
            const data = await response.json();
            const topics = data
                .filter(item => item.type === 'dir')
                .map(item => ({
                    id: item.name,
                    title: item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    path: item.path
                }));
            
            this.cache.set(cacheKey, topics);
            return topics;
        } catch (error) {
            console.error(`GitHubService.getTopics for ${subject}:`, error);
            return [];
        }
    }

    async getLessonContent(year, subject, topic) {
        const cacheKey = `content-${year}-${subject}-${topic}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
        
        try {
            // Fetch lesson content
            const contentUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/years/${year}/${subject}/${topic}/content.md`;
            const contentResponse = await fetch(contentUrl);
            if (!contentResponse.ok) throw new Error('Lesson content not found');
            
            const content = await contentResponse.text();
            
            // Fetch quiz questions
            const quizUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/questions/${year}/${subject}/${topic}.json`;
            const quizResponse = await fetch(quizUrl);
            const quiz = quizResponse.ok ? await quizResponse.json() : null;
            
            const lessonData = { content, quiz };
            this.cache.set(cacheKey, lessonData);
            return lessonData;
        } catch (error) {
            console.error(`GitHubService.getLessonContent for ${topic}:`, error);
            return {
                content: '# Lesson Not Found\n\nThis lesson content is not available yet.',
                quiz: null
            };
        }
    }
}

// Export as singleton
const githubService = new GitHubService();
export default githubService;
