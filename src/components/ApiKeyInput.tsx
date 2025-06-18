import { useState } from 'react';
import { extractGameMetadata } from '../utils/themeExtractor';

interface ApiKeyInputProps {
  onSubmit: () => void;
}

export function ApiKeyInput({ onSubmit }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const metadata = extractGameMetadata();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey) {
      setError('Please enter a Gemini API key');
      return;
    }
    
    if (!trimmedKey.startsWith('AIza')) {
      setError('Invalid Gemini key format. Google API keys typically start with "AIza"');
      return;
    }
    
    sessionStorage.setItem('gemini-api-key', trimmedKey);
    onSubmit();
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center p-4 pt-6 sm:pt-8 pb-8">
      <main className="container mx-auto max-w-2xl w-full flex flex-col flex-grow">
        <div className="text-center flex flex-col justify-center flex-grow">
          <h1 className="font-display text-4xl sm:text-5xl text-accent mb-4">
            {metadata?.title || 'Genesis Engine'}
          </h1>
          
          <div className="bg-display-window p-6 rounded-lg shadow-xl mb-6">
            <h2 className="text-2xl text-accent mb-4">Getting Started</h2>
            
            <p className="text-primary mb-6">
              This game uses AI to create your unique story. You'll need a Gemini API key 
              for the story generation. Images are included free!
            </p>
            
            <div className="bg-button-secondary/30 p-4 rounded-md mb-6 text-left">
              <h3 className="text-lg font-semibold text-accent-secondary mb-2">
                Quick Setup (1 minute):
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-primary text-sm">
                <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-secondary underline">Google AI Studio</a></li>
                <li>Click "Get API key" → "Create API key"</li>
                <li>Copy the key and paste it below</li>
                <li>Start playing! (Free AI-generated images included)</li>
              </ol>
              
              <p className="mt-3 text-xs text-secondary">
                Your API key is only stored in this browser session.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="gemini-api-key-input" className="block text-accent-secondary text-sm mb-1 text-left">
                  Gemini API Key <span className="text-error">*</span>
                </label>
                <input
                  id="gemini-api-key-input"
                  name="gemini-api-key"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError('');
                  }}
                  placeholder="Paste your key here (AIza...)"
                  className="w-full px-4 py-3 bg-primary-dark text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent placeholder-secondary"
                />
              </div>
              
              {error && (
                <p className="text-error text-sm">{error}</p>
              )}
              
              <button
                type="submit"
                className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-primary-dark font-bold text-lg rounded-md transition-all duration-150 transform hover:scale-105"
              >
                Begin Your Story
              </button>
            </form>
            
            <p className="mt-4 text-xs text-secondary">
              <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="hover:text-accent underline">
                Gemini Free Tier: 15 requests/minute, 1,500 requests/day
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}