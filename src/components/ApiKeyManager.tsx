import { useState } from 'react';

// This is the key we'll use to save/retrieve the API key from session storage.
const API_KEY_SESSION_STORAGE_KEY = 'gemini-api-key';

export function ApiKeyManager({ onKeyProvided }) {
  const [apiKey, setApiKey] = useState('');

  const handleBeginStory = () => {
    if (apiKey.trim()) {
      sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, apiKey);
      onKeyProvided();
    }
  };

  return (
    <div className="api-key-manager">
      <div className="setup-box">
        <h2>Getting Started</h2>
        <p>This game uses AI to create your unique story. You'll need a Gemini API key for the story generation. Images are included free!</p>
        <div className="quick-setup">
          <h4>Quick Setup (1 minute):</h4>
          <ol>
            <li>Go to <strong><a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio</a></strong></li>
            <li>Click "Get API key" → "Create API key"</li>
            <li>Copy the key and paste it below</li>
            <li>Start playing! (Free AI-generated images included)</li>
          </ol>
          <p className="session-note">Your API key is only stored in this browser session.</p>
        </div>
        <div className="api-key-input-container">
            <label htmlFor="apiKey">Gemini API Key *</label>
            <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your key here (Alza...)"
            />
        </div>
        <button className="begin-button" onClick={handleBeginStory}>
          Begin Your Story
        </button>
        <p className="tier-note">Gemini: Free tier includes 10 requests/minute, 500/day</p>
      </div>
    </div>
  );
}

// Helper function to be used by other parts of the app
export function getApiKey() {
  return sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY);
}