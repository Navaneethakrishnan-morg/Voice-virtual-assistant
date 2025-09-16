// Configuration file for Voice Virtual Assistant
const config = {
    // Default Eleven Labs settings
    defaultVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    defaultModelId: 'eleven_multilingual_v2',
    defaultVoiceSettings: {
        stability: 0.5,
        similarity_boost: 0.5
    },
    
    // Speech recognition settings
    speechRecognitionLang: 'en-US',
    
    // API endpoints
    elevenLabs: {
        baseUrl: 'https://api.elevenlabs.io/v1',
        endpoints: {
            voices: '/voices',
            textToSpeech: '/text-to-speech',
            speechToText: '/speech-to-text'
        }
    },
    
    // Local storage keys
    localStorageKeys: {
        apiKey: 'elevenLabsApiKey',
        voiceId: 'elevenLabsVoiceId'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
}