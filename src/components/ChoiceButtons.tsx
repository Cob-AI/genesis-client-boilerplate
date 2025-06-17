interface ChoiceButtonsProps {
  choices?: string[];
  onChoice: (index: number) => void;
  disabled?: boolean;
}

export function ChoiceButtons({ choices, onChoice, disabled = false }: ChoiceButtonsProps) {
  if (!choices || choices.length === 0) {
    return null;
  }

  const handleChoice = (index: number) => {
    if (!disabled) {
      onChoice(index);
    }
  };

  const handleKeyPress = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChoice(index);
    }
  };

  return (
    <div className="choice-buttons" role="group" aria-label="Story choices">
      {choices.map((choice, index) => (
        <button 
          key={`choice-${index}`}
          onClick={() => handleChoice(index)} 
          onKeyPress={(e) => handleKeyPress(index, e)}
          disabled={disabled}
          role="button"
          aria-label={`Choice ${index + 1}: ${choice}`}
          tabIndex={disabled ? -1 : 0}
        >
          <span className="choice-number">{index + 1}.</span>
          <span className="choice-text">{choice}</span>
        </button>
      ))}
    </div>
  );
}