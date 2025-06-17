export function DisplayWindow({ gameState, isLoading }) {
    if (isLoading && !gameState) {
      return <div className="display-window"><p>The Genesis Engine is conjuring a world...</p></div>;
    }
  
    if (!gameState) {
      return <div className="display-window"><p>Error: Game state is missing. Did the AI provide the engine prompt?</p></div>;
    }
  
    return (
      <div className="display-window">
        {gameState.imagePrompt && (
            <img 
                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(gameState.imagePrompt)}`} 
                alt="Scene visual" 
                className="scene-image"
            />
        )}
        <h3>{gameState.sceneTitle}</h3>
        <p>{gameState.description}</p>
        {isLoading && <p><i>The story continues...</i></p>}
      </div>
    );
}