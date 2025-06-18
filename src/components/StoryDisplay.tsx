import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface StoryDisplayProps {
  description: string;
  imageUrl: string | null;
  isLoadingImage: boolean;
  sceneTitle: string;
}

export function StoryDisplay({ description, imageUrl, isLoadingImage, sceneTitle }: StoryDisplayProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [imageUrl]);

  return (
    <div className="bg-display-window p-4 sm:p-5 rounded-lg shadow-xl mb-2">
      <h2 className="font-display text-xl sm:text-2xl text-accent mb-2">{sceneTitle}</h2>
      
      {imageUrl && (
        <div className="mb-3 h-48 sm:h-56 w-full bg-primary-dark rounded flex items-center justify-center overflow-hidden">
          {(isLoadingImage || imageLoading) && !imageError && (
            <LoadingSpinner text="Generating scene visualization..." />
          )}
          {!imageError && (
            <img 
              src={imageUrl} 
              alt={sceneTitle || 'Scene visual'} 
              className="w-full h-full object-cover" 
              style={{ display: imageLoading ? 'none' : 'block' }}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
          {imageError && !imageLoading && (
            <div className="text-secondary p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-secondary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Visuals currently unavailable. The story continues...
            </div>
          )}
        </div>
      )}
      
      <p className="text-primary text-sm sm:text-base leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}