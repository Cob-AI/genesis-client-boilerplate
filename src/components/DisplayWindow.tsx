import { useState, useEffect } from 'react';

interface GameState {
  imagePrompt?: string;
  sceneTitle?: string;
  description?: string;
  choices?: string[];
  isSceneEnd?: boolean;
  isGameWon?: boolean;
  isPlayerDefeated?: boolean;
  worldState?: any;
  playerState?: any;
}

interface DisplayWindowProps {
  gameState: GameState | null;
  isLoading: boolean;
}

export function DisplayWindow({ gameState, isLoading }: DisplayWindowProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Reset image states when gameState changes
  useEffect(() => {
    if (gameState?.imagePrompt) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [gameState?.imagePrompt]);
  
  if (isLoading && !gameState) {
    return (
      <div className="display-window">
        <div className="loading-state">
          <p>The Genesis Engine is conjuring a world...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="display-window">
        <div className="error-state">
          <p>Error: Game state is missing.</p>
          <p className="error-hint">Please ensure the narrative engine prompt is properly configured.</p>
        </div>
      </div>
    );
  }

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoading(false);
    setImageError(true);
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="display-window">
      {gameState.imagePrompt && (
        <div className="scene-image-container">
          {imageLoading && !imageError && (
            <div className="image-loading">
              <div className="loading-spinner"></div>
              <p>Generating scene...</p>
            </div>
          )}
          {!imageError && (
            <img 
              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(gameState.imagePrompt)}`} 
              alt="Scene visual" 
              className="scene-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          )}
        </div>
      )}
      
      {gameState.sceneTitle && (
        <h3 className="scene-title">{gameState.sceneTitle}</h3>
      )}
      
      <div className="scene-description">
        <p>{gameState.description || "No description available."}</p>
      </div>
      
      {(gameState.isGameWon || gameState.isPlayerDefeated) && (
        <div className={`game-end-indicator ${gameState.isGameWon ? 'victory' : 'defeat'}`}>
          <p>{gameState.isGameWon ? '🎉 Victory!' : '💀 Defeated'}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="loading-indicator">
          <p><i>The story continues...</i></p>
        </div>
      )}
    </div>
  );
}