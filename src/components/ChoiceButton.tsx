import React from 'react';
import { Choice } from '../types';

interface ChoiceButtonProps {
  choice: Choice;
  onClick: (choiceText: string) => void;
  disabled?: boolean;
}

export function ChoiceButton({ choice, onClick, disabled }: ChoiceButtonProps) {
  return (
    <button
      onClick={() => onClick(choice.text)}
      disabled={disabled}
      className="w-full text-left px-4 py-2.5 bg-button-secondary hover:bg-button-secondary-hover text-primary rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm sm:text-base"
    >
      {choice.text}
    </button>
  );
}