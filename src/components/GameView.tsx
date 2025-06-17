import { useState, useEffect } from 'react';
import { NARRATIVE_ENGINE_PROMPT } from '../config/engine';
import { PACING_THRESHOLD } from '../config/pacing';
import { getApiKey } from './ApiKeyManager';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DisplayWindow } from './DisplayWindow';
import { ChoiceButtons } from './ChoiceButtons';
import type { GameState, ConversationMessage, GameViewProps } from '../types';

const SAVE_GAME_KEY = 'genesis-engine-manual-save';

async function getNextTurnAPI(conversationHistory: ConversationMessage[]): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return JSON.stringify({ 
      description: "CRITICAL ERROR: API Key missing. Please return to the main menu and provide your API key.", 
      choices: [] 
    });
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    
    const chat = model.startChat({ 
      history: conversationHistory.slice(0, -1).map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        parts: [{ text: msg.content }]
      }))
    });
    
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  } catch (error: any) {
    console.error("API Error:", error);
    return JSON.stringify({ 
      description: `Error: AI Communication Failed. ${error.message || 'Unknown error occurred'}`, 
      choices: ["Try Again", "Return to Main Menu"] 
    });
  }
}

export function GameView({ initialSaveData, onExit }: GameViewProps) {
  const [gameState, setGameState] = useState<GameState | null>(initialSaveData?.gameState || null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(
    initialSaveData?.history || []
  );
  const [isLoading, setIsLoading] = useState(!initialSaveData);
  const [turnsInCurrentScene, setTurnsInCurrentScene] = useState(0);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start a new game if no save data was provided
  useEffect(() => {
    const startGame = async () => {
      if (initialSaveData) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const initialHistory: ConversationMessage[] = [
          { role: 'system', content: NARRATIVE_ENGINE_PROMPT }
        ];
        const firstUserMessage: ConversationMessage = { 
          role: 'user', 
          content: 'Begin the adventure.' 
        };
        const fullHistory = [...initialHistory, firstUserMessage];
        
        const responseJson = await getNextTurnAPI(fullHistory);
        const response = JSON.parse(responseJson);
        
        setGameState(response);
        setConversationHistory([
          ...fullHistory, 
          { role: 'assistant', content: responseJson }
        ]);
      } catch (e: any) {
        console.error("Failed to start game:", e);
        setError("Failed to start the game. Please check your API key and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    startGame();
  }, [initialSaveData]);
  
  const handleSave = () => {
    if (!gameState) return;
    
    try {
      const saveData = { 
        gameState, 
        history: conversationHistory, 
        lastSaved: new Date().toISOString() 
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveData));
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);
    } catch (e) {
      console.error("Failed to save game:", e);
      alert("Failed to save game. Your browser may not support local storage.");
    }
  };

  const handleChoice = async (choiceIndex: number) => {
    if (isLoading || !gameState?.choices || choiceIndex >= gameState.choices.length) return;
    
    // Handle special error recovery choices
    if (error && choiceIndex === 1) {
      onExit();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let nextUserPrompt = `Player chose: "${gameState.choices[choiceIndex]}"`;
      
      // Add pacing directive if needed
      if (turnsInCurrentScene >= PACING_THRESHOLD) {
        nextUserPrompt = `[URGENT PACING DIRECTIVE: The current scene has lasted ${turnsInCurrentScene} turns. Please progress the story to a new scene or situation immediately.]\n${nextUserPrompt}`;
      }
      
      const newUserMessage: ConversationMessage = { 
        role: 'user', 
        content: nextUserPrompt 
      };
      const newHistory = [...conversationHistory, newUserMessage];
      const responseJson = await getNextTurnAPI(newHistory);
      const response = JSON.parse(responseJson);
      
      setGameState(response);
      setConversationHistory([
        ...newHistory, 
        { role: 'assistant', content: responseJson }
      ]);
      
      // Update turn counter
      if (response.isSceneEnd) {
        setTurnsInCurrentScene(0);
      } else {
        setTurnsInCurrentScene(prev => prev + 1);
      }
      
      // Clear save on game over
      if (response.isGameWon || response.isPlayerDefeated) {
        localStorage.removeItem(SAVE_GAME_KEY);
      }
    } catch (e: any) {
      console.error("Failed to process choice:", e);
      setError("Failed to process your choice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-view">
      <button onClick={onExit} className="exit-button">← Main Menu</button>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      <DisplayWindow gameState={gameState} isLoading={isLoading} />
      <ChoiceButtons 
        choices={gameState?.choices} 
        onChoice={handleChoice} 
        disabled={isLoading} 
      />
      
      <footer className="game-footer">
        <div className="game-info">
          {gameState?.actTitle && `${gameState.actTitle} • `}
          {gameState?.sceneTitle}
        </div>
        <div className="save-container">
          {showSaveMessage && <div className="save-notification">Saved!</div>}
          <button onClick={handleSave} className="save-button" title="Save Progress">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </footer>

      <div className="dev-mode-toggle">
        <label>
          <input 
            type="checkbox" 
            checked={devMode} 
            onChange={() => setDevMode(!devMode)} 
          /> Dev Mode
        </label>
      </div>
      
      {devMode && gameState && (
        <pre className="dev-mode-output">
          {JSON.stringify(gameState, null, 2)}
        </pre>
      )}
    </div>
  );
}