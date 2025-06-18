import { useState } from 'react';

const API_KEY_SESSION_STORAGE_KEY = 'gemini-api-key';

interface ApiKeyManagerProps {
  onKeyProvided: () => void;
}

export function ApiKeyManager({ onKeyProvided }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateApiKey = (key: string): boolean => {
    // Basic validation - Gemini API keys typically start with 'AIza'
    if (!key || key.length < 30) {
      setError('API key appears to be too short');
      return false;
    }
    
    if (!key.startsWith('AIza')) {
      setError('Invalid API key format. Gemini API keys typically start with "AIza"');
      return false;
    }
    
    return true;
  };

  const handleBeginStory = async () => {
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      setError('Please enter your API key');
      return;
    }
    
    if (!validateApiKey(trimmedKey)) {
      return;
    }
    
    setIsValidating(true);
    setError('');
    
    // Test the API key with a simple call
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(trimmedKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Quick test prompt
      const result = await model.generateContent("Say 'ok' if this API key works.");
      const response = result.response.text();
      
      if (!response) {
        throw new Error('No response from API');
      }
      
      // Key is valid, store it
      sessionStorage.setItem(API_KEY_SESSION_STORAGE_KEY, trimmedKey);
      onKeyProvided();
    } catch (e: any) {
      console.error('API key validation failed:', e);
      if (e.message?.includes('API_KEY_INVALID')) {
        setError('Invalid API key. Please check and try again.');
      } else if (e.message?.includes('RATE_LIMIT')) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        setError('Failed to validate API key. Please ensure it\'s correct and try again.');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBeginStory();
    }
  };

  return (
    <div className="api-key-manager">
      <div className="setup-box">
        <h2>Getting Started</h2>
        <p>
          This game uses AI to create your unique story. You'll need a Gemini API key 
          for the story generation. Images are included free!
        </p>
        
        <div className="quick-setup">
          <h4>Quick Setup (1 minute):</h4>
          <ol>
            <li>
              Go to <strong>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Google AI Studio
                </a>
              </strong>
            </li>
            <li>Click "Get API key" → "Create API key"</li>
            <li>Copy the key and paste it below</li>
            <li>Start playing! (Free AI-generated images included)</li>
          </ol>
          <p className="session-note">
            Your API key is only stored in this browser session and never sent anywhere except Google's AI service.
          </p>
        </div>
        
        <div className="api-key-input-container">
          <label htmlFor="apiKey">Gemini API Key *</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="Paste your key here (AIza...)"
            disabled={isValidating}
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <div className="input-error">{error}</div>
          )}
        </div>
        
        <button 
          className="begin-button" 
          onClick={handleBeginStory}
          disabled={isValidating}
        >
          {isValidating ? 'Validating...' : 'Begin Your Story'}
        </button>
        
        <p className="tier-note">
          <strong>Gemini Free Tier:</strong> 15 requests/minute, 1,500 requests/day
        </p>
      </div>
    </div>
  );
}

// Helper function to retrieve the API key
export function getApiKey(): string | null {
  try {
    return sessionStorage.getItem(API_KEY_SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to retrieve API key:', e);
    return null;
  }
}

// Helper function to clear the API key (useful for logout)
export function clearApiKey(): void {
  try {
    sessionStorage.removeItem(API_KEY_SESSION_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear API key:', e);
  }
}