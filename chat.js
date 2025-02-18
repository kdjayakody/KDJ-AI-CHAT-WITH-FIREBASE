// Chat Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Initialize Chat
function initializeChat() {
    chatMessages.innerHTML = '';
    addBotMessage('Hello! How can I assist you today?');
}

// Message Display Functions
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send Message Function
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // Disable input and button while processing
    messageInput.disabled = true;
    sendButton.disabled = true;

    // Display user message
    addUserMessage(text);
    messageInput.value = '';

    try {
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

        // Save chat history to Firestore
        const user = auth.currentUser;
        if (user) {
            await db.collection('chats').add({
                userId: user.uid,
                userMessage: text,
                botResponse: botResponse,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        addBotMessage('Sorry, I encountered an error. Please try again.');
        console.error('Error:', error);
    }

// Re-enable input and button
 messageInput.disabled = false;
 sendButton.disabled = false;
}

// Time Formatting Function
function formatUTCDateTime() {
 const now = new Date();
 return now.getUTCFullYear() + '-' + 
        String(now.getUTCMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getUTCDate()).padStart(2, '0') + ' ' + 
        String(now.getUTCHours()).padStart(2, '0') + ':' + 
        String(now.getUTCMinutes()).padStart(2, '0') + ':' + 
        String(now.getUTCSeconds()).padStart(2, '0');
}

// Update DateTime Display
function updateDateTime() {
 const dateTimeElement = document.getElementById('currentDateTime');
 dateTimeElement.textContent = formatUTCDateTime();
}

// Message Timestamp Function
function getMessageTimestamp() {
 return `[${formatUTCDateTime()}]`;
}

// Enhanced Message Display Functions with Timestamps and User Info
function addUserMessage(text) {
 const messageDiv = document.createElement('div');
 messageDiv.className = 'message user-message fade-in';
 
 const headerDiv = document.createElement('div');
 headerDiv.className = 'message-header text-xs text-gray-500 mb-1';
 headerDiv.textContent = `${auth.currentUser.email} ${getMessageTimestamp()}`;
 
 const contentDiv = document.createElement('div');
 contentDiv.className = 'message-content';
 contentDiv.textContent = text;
 
 messageDiv.appendChild(headerDiv);
 messageDiv.appendChild(contentDiv);
 chatMessages.appendChild(messageDiv);
 chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
 const messageDiv = document.createElement('div');
 messageDiv.className = 'message bot-message fade-in';
 
 const headerDiv = document.createElement('div');
 headerDiv.className = 'message-header text-xs text-gray-500 mb-1';
 headerDiv.textContent = `AI Assistant ${getMessageTimestamp()}`;
 
 const contentDiv = document.createElement('div');
 contentDiv.className = 'message-content';
 contentDiv.textContent = text;
 
 messageDiv.appendChild(headerDiv);
 messageDiv.appendChild(contentDiv);
 chatMessages.appendChild(messageDiv);
 chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize Chat with User Info
function initializeChat() {
 chatMessages.innerHTML = '';
 const welcomeMessage = `Welcome ${auth.currentUser.email}! How can I assist you today?`;
 addBotMessage(welcomeMessage);
 
 // Start datetime updates
 updateDateTime();
 setInterval(updateDateTime, 1000);
 
 // Load chat history
 loadChatHistory();
}

// Load Chat History
async function loadChatHistory() {
 try {
     const user = auth.currentUser;
     if (!user) return;

     const chatHistory = await db.collection('chats')
         .where('userId', '==', user.uid)
         .orderBy('timestamp', 'desc')
         .limit(50)
         .get();

     const messages = [];
     chatHistory.forEach(doc => {
         messages.unshift(doc.data());
     });

     messages.forEach(msg => {
         if (msg.userMessage) {
             addUserMessage(msg.userMessage);
         }
         if (msg.botResponse) {
             addBotMessage(msg.botResponse);
         }
     });
 } catch (error) {
     console.error('Error loading chat history:', error);
     addBotMessage('Unable to load chat history. Please refresh the page.');
 }
}

// Event Listeners
messageInput.addEventListener('keypress', (e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
     e.preventDefault();
     sendMessage();
 }
});

// Typing Indicator
let typingTimer;
messageInput.addEventListener('input', () => {
 clearTimeout(typingTimer);
 sendButton.innerHTML = `
     <span>Typing</span>
     <span class="typing-dots">...</span>
 `;
 
 typingTimer = setTimeout(() => {
     sendButton.innerHTML = `
         <span>Send</span>
         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
         </svg>
     `;
 }, 1000);
});

// Add these styles to your CSS file
const additionalStyles = `
 .typing-dots {
     animation: typingDots 1.5s infinite;
 }
 
 @keyframes typingDots {
     0%, 20% { content: '.'; }
     40% { content: '..'; }
     60% { content: '...'; }
     80%, 100% { content: ''; }
 }
 
 .message-header {
     font-family: monospace;
 }
`;

// Create and append the styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Error Handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
 console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
 addBotMessage('An error occurred. Please try refreshing the page.');
 return false;
};

// Ensure chat is initialized when the page loads
if (auth.currentUser) {
 initializeChat();
}