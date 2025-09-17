// Global variables
let recognition;
let isListening = false;
let apiKey = localStorage.getItem(config.localStorageKeys.apiKey) || '';
let elevenLabsVoiceId = localStorage.getItem(config.localStorageKeys.voiceId) || config.defaultVoiceId;
let audioContext;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusLight = document.getElementById('statusLight');
const statusText = document.getElementById('statusText');
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const conversationContainer = document.getElementById('conversation');
const voiceSelect = document.getElementById('voiceSelect');
const refreshVoicesBtn = document.getElementById('refreshVoices');
const themeToggle = document.getElementById('themeToggle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved API key if exists
    if (apiKey) {
        apiKeyInput.value = apiKey;
    }
    
    // Set voice selection
    voiceSelect.value = elevenLabsVoiceId;
    
    // Initialize dark mode
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = 'Toggle Light Mode';
    }
    
    // Check for browser support
    if (!('webkitSpeechRecognition' in window)) {
        updateStatus('Speech recognition not supported in this browser', 'error');
        startBtn.disabled = true;
    } else {
        // Initialize speech recognition
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = config.speechRecognitionLang;
        
        recognition.onstart = () => {
            isListening = true;
            updateStatus('Listening...', 'listening');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[event.resultIndex][0].transcript;
            handleUserInput(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            updateStatus(`Error: ${event.error}`, 'error');
            stopListening();
        };
        
        recognition.onend = () => {
            if (isListening) {
                // Continue listening
                recognition.start();
            } else {
                updateStatus('Ready', 'ready');
            }
        };
    }
    
    // Initialize audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Event listeners
    startBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    voiceSelect.addEventListener('change', saveVoiceSelection);
    refreshVoicesBtn.addEventListener('click', refreshVoices);
    themeToggle.addEventListener('click', toggleDarkMode);
    
    // Load available voices if API key exists
    if (apiKey) {
        loadVoices();
    }
});

// Update status indicator
function updateStatus(text, status) {
    statusText.textContent = text;
    statusLight.className = 'status-light';
    
    switch (status) {
        case 'listening':
            statusLight.classList.add('listening');
            break;
        case 'speaking':
            statusLight.classList.add('speaking');
            break;
        case 'error':
            statusLight.style.backgroundColor = '#f44336';
            break;
        default:
            // Ready state
            break;
    }
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    themeToggle.textContent = isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode';
}

// Start listening for user speech
function startListening() {
    // API key is now optional - we can still process text without it
    try {
        recognition.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (error) {
        console.error('Error starting speech recognition:', error);
        updateStatus('Error starting microphone', 'error');
    }
}

// Stop listening
function stopListening() {
    isListening = false;
    recognition.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateStatus('Ready', 'ready');
}

// Save API key
function saveApiKey() {
    apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem(config.localStorageKeys.apiKey, apiKey);
        updateStatus('API key saved', 'ready');
        
        // Load voices with the new API key
        loadVoices();
        
        setTimeout(() => {
            if (!isListening) {
                updateStatus('Ready', 'ready');
            }
        }, 2000);
    } else {
        // Allow empty API key
        localStorage.setItem(config.localStorageKeys.apiKey, '');
        updateStatus('API key cleared', 'ready');
        setTimeout(() => {
            if (!isListening) {
                updateStatus('Ready', 'ready');
            }
        }, 2000);
    }
}

// Save voice selection
function saveVoiceSelection() {
    elevenLabsVoiceId = voiceSelect.value;
    localStorage.setItem(config.localStorageKeys.voiceId, elevenLabsVoiceId);
    updateStatus('Voice updated', 'ready');
    setTimeout(() => {
        if (!isListening) {
            updateStatus('Ready', 'ready');
        }
    }, 2000);
}

// Refresh voices from Eleven Labs API
async function refreshVoices() {
    if (!apiKey) {
        updateStatus('Please enter your Eleven Labs API key first', 'error');
        return;
    }
    
    updateStatus('Loading voices...', 'speaking');
    await loadVoices();
    updateStatus('Voices loaded', 'ready');
    setTimeout(() => {
        if (!isListening) {
            updateStatus('Ready', 'ready');
        }
    }, 2000);
}

