import { useState, useEffect, useCallback } from 'react';
import { NARRATIVE_ENGINE_PROMPT } from '../config/engine';
import { PACING_THRESHOLD } from '../config/pacing';
import { getApiKey } from './ApiKeyManager';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DisplayWindow } from './DisplayWindow';
import { ChoiceButtons } from './ChoiceButtons';

const SAVE_GAME_KEY = 'genesis-engine-manual-save';

// The getNextTurnAPI function remains the same as our previous secure version
async function getNextTurnAPI(conversationHistory) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return JSON.stringify({ description: "CRITICAL ERROR: API Key missing.", choices: [] });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    try {
      const chat = model.startChat({ history: conversationHistory.slice(0, -1) });
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    } catch (error) {
      return JSON.stringify({ description: `Error: AI Communication Failed. Details: ${error.message}`, choices: [] });
    }
}

export function GameView({ initialSaveData, onExit }) {
  const [gameState, setGameState] = useState(initialSaveData?.gameState || null);
  const [conversationHistory, setConversationHistory] = useState(initialSaveData?.history || []);
  const [isLoading, setIsLoading] = useState(!initialSaveData);
  const [turnsInCurrentScene, setTurnsInCurrentScene] = useState(0);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // This effect starts a new game if no save data was passed in.
  useEffect(() => {
    const startGame = async () => {
      if (initialSaveData) return;
      setIsLoading(true);
      const initialSysHistory = [{ role: 'system', content: NARRATIVE_ENGINE_PROMPT }];
      const firstUserMessage = { role: 'user', content: 'Begin the adventure.' };
      const fullHistory = [...initialSysHistory, firstUserMessage];
      const responseJson = await getNextTurnAPI(fullHistory);
      try {
        const response = JSON.parse(responseJson);
        setGameState(response);
        setConversationHistory(fullHistory.concat({ role: 'assistant', content: responseJson }));
      } catch (e) { console.error("Failed to parse initial AI response:", e); }
      setIsLoading(false);
    };
    startGame();
  }, [initialSaveData]);
  
  const handleSave = () => {
      if (!gameState) return;
      const saveData = { 
          gameState, 
          history: conversationHistory, 
          lastSaved: new Date().toISOString() 
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveData));
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000); // Hide message after 2s
  };

  const handleChoice = async (choiceIndex) => {
    if (isLoading || !gameState?.choices) return;
    setIsLoading(true);
    let nextUserPrompt = `Player chose: "${gameState.choices[choiceIndex]}"`;
    if (turnsInCurrentScene >= PACING_THRESHOLD) {
      nextUserPrompt = `[URGENT PACING DIRECTIVE...]\n${nextUserPrompt}`;
    }
    const newUserMessage = { role: 'user', content: nextUserPrompt };
    const newHistory = [...conversationHistory, newUserMessage];
    const responseJson = await getNextTurnAPI(newHistory);
    try {
      const response = JSON.parse(responseJson);
      setGameState(response);
      setConversationHistory(newHistory.concat({ role: 'assistant', content: responseJson }));
      if (response.isSceneEnd) { setTurnsInCurrentScene(0); } 
      else { setTurnsInCurrentScene(prev => prev + 1); }
      if (response.isGameWon || response.isPlayerDefeated) {
        localStorage.removeItem(SAVE_GAME_KEY); // Clear save on game over
      }
    } catch(e) { console.error("Failed to parse AI response:", e); }
    setIsLoading(false);
  };

  return (
    <div className="game-view">
        <button onClick={onExit} className="exit-button">← Main Menu</button>
        <DisplayWindow gameState={gameState} isLoading={isLoading} />
        <ChoiceButtons choices={gameState?.choices} onChoice={handleChoice} disabled={isLoading} />
        
        <footer className="game-footer">
            <div className="game-info">
                {gameState?.actTitle && `${gameState.actTitle} • `}{gameState?.sceneTitle}
            </div>
            <div className="save-container">
                 {showSaveMessage && <div className="save-notification">Saved!</div>}
                <button onClick={handleSave} className="save-button" title="Save Progress">
                    {/* This is a simple SVG for the save icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </footer>

        <div className="dev-mode-toggle">
            <label><input type="checkbox" checked={devMode} onChange={() => setDevMode(!devMode)} /> Dev Mode</label>
        </div>
        {devMode && gameState && (<pre className="dev-mode-output">{JSON.stringify(gameState, null, 2)}</pre>)}
    </div>
  );
}import { useState, useEffect, useCallback } from 'react';
import { NARRATIVE_ENGINE_PROMPT } from '../config/engine';
import { PACING_THRESHOLD } from '../config/pacing';
import { getApiKey } from './ApiKeyManager';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DisplayWindow } from './DisplayWindow';
import { ChoiceButtons } from './ChoiceButtons';

const SAVE_GAME_KEY = 'genesis-engine-manual-save';

// The getNextTurnAPI function remains the same as our previous secure version
async function getNextTurnAPI(conversationHistory) {
    const apiKey = getApiKey();
    if (!apiKey) {
      return JSON.stringify({ description: "CRITICAL ERROR: API Key missing.", choices: [] });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    try {
      const chat = model.startChat({ history: conversationHistory.slice(0, -1) });
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    } catch (error) {
      return JSON.stringify({ description: `Error: AI Communication Failed. Details: ${error.message}`, choices: [] });
    }
}

export function GameView({ initialSaveData, onExit }) {
  const [gameState, setGameState] = useState(initialSaveData?.gameState || null);
  const [conversationHistory, setConversationHistory] = useState(initialSaveData?.history || []);
  const [isLoading, setIsLoading] = useState(!initialSaveData);
  const [turnsInCurrentScene, setTurnsInCurrentScene] = useState(0);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // This effect starts a new game if no save data was passed in.
  useEffect(() => {
    const startGame = async () => {
      if (initialSaveData) return;
      setIsLoading(true);
      const initialSysHistory = [{ role: 'system', content: NARRATIVE_ENGINE_PROMPT }];
      const firstUserMessage = { role: 'user', content: 'Begin the adventure.' };
      const fullHistory = [...initialSysHistory, firstUserMessage];
      const responseJson = await getNextTurnAPI(fullHistory);
      try {
        const response = JSON.parse(responseJson);
        setGameState(response);
        setConversationHistory(fullHistory.concat({ role: 'assistant', content: responseJson }));
      } catch (e) { console.error("Failed to parse initial AI response:", e); }
      setIsLoading(false);
    };
    startGame();
  }, [initialSaveData]);
  
  const handleSave = () => {
      if (!gameState) return;
      const saveData = { 
          gameState, 
          history: conversationHistory, 
          lastSaved: new Date().toISOString() 
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveData));
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000); // Hide message after 2s
  };

  const handleChoice = async (choiceIndex) => {
    if (isLoading || !gameState?.choices) return;
    setIsLoading(true);
    let nextUserPrompt = `Player chose: "${gameState.choices[choiceIndex]}"`;
    if (turnsInCurrentScene >= PACING_THRESHOLD) {
      nextUserPrompt = `[URGENT PACING DIRECTIVE...]\n${nextUserPrompt}`;
    }
    const newUserMessage = { role: 'user', content: nextUserPrompt };
    const newHistory = [...conversationHistory, newUserMessage];
    const responseJson = await getNextTurnAPI(newHistory);
    try {
      const response = JSON.parse(responseJson);
      setGameState(response);
      setConversationHistory(newHistory.concat({ role: 'assistant', content: responseJson }));
      if (response.isSceneEnd) { setTurnsInCurrentScene(0); } 
      else { setTurnsInCurrentScene(prev => prev + 1); }
      if (response.isGameWon || response.isPlayerDefeated) {
        localStorage.removeItem(SAVE_GAME_KEY); // Clear save on game over
      }
    } catch(e) { console.error("Failed to parse AI response:", e); }
    setIsLoading(false);
  };

  return (
    <div className="game-view">
        <button onClick={onExit} className="exit-button">← Main Menu</button>
        <DisplayWindow gameState={gameState} isLoading={isLoading} />
        <ChoiceButtons choices={gameState?.choices} onChoice={handleChoice} disabled={isLoading} />
        
        <footer className="game-footer">
            <div className="game-info">
                {gameState?.actTitle && `${gameState.actTitle} • `}{gameState?.sceneTitle}
            </div>
            <div className="save-container">
                 {showSaveMessage && <div className="save-notification">Saved!</div>}
                <button onClick={handleSave} className="save-button" title="Save Progress">
                    {/* This is a simple SVG for the save icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </footer>

        <div className="dev-mode-toggle">
            <label><input type="checkbox" checked={devMode} onChange={() => setDevMode(!devMode)} /> Dev Mode</label>
        </div>
        {devMode && gameState && (<pre className="dev-mode-output">{JSON.stringify(gameState, null, 2)}</pre>)}
    </div>
  );
}