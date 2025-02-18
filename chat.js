// Chat Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Enhanced Chat Initialization
function initializeChat() {
    chatMessages.innerHTML = '';
    const welcomeMessage = `👋 Welcome ${auth.currentUser.email}! I'm your AI assistant. How can I help you today?`;
    addBotMessage(welcomeMessage);
    
    // Start datetime updates
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Focus on input
    messageInput.focus();
}

// Enhanced Message Display Functions
function createMessageElement(isUser, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    // Add icon
    const icon = document.createElement('span');
    icon.innerHTML = isUser ? 
        '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>' :
        '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>';
    
    headerDiv.appendChild(icon);
    
    const timestamp = document.createElement('span');
    timestamp.textContent = `${isUser ? auth.currentUser.email : 'AI Assistant'} • ${formatTimestamp(new Date())}`;
    headerDiv.appendChild(timestamp);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    
    return messageDiv;
}

function addUserMessage(text) {
    const messageDiv = createMessageElement(true, text);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(text) {
    const messageDiv = createMessageElement(false, text);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Smooth Scroll Function
function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// Enhanced Send Message Function
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    try {
        // Disable input and update button state
        messageInput.disabled = true;
        sendButton.disabled = true;
        updateSendButtonState('sending');

        // Display user message
        addUserMessage(text);
        messageInput.value = '';

        // Call Groq API
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mixtral-8x7b-32768",
                messages: [{
                    role: "user",
                    content: text
                }],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        const botResponse = data.choices[0].message.content;
        addBotMessage(botResponse);

    } catch (error) {
        console.error('Error:', error);
        addBotMessage('Sorry, I encountered an error. Please try again.');
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        updateSendButtonState('default');
        messageInput.focus();
    }
}

// Enhanced Button State Management
function updateSendButtonState(state) {
    const buttonContent = {
        default: `
            <span>Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
        `,
        sending: `
            <span>Sending</span>
            <span class="typing-dots"></span>
        `
    };
    
    sendButton.innerHTML = buttonContent[state];
}

// Timestamp Formatting
function formatTimestamp(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Auto-resize Textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});

// Enhanced Event Listeners
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Error Handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo, '\nColumn:', columnNo, '\nError object:', error);
    addBotMessage('An error occurred. Please try refreshing the page.');
    return false;
};

// Initialize chat if user is already logged in
if (auth.currentUser) {
    initializeChat();
}