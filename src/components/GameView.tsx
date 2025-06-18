import { useState, useEffect, useRef } from 'react';
import { NARRATIVE_ENGINE_PROMPT } from '../config/engine';
import { PACING_THRESHOLD } from '../config/pacing';
import { getNextTurn } from '../services/geminiService';
import { SaveGameService } from '../services/saveGameService';
import { extractGameMetadata } from '../utils/themeExtractor';
import { StoryDisplay } from './StoryDisplay';
import { ChoiceButton } from './ChoiceButton';
import { DeveloperFooter } from './DeveloperFooter';
import { FeedbackButton } from './FeedbackButton';
import type { GameState, SaveData } from '../types';

interface GameViewProps {
  initialSaveData: SaveData | null;
  onExit: () => void;
}

export function GameView({ initialSaveData, onExit }: GameViewProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [turnsInCurrentScene, setTurnsInCurrentScene] = useState(0);
  const [totalChoices, setTotalChoices] = useState(0);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const metadata = extractGameMetadata();
  const saveConfirmationTimer = useRef<number | null>(null);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      if (initialSaveData) {
        // Load from save
        setGameState(initialSaveData.gameState);
        setConversationHistory(initialSaveData.conversationHistory);
        setTurnsInCurrentScene(initialSaveData.turnsInCurrentScene || 0);
        setTotalChoices(initialSaveData.totalChoices || 0);
      } else {
        // Start new game
        await startNewGame();
      }
    };
    initGame();
  }, []);

  const startNewGame = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const initialHistory = [{ role: 'system', content: NARRATIVE_ENGINE_PROMPT }];
      const result = await getNextTurn(initialHistory, 'Begin the adventure.', 0);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.gameState) {
        setGameState(result.gameState);
        setConversationHistory(result.conversationHistory);
      }
    } catch (e) {
      setError('Failed to start the game. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoice = async (choiceText: string) => {
    if (!gameState || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setTotalChoices(prev => prev + 1);
    
    try {
      const result = await getNextTurn(
        conversationHistory,
        choiceText,
        turnsInCurrentScene >= PACING_THRESHOLD ? turnsInCurrentScene : 0
      );
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.gameState) {
        setGameState(result.gameState);
        setConversationHistory(result.conversationHistory);
        
        // Update turn counter
        if (result.gameState.isSceneEnd) {
          setTurnsInCurrentScene(0);
        } else {
          setTurnsInCurrentScene(prev => prev + 1);
        }
        
        // Clear save on game end
        if (result.gameState.isGameWon || result.gameState.isPlayerDefeated) {
          SaveGameService.deleteSave();
        }
      }
    } catch (e) {
      setError('Failed to process your choice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!gameState) return;
    
    const saved = SaveGameService.saveGame({
      gameState,
      conversationHistory,
      turnsInCurrentScene,
      totalChoices,
      sessionStartTime: Date.now()
    });
    
    if (saved) {
      setShowSaveConfirmation(true);
      
      if (saveConfirmationTimer.current) {
        clearTimeout(saveConfirmationTimer.current);
      }
      
      saveConfirmationTimer.current = window.setTimeout(() => {
        setShowSaveConfirmation(false);
      }, 3000);
    }
  };

  const chapterInfo = gameState ? 
    `${gameState.actTitle || 'Chapter 1'} • ${gameState.sceneTitle || 'Beginning'}` : 
    '';

  return (
    <div className="min-h-screen bg-primary text-primary flex flex-col items-center p-4 pt-6 sm:pt-8 pb-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
      
      <main className="container mx-auto max-w-2xl w-full flex flex-col flex-grow pb-8">
        <button 
          onClick={onExit} 
          className="mb-4 text-secondary hover:text-accent transition-colors"
        >
          ← Main Menu
        </button>
        
        {error && (
          <div className="bg-error/20 border border-error rounded-lg p-4 mb-4 text-error">
            {error}
          </div>
        )}
        
        <StoryDisplay
          description={gameState?.description || ''}
          imageUrl={gameState?.imagePrompt ? 
            `https://image.pollinations.ai/prompt/${encodeURIComponent(gameState.imagePrompt)}?width=1024&height=1024&nologo=true` : 
            null
          }
          isLoadingImage={false}
          sceneTitle={gameState?.sceneTitle || ''}
        />
        
        {gameState && !gameState.isGameWon && !gameState.isPlayerDefeated && (
          <div className="mt-2 flex flex-col gap-1">
            {gameState.choices?.map((choice: any, index: number) => (
              <ChoiceButton
                key={choice.id || index}
                choice={{ id: choice.id || `choice-${index}`, text: choice.text || choice }}
                onClick={handleChoice}
                disabled={isLoading}
              />
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="text-center text-secondary mt-4">
            <p>The story continues...</p>
          </div>
        )}
        
        {(gameState?.isGameWon || gameState?.isPlayerDefeated) && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl text-accent mb-4">
              {gameState.isGameWon ? '🎉 Victory!' : '💀 Defeated'}
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-primary-dark font-bold text-lg rounded-md transition-all duration-150"
            >
              Play Again
            </button>
            <p className="text-secondary text-sm mt-2">
              You made {totalChoices} choices in this story
            </p>
          </div>
        )}
        
        <DeveloperFooter
          currentActTitle={gameState?.actTitle || 'Chapter 1'}
          currentSceneTitle={gameState?.sceneTitle || 'Beginning'}
          onSaveClick={handleSave}
          showSaveConfirmation={showSaveConfirmation}
        />
      </main>
      
      <footer className="w-full max-w-2xl mx-auto text-center px-4 mt-4 pb-4">
        <p className="text-xs text-secondary">
          {metadata?.disclaimer || 'This is an unofficial fan project.'}
        </p>
      </footer>
      
      {gameState && !isLoading && (
        <FeedbackButton
          currentScene={gameState.sceneTitle || ''}
          currentAct={gameState.actTitle || ''}
        />
      )}
    </div>
  );
}