/* ======================================================================= */
/* FILE: js/ai.js                                                          */
/* PURPOSE: Handles all logic for the AI Tutor feature.                    */
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
    }

    async sendMessage() {
        // Placeholder: Full API call logic would be here.
        // This confirms the UI is wired up correctly.
        alert("AI Tutor is connected and ready to be implemented.");
    }

    addMessage(sender, text = '') {
        const messageEl = document.createElement('div');
        messageEl.classList.add('chat-message', sender);
        messageEl.textContent = text;
        this.chatMessages.appendChild(messageEl);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}
