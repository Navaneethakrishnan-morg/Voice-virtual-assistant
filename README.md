# Voice Virtual Assistant with Eleven Labs

A web-based voice assistant that uses Eleven Labs API for text-to-speech functionality. This is a testing version that demonstrates voice recognition and conversation capabilities.

## Features

- Voice recognition using the Web Speech API
- Text-to-speech using Eleven Labs API (optional)
- Conversation history display
- API key management (optional)
- Voice selection from Eleven Labs voices (when API key is provided)
- Responsive design

## Important Note

This is a **testing version** designed to demonstrate the core functionality of a voice assistant. For full AI capabilities and natural voice synthesis, you will need to provide your own Eleven Labs API key.

## Prerequisites

- A modern web browser (Chrome recommended for speech recognition)
- An Eleven Labs API key (optional, get one from [Eleven Labs](https://elevenlabs.io/) for voice synthesis)

## Setup

1. Clone or download this repository
2. Open `index.html` in a web browser
3. (Optional) Enter your Eleven Labs API key in the settings section
4. Click "Save" to store your API key locally
5. (Optional) Select your preferred voice from the dropdown
6. Click "Start Listening" to begin using the assistant

## Usage

1. Click the "Start Listening" button to begin
2. Speak naturally when the status light turns green
3. The assistant will process your request and respond:
   - With voice synthesis if API key is provided
   - With simulated response timing if no API key is provided
4. Click "Stop" to end the listening session

## How It Works

1. **Speech Recognition**: Uses the browser's built-in Web Speech API to convert your voice to text
2. **AI Processing**: (Placeholder) In a full implementation, this would connect to an AI service like OpenAI
3. **Text-to-Speech**: Uses the Eleven Labs API to convert the response text to natural-sounding speech (when API key is provided)

## Files

- `index.html`: Main interface
- `styles.css`: Styling
- `script.js`: Main functionality
- `config.js`: Configuration settings
- `README.md`: This file

## Customization

You can customize the assistant by modifying:

- The AI response logic in `getAIResponse()` function
- The Eleven Labs API integration in `textToSpeech()` function
- The styling in `styles.css`
- Configuration settings in `config.js`

## Note

This is a frontend-only implementation for testing purposes. For a production application, you would want to:

1. Implement a backend service to securely handle API keys
2. Connect to a real AI service for intelligent responses
3. Implement the actual Eleven Labs API calls for text-to-speech

## API Integration

The application integrates with the Eleven Labs API for text-to-speech functionality (optional):

1. Voice selection using the Eleven Labs voices endpoint
2. Text-to-speech conversion using the Eleven Labs text-to-speech endpoint

Example Eleven Labs API call:
```javascript
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`, {
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'xi-api-key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5
    }
  })
});
```

## Browser Support

- Speech recognition works best in Chrome
- Other modern browsers may have limited support

## Security

- API keys are stored in the browser's localStorage
- For production use, API keys should be handled server-side

## License

This project is open source and available under the MIT License.

## Troubleshooting

1. **Speech recognition not working**: Make sure you're using Chrome and have granted microphone permissions
2. **Voice not playing**: Check that your speakers are working and not muted
3. **API errors**: Verify your Eleven Labs API key is correct and you have sufficient credits
4. **Voices not loading**: Ensure your API key is valid and you have an internet connection