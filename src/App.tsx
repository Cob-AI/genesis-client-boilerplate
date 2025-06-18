import { useState, useEffect } from 'react';
import { GameView } from './components/GameView';
import { ApiKeyInput } from './components/ApiKeyInput';
import { MainMenu } from './components/MainMenu';
import { extractGameMetadata } from './utils/themeExtractor';
import { SaveGameService } from './services/saveGameService';
import './styles/main.css';

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isInGame, setIsInGame] = useState(false);
  const [loadedSaveData, setLoadedSaveData] = useState<any>(null);
  
  // Extract and apply theme on mount
  useEffect(() => {
    const metadata = extractGameMetadata();
    if (metadata?.theme) {
      const root = document.documentElement;
      Object.entries(metadata.theme).forEach(([key, value]) => {
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      });
      
      // Also update the page title
      if (metadata.title) {
        document.title = metadata.title;
      }
    }
  }, []);

  // Check for API key
  useEffect(() => {
    const key = sessionStorage.getItem('gemini-api-key');
    if (key) {
      setHasApiKey(true);
    }
  }, []);

  const handleApiKeySubmit = () => {
    setHasApiKey(true);
  };

  const handleNewGame = () => {
    setLoadedSaveData(null);
    setIsInGame(true);
  };

  const handleContinueGame = () => {
    const saveData = SaveGameService.loadGame();
    if (saveData) {
      setLoadedSaveData(saveData);
      setIsInGame(true);
    }
  };

  const handleExitGame = () => {
    setIsInGame(false);
    setLoadedSaveData(null);
  };

  if (isInGame) {
    return (
      <GameView
        initialSaveData={loadedSaveData}
        onExit={handleExitGame}
      />
    );
  }

  if (!hasApiKey) {
    return <ApiKeyInput onSubmit={handleApiKeySubmit} />;
  }

  return <MainMenu onNewGame={handleNewGame} onContinueGame={handleContinueGame} />;
}