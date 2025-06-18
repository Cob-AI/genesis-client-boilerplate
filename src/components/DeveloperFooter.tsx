import React, { useState } from 'react';

interface DeveloperFooterProps {
  currentActTitle: string;
  currentSceneTitle: string;
  onSaveClick: () => void;
  showSaveConfirmation: boolean;
}

export function DeveloperFooter({
  currentActTitle,
  currentSceneTitle,
  onSaveClick,
  showSaveConfirmation,
}: DeveloperFooterProps) {
  const [devMode, setDevMode] = useState(false);

  return (
    <>
      <footer className="mt-auto pt-4 border-t border-border-color text-sm">
        <div className="flex justify-between items-center text-secondary">
          <div className="w-10 flex-shrink-0"></div>
          
          <div className="text-center">
            <span className="font-bold text-accent">{currentActTitle}</span>
            <span className="mx-2">•</span>
            <span>{currentSceneTitle}</span>
          </div>
          
          <div className="w-10 flex-shrink-0 flex justify-end relative">
            <button
              onClick={onSaveClick}
              aria-label="Save Game"
              className="p-2 text-secondary hover:text-accent transition-colors rounded-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </button>
            
            {showSaveConfirmation && (
              <span className="absolute bottom-full mb-2 right-0 text-xs bg-primary text-accent px-2 py-1 rounded shadow-lg animate-fadeIn">
                ✓ Saved
              </span>
            )}
          </div>
        </div>
      </footer>
      
      <div className="mt-4 text-center">
        <label className="text-secondary text-sm">
          <input 
            type="checkbox" 
            checked={devMode} 
            onChange={() => setDevMode(!devMode)}
            className="mr-2"
          /> 
          Dev Mode
        </label>
      </div>
      
      {devMode && (
        <div className="mt-4 p-4 bg-primary-dark rounded-lg border border-border-color">
          <p className="text-secondary text-xs mb-2">Raw JSON Response:</p>
          <pre className="text-secondary text-xs overflow-x-auto">
            {JSON.stringify(window.lastGameState || {}, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}