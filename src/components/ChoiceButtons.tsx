interface ChoiceButtonsProps {
  choices?: string[];
  onChoice: (index: number) => void;
  disabled?: boolean;
}

export function ChoiceButtons({ choices, onChoice, disabled }: ChoiceButtonsProps) {
  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <div className="choice-buttons">
      {choices.map((choice, index) => (
        <button key={index} onClick={() => onChoice(index)} disabled={disabled}>
          {choice}
        </button>
      ))}
    </div>
  );
}