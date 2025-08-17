/* ======================================================================= */
/* FILE: js/ai.js                                                          */
/* PURPOSE: Handles all logic for the AI Tutor feature, including API      */
/* calls to Gemini.                                                         */
/* ======================================================================= */
class AITutor {
    constructor() {
        this.fab = document.getElementById('ai-tutor-fab');
        this.overlay = document.getElementById('ai-modal-overlay');
        this.apiKeyModal = document.getElementById('api-key-modal');
        this.chatModal = document.getElementById('chat-modal');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.saveApiKeyBtn = document.getElementById('save-api-key-btn');
        this.cancelApiKeyBtn = document.getElementById('cancel-api-key-btn');
        this.closeChatBtn = document.getElementById('close-chat-btn');
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        this.chatMessages = document.getElementById('chat-messages');

        this.apiKey = localStorage.getItem('geminiApiKey');
        this.lessonContext = null;
        this.chatHistory = [];
        this.isLoading = false;

        this.init();
    }

    init() {
        if (navigator.onLine) this.fab.style.display = 'flex';
        window.addEventListener('online', () => this.fab.style.display = 'flex');
        window.addEventListener('offline', () => this.fab.style.display = 'none');

        this.fab.addEventListener('click', () => this.handleFabClick());
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.cancelApiKeyBtn.addEventListener('click', () => this.closeAllModals());
        this.closeChatBtn.addEventListener('click', () => this.closeAllModals());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.closeAllModals();
        });
        this.chatForm.addEventListener('submit', (e) => { e.preventDefault(); this.sendMessage(); });
    }
    
    setContext(lessonData) { this.lessonContext = lessonData; }

    handleFabClick() {
        this.overlay.classList.add('visible');
        if (this.apiKey) {
            this.openChat();
        } else {
            this.apiKeyModal.style.display = 'flex';
        }
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (key) {
            this.apiKey = key;
            localStorage.setItem('geminiApiKey', key);
            this.apiKeyModal.style.display = 'none';
            this.openChat();
        } else {
            alert('Please enter a valid API key.');
        }
    }
    
    closeAllModals() {
        this.overlay.classList.remove('visible');
        this.apiKeyModal.style.display = 'none';
        this.chatModal.style.display = 'none';
    }

    openChat() {
        this.chatModal.style.display = 'flex';
        this.chatMessages.innerHTML = '';
        const welcomeText = `I'm your AI Tutor. How can I help you with this lesson on ${this.lessonContext.lessonName.replace(/-/g, ' ')}?`;
        this.addMessage('ai', welcomeText);
        
        const systemPrompt = `You are an expert medical tutor. The user is currently studying a lesson titled "${this.lessonContext.lessonName}". The full lesson content is: \n\n${this.lessonContext.lessonMd}\n\n The quiz and flashcard data is: \n\n${JSON.stringify(this.lessonContext.quizJson)}\n\n Your role is to answer the user's questions based ONLY on this provided context. Be clear, concise, and helpful. Do not invent information. If the answer is not in the context, say "That information is not covered in this lesson's material."`;
        this.chatHistory = [{ role: "system", parts: [{ text: systemPrompt }] }];
    }

    async sendMessage() {
        const userText = this.chatInput.value.trim();
        if (!userText || this.isLoading) return;

        this.addMessage('user', userText);
        this.chatHistory.push({ role: "user", parts: [{ text: userText }] });
        this.chatInput.value = '';
        this.isLoading = true;
        this.addMessage('loading');

        try {
            const aiResponse = await this.callGeminiAPI(this.chatHistory);
            this.removeLoadingMessage();
            this.addMessage('ai', aiResponse);
            this.chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
        } catch (error) {
            this.removeLoadingMessage();
            this.addMessage('error', 'An error occurred. Please check your API key and network connection.');
            console.error("Gemini API Error:", error);
        } finally {
            this.isLoading = false;
        }
    }

    async callGeminiAPI(history) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${this.apiKey}`;
        
        const apiHistory = history.filter(msg => msg.role !== 'system').map(msg => ({
            role: msg.role === 'ai' ? 'model' : msg.role,
            parts: msg.parts
        }));
        const systemInstruction = history.find(msg => msg.role === 'system');

        const payload = {
            contents: apiHistory,
            systemInstruction: systemInstruction,
            generationConfig: { temperature: 0.5, topP: 1, topK: 1 }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API Error: ${errorBody.error.message}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response structure from API.");
        }
    }

    addMessage(sender, text = '') {
        const messageEl = document.createElement('div');
        messageEl.classList.add('chat-message', sender);
        if (sender === 'loading') {
            messageEl.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        } else {
            messageEl.textContent = text;
        }
        this.chatMessages.appendChild(messageEl);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    removeLoadingMessage() {
        const loadingEl = this.chatMessages.querySelector('.loading');
        if (loadingEl) loadingEl.remove();
    }
}