// Load voices from Eleven Labs API
async function loadVoices() {
    if (!apiKey) return;
    
    try {
        const response = await fetch(config.elevenLabs.baseUrl + config.elevenLabs.endpoints.voices, {
            headers: {
                'xi-api-key': apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Clear existing options
        voiceSelect.innerHTML = '';
        
        // Add voices to dropdown
        data.voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.voice_id;
            option.textContent = voice.name;
            if (voice.voice_id === elevenLabsVoiceId) {
                option.selected = true;
            }
            voiceSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading voices:', error);
        updateStatus('Failed to load voices', 'error');
        setTimeout(() => {
            if (!isListening) {
                updateStatus('Ready', 'ready');
            }
        }, 2000);
    }
}

// Handle user input
async function handleUserInput(text) {
    // Add user message to conversation
    addMessageToConversation('user', text);
    
    // Stop listening while processing
    stopListening();
    
    try {
        // Get response from AI (in a real implementation, you would connect to an AI service)
        const response = await getAIResponse(text);
        
        // Add assistant message to conversation
        addMessageToConversation('assistant', response);
        
        // Convert text to speech using Eleven Labs if API key is provided
        if (apiKey) {
            await textToSpeech(response);
        } else {
            // If no API key, simulate speech with a timeout
            updateStatus('Speaking...', 'speaking');
            // Simulate speaking time
            await new Promise(resolve => setTimeout(resolve, response.length * 50));
            updateStatus('Ready', 'ready');
        }
    } catch (error) {
        console.error('Error processing user input:', error);
        addMessageToConversation('assistant', 'Sorry, I encountered an error processing your request.');
        updateStatus('Error processing request', 'error');
        setTimeout(() => {
            if (!isListening) {
                updateStatus('Ready', 'ready');
            }
        }, 2000);
    }
}

// Simulate AI response (in a real implementation, you would connect to an AI service like OpenAI)
async function getAIResponse(userInput) {
    // This is a placeholder - in a real implementation, you would call an AI API
    const responses = [
        "I understand what you're saying. That's an interesting point.",
        "Thanks for sharing that with me. How can I help you further?",
        "I've noted your input. Is there anything specific you'd like to know?",
        "That's a great question. Let me think about how I can assist you with that.",
        "I appreciate you telling me that. What else would you like to discuss?",
        "I'm here to help. Could you tell me more about what you're looking for?",
        "That's fascinating. I'd be happy to assist you with that topic.",
        "I see. What would you like to know more about?"
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a random response
    return responses[Math.floor(Math.random() * responses.length)];
}

// Convert text to speech using Eleven Labs API
async function textToSpeech(text) {
    if (!apiKey) {
        console.error('API key not set');
        // We won't show an error status anymore since API key is optional
        return;
    }
    
    updateStatus('Speaking...', 'speaking');
    
    try {
        // Call Eleven Labs API
        const response = await fetch(
            `${config.elevenLabs.baseUrl}${config.elevenLabs.endpoints.textToSpeech}/${elevenLabsVoiceId}`, 
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    model_id: config.defaultModelId,
                    voice_settings: config.defaultVoiceSettings
                })
            }
        );
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        // Get audio data as blob
        const audioBlob = await response.blob();
        
        // Play the audio
        await playAudioBlob(audioBlob);
        
        updateStatus('Ready', 'ready');
    } catch (error) {
        console.error('Text to speech error:', error);
        updateStatus('Speech synthesis failed', 'error');
        setTimeout(() => {
            if (!isListening) {
                updateStatus('Ready', 'ready');
            }
        }, 2000);
    }
}

// Play audio blob
async function playAudioBlob(audioBlob) {
    try {
        // Create object URL for the blob
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create audio element
        const audio = new Audio(audioUrl);
        
        // Play the audio
        await audio.play();
        
        // Wait for audio to finish playing
        return new Promise((resolve) => {
            audio.addEventListener('ended', () => {
                // Clean up object URL
                URL.revokeObjectURL(audioUrl);
                resolve();
            });
            
            audio.addEventListener('error', () => {
                URL.revokeObjectURL(audioUrl);
                resolve();
            });
        });
    } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
    }
}

// Add message to conversation display
function addMessageToConversation(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'assistant-message');
    
    const messageHeader = document.createElement('div');
    messageHeader.classList.add('message-header');
    messageHeader.textContent = sender === 'user' ? 'You' : 'Assistant';
    
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = text;
    
    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(messageText);
    conversationContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
}