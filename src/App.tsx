import { useState, useEffect } from 'react';
import { GameView } from './components/GameView';
import { ApiKeyManager, getApiKey } from './components/ApiKeyManager';
import { NARRATIVE_ENGINE_PROMPT } from './config/engine';
import './styles/main.css';

const SAVE_GAME_KEY = 'genesis-engine-manual-save';

// Safer theme extraction without eval
function getThemeFromPrompt(prompt: string) {
  try {
    const themeMatch = prompt.match(/The visual theme for the UI is defined by the following object: (\{[^}]+\})/);
    if (themeMatch && themeMatch[1]) {
      // Parse the theme object manually to avoid eval
      const themeStr = themeMatch[1];
      const theme: Record<string, string> = {};
      
      // Extract key-value pairs from the object string
      const pairs = themeStr.match(/(\w+):\s*['"]([^'"]+)['"]/g);
      if (pairs) {
        pairs.forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim().replace(/['"]/g, ''));
          theme[key] = value;
        });
      }
      return theme;
    }
  } catch (e) {
    console.error("Could not parse game theme from narrative prompt:", e);
  }
  return null;
}

const GAME_THEME = getThemeFromPrompt(NARRATIVE_ENGINE_PROMPT);

interface SaveData {
  gameState: any;
  history: any[];
  lastSaved: string;
}

interface ActiveGame {
  isNewGame: boolean;
  saveData: SaveData | null;
}

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);

  // Apply dynamic theme
  useEffect(() => {
    if (GAME_THEME && typeof GAME_THEME === 'object') {
      const root = document.documentElement;
      Object.entries(GAME_THEME).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS variables
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      });
    }
  }, []);

  // Check for API key and save data on load
  useEffect(() => {
    const key = getApiKey();
    if (key) {
      setHasApiKey(true);
    }
    
    try {
      const savedGame = localStorage.getItem(SAVE_GAME_KEY);
      if (savedGame) {
        const parsed = JSON.parse(savedGame);
        // Validate save data structure
        if (parsed && parsed.gameState && parsed.history && parsed.lastSaved) {
          setSaveData(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load save data:", e);
    }
  }, []);

  const handleKeyProvided = () => {
    setHasApiKey(true);
  };

  const startNewGame = () => {
    setActiveGame({ isNewGame: true, saveData: null });
  };

  const continueGame = () => {
    if (saveData) {
      setActiveGame({ isNewGame: false, saveData });
    }
  };

  const exitToMainMenu = () => {
    try {
      const savedGame = localStorage.getItem(SAVE_GAME_KEY);
      if (savedGame) {
        const parsed = JSON.parse(savedGame);
        if (parsed && parsed.gameState && parsed.history && parsed.lastSaved) {
          setSaveData(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to reload save data:", e);
    }
    setActiveGame(null);
  };

  // If a game session is active, render the GameView
  if (activeGame) {
    return (
      <GameView
        key={Date.now()} // Force re-mount to ensure clean state
        initialSaveData={activeGame.saveData}
        onExit={exitToMainMenu}
      />
    );
  }

  // Otherwise, render the API key manager or Main Menu
  return (
    <div className="app-container">
      <header>
        <h1>Genesis Engine</h1>
      </header>
      <main>
        {!hasApiKey ? (
          <ApiKeyManager onKeyProvided={handleKeyProvided} />
        ) : (
          <div className="main-menu">
            <h2>Main Menu</h2>
            <p>Welcome. Your adventure awaits.</p>
            <div className="menu-buttons">
              <button className="begin-button" onClick={startNewGame}>
                New Game
              </button>
              {saveData && (
                <button className="continue-button" onClick={continueGame}>
                  Continue Game
                </button>
              )}
            </div>
            {saveData && (
              <div className="save-info">
                {saveData.gameState?.sceneTitle || 'Saved Game'}
                <br/>
                <small>Saved: {new Date(saveData.lastSaved).toLocaleString()}</small>
              </div>
            )}
          </div>
        )}
      </main>
      <footer>
        <p>This application is powered by the Genesis Engine. The generated game is a non-profit fan project.</p>
      </footer>
    </div>
  );
}

export default App;