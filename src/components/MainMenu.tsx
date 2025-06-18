import { extractGameMetadata } from '../utils/themeExtractor';
import { SaveGameService } from '../services/saveGameService';

interface MainMenuProps {
  onNewGame: () => void;
  onContinueGame: () => void;
}

export function MainMenu({ onNewGame, onContinueGame }: MainMenuProps) {
  const metadata = extractGameMetadata();
  const hasSave = SaveGameService.hasSaveGame();
  const saveInfo = hasSave ? SaveGameService.getSaveInfo() : null;

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center p-4 pt-6 sm:pt-8 pb-8">
      <header>
        <h1 className="font-display text-5xl sm:text-6xl text-accent mb-4 text-center">
          {metadata?.title || 'Genesis Engine'}
        </h1>
      </header>
      
      <main className="container mx-auto max-w-2xl w-full flex flex-col flex-grow">
        <div className="text-center flex flex-col justify-center flex-grow">
          <p className="text-secondary mb-8 text-lg sm:text-xl max-w-2xl mx-auto">
            {metadata?.tagline || 'Your adventure awaits.'}
          </p>
          
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={onNewGame}
              aria-label="Begin Your Story"
              className="px-8 py-3 bg-accent hover:bg-accent-hover text-primary-dark font-bold text-xl rounded-md transition-all duration-150 transform hover:scale-105"
            >
              New Game
            </button>
            
            {hasSave && saveInfo && (
              <div className="animate-fadeIn mt-2">
                <button
                  onClick={onContinueGame}
                  className="px-8 py-3 bg-button-primary hover:bg-button-primary-hover text-primary rounded-lg font-semibold transition-colors border border-accent"
                >
                  Continue Game
                </button>
                <p className="text-secondary text-sm mt-2">
                  {saveInfo.chapterInfo}
                </p>
                <p className="text-secondary opacity-70 text-xs">
                  Saved {new Date(saveInfo.lastSaved).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="w-full max-w-2xl mx-auto text-center px-4 mt-4 pb-4">
        <p className="text-xs text-secondary">
          {metadata?.disclaimer || 'This application is powered by the Genesis Engine.'}
        </p>
      </footer>
    </div>
  );
}