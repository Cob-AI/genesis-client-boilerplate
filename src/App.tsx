import { useState, useEffect } from 'react';
import { GameView } from './components/GameView';
import { ApiKeyManager, getApiKey } from './components/ApiKeyManager';
import { NARRATIVE_ENGINE_PROMPT } from '../config/engine'; // We need to read the prompt to extract the theme
import './styles/main.css';

const SAVE_GAME_KEY = 'genesis-engine-manual-save';

// Helper function to extract the theme object from the larger prompt string
function getThemeFromPrompt(prompt) {
  try {
    // This looks for the specific line where the theme object is defined
    const themeLine = prompt.match(/The visual theme for the UI is defined by the following object: (\{.*\})/);
    if (themeLine && themeLine[1]) {
      // It's not a perfect JSON parser, but it's robust for this specific structure.
      // A more robust solution might use a dedicated parser if the structure gets more complex.
      // For now, we use a trick: wrap it in parentheses and let eval parse it safely.
      // This is safe because the string comes from our trusted AI generator.
      const themeObject = (0, eval)('(' + themeLine[1] + ')');
      return themeObject;
    }
  } catch (e) {
    console.error("Could not parse game theme from narrative prompt.", e);
  }
  return null; // Return null if not found or parsing fails
}

const GAME_THEME = getThemeFromPrompt(NARRATIVE_ENGINE_PROMPT);

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [saveData, setSaveData] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);

  // This effect applies the dynamic theme from the SCAP to the UI.
  useEffect(() => {
    if (GAME_THEME && typeof GAME_THEME === 'object') {
      const root = document.documentElement;
      for (const [key, value] of Object.entries(GAME_THEME)) {
        // Convert camelCase to kebab-case for CSS variables
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      }
    }
  }, []);

  // On initial load, check for API key and any existing save data.
  useEffect(() => {
    const key = getApiKey();
    if (key) {
      setHasApiKey(true);
    }
    const savedGame = localStorage.getItem(SAVE_GAME_KEY);
    if (savedGame) {
      setSaveData(JSON.parse(savedGame));
    }
  }, []);

  const handleKeyProvided = () => {
    setHasApiKey(true);
  };

  const startNewGame = () => {
    setActiveGame({ isNewGame: true, saveData: null });
  };

  const continueGame = () => {
    setActiveGame({ isNewGame: false, saveData: saveData });
  };

  const exitToMainMenu = () => {
      const savedGame = localStorage.getItem(SAVE_GAME_KEY);
      if (savedGame) {
        setSaveData(JSON.parse(savedGame));
      }
      setActiveGame(null);
  }

  // If a game session is active, render the GameView component.
  if (isGameActive) {
    return (
      <GameView
        key={Date.now()} // Force re-mount to ensure clean state
        initialSaveData={activeGame.saveData}
        onExit={exitToMainMenu}
      />
    );
  }

  // Otherwise, render the API key manager or the Main Menu.
  return (
    <div className="app-container">
      <header>
        {/* The Game's title will be rendered inside the GameView now */}
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
                {saveData.gameState?.actTitle || saveData.gameState?.sceneTitle || 'Saved Game'}
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