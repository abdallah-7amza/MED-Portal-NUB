/**
 * AI Tutor Service for NUB Med Portal
 * Handles AI-powered learning assistance
 * 
 * Prepared by Abdallah Hamza
 */

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if on lesson page
    if (!document.getElementById('ai-tutor-btn')) return;
    
    const aiTutorBtn = document.getElementById('ai-tutor-btn');
    const aiChatContainer = document.getElementById('ai-chat-container');
    const aiCloseBtn = document.getElementById('ai-close-btn');
    const aiSendBtn = document.getElementById('ai-send-btn');
    const aiInput = document.getElementById('ai-input');
    const aiMessages = document.getElementById('ai-messages');
    
    // Toggle chat visibility
    aiTutorBtn.addEventListener('click', () => {
        aiChatContainer.style.display = 'block';
        aiInput.focus();
    });
    
    aiCloseBtn.addEventListener('click', () => {
        aiChatContainer.style.display = 'none';
    });
    
    // Handle message sending
    aiSendBtn.addEventListener('click', sendMessage);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Initial welcome message
    addMessage('ai', "Hello! I'm your AI medical tutor. How can I help you with this lesson?");
    
    async function sendMessage() {
        const message = aiInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage('user', message);
        aiInput.value = '';
        
        // Show loading indicator
        const loadingMsg = addMessage('ai', 'Thinking...', true);
        
        try {
            // Simulate AI response (in a real app, this would call an API)
            setTimeout(() => {
                const responses = [
                    "Based on medical guidelines, the recommended approach would be...",
                    "This concept is important because in clinical practice...",
                    "A common mistake students make with this topic is...",
                    "You might want to focus on these key points for your exams...",
                    "This relates to what we discussed earlier about..."
                ];
                
                // Replace loading with actual response
                loadingMsg.innerHTML = `<div class="message-content">${
                    responses[Math.floor(Math.random() * responses.length)]
                }</div>`;
            }, 1500);
        } catch (error) {
            loadingMsg.innerHTML = '<div class="message-content">Sorry, I encountered an error. Please try again.</div>';
            console.error('AI Tutor Error:', error);
        }
    }
    
    function addMessage(sender, text, isThinking = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        
        if (isThinking) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${text}
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
        }
        
        aiMessages.appendChild(messageDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;
        return messageDiv;
    }
});
