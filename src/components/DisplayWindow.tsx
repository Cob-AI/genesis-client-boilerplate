interface GameState {
  imagePrompt?: string;
  sceneTitle?: string;
  description?: string;
  choices?: string[];
  isSceneEnd?: boolean;
  worldState?: any;
  playerState?: any;
}

interface DisplayWindowProps {
  gameState: GameState | null;
  isLoading: boolean;
}

export function DisplayWindow({ gameState, isLoading }: DisplayWindowProps) {
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

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="display-window">
      {gameState.imagePrompt && (
        <div className="scene-image-container">
          <img 
            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(gameState.imagePrompt)}`} 
            alt="Scene visual" 
            className="scene-image"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}
      
      {gameState.sceneTitle && (
        <h3 className="scene-title">{gameState.sceneTitle}</h3>
      )}
      
      <div className="scene-description">
        <p>{gameState.description || "No description available."}</p>
      </div>
      
      {isLoading && (
        <div className="loading-indicator">
          <p><i>The story continues...</i></p>
        </div>
      )}
    </div>
  );
}