import React from 'react';
import { extractGameMetadata } from '../utils/themeExtractor';

interface FeedbackButtonProps {
  currentScene: string;
  currentAct: string;
}

export function FeedbackButton({ currentScene, currentAct }: FeedbackButtonProps) {
  const metadata = extractGameMetadata();
  
  const handleFeedbackClick = () => {
    // Replace with your Google Form URL
    const baseUrl = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform';
    const detailsEntryId = 'entry.YOUR_FIELD_ID';
    
    // Include game title, universe, and current location
    const context = `Game: ${metadata?.title || 'Unknown'}
Universe: ${metadata?.universe || 'Unknown'}
Location: ${currentAct} - ${currentScene}`;
    
    const encodedContext = encodeURIComponent(context);
    const finalUrl = `${baseUrl}?${detailsEntryId}=${encodedContext}`;
    
    window.open(finalUrl, '_blank');
  };

  return (
    <button
      onClick={handleFeedbackClick}
      aria-label="Give Feedback"
      className="fixed bottom-4 right-4 bg-accent text-primary-dark p-3 rounded-full shadow-lg hover:bg-accent-hover transition-colors"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
      </svg>
    </button>
  );
}