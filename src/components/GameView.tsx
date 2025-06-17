import { useState, useEffect } from 'react';
import { NARRATIVE_ENGINE_PROMPT } from '../config/engine';
import { PACING_THRESHOLD } from '../config/pacing';
import { DisplayWindow } from './DisplayWindow';
import { ChoiceButtons } from './ChoiceButtons';

// This is a MOCK API call for the boilerplate.
async function getNextTurnAPI(conversationHistory) {
  console.log("Mock API Call Sent. History length:", conversationHistory.length);
  const MOCK_START_GAME_RESPONSE = {
    "description": "The Genesis Engine is ready. The world awaits your first choice. This is a placeholder until a real AI is connected.",
    "imagePrompt": "A single glowing door standing in a misty, featureless void.",
    "choices": ["Begin the real adventure"], "sceneTitle": "The Threshold", "isSceneEnd": true,
    "worldState": { "status": "Initialized" },
    "playerState": { "name": "Protagonist", "visualDescription": "A person of indeterminate feature, waiting to be shaped by their choices.", "inventory": [], "skills": [], "reputation": "Unknown" }
  };
  await new Promise(resolve => setTimeout(resolve, 500));
  return JSON.stringify(MOCK_START_GAME_RESPONSE);
}

export function GameView() {
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [turnsInCurrentScene, setTurnsInCurrentScene] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    const startGame = async () => {
      if (!NARRATIVE_ENGINE_PROMPT) { setIsLoading(false); return; }
      const initialHistory = [{ role: 'system', content: NARRATIVE_ENGINE_PROMPT }];
      setConversationHistory(initialHistory);
      const responseJson = await getNextTurnAPI(initialHistory);
      const response = JSON.parse(responseJson);
      setGameState(response);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: responseJson }]);
      setIsLoading(false);
    };
    startGame();
  }, []);

  const handleChoice = async (choiceIndex) => {
    if (isLoading || !gameState?.choices) return;
    setIsLoading(true);

    let nextUserPrompt = `Player chose: "${gameState.choices[choiceIndex]}"`;

    if (turnsInCurrentScene >= PACING_THRESHOLD) {
      console.log(`PACING DIRECTIVE INJECTED! Threshold of ${PACING_THRESHOLD} was met.`);
      nextUserPrompt = `[URGENT PACING DIRECTIVE: The player has been in this scene for ${turnsInCurrentScene} turns. You MUST trigger 'isSceneEnd: true' in your next response.]\n${nextUserPrompt}`;
    }

    const newHistory = [...conversationHistory, { role: 'user', content: nextUserPrompt }];
    setConversationHistory(newHistory);

    const responseJson = await getNextTurnAPI(newHistory);
    const response = JSON.parse(responseJson);
    setGameState(response);

    if (response.isSceneEnd) { setTurnsInCurrentScene(0); } 
    else { setTurnsInCurrentScene(prev => prev + 1); }

    setConversationHistory(prev => [...prev, { role: 'assistant', content: responseJson }]);
    setIsLoading(false);
  };

  return (
    <div className="game-view">
        <DisplayWindow gameState={gameState} isLoading={isLoading} />
        <ChoiceButtons choices={gameState?.choices} onChoice={handleChoice} disabled={isLoading} />
        <div className="dev-mode-toggle">
            <label><input type="checkbox" checked={devMode} onChange={() => setDevMode(!devMode)} /> Dev Mode</label>
        </div>
        {devMode && gameState && (<pre className="dev-mode-output">{JSON.stringify(gameState, null, 2)}</pre>)}
    </div>
  );
}