interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
  }
  
  export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
    const sizeClasses = {
      sm: 'w-6 h-6 border-2',
      md: 'w-10 h-10 border-4',
      lg: 'w-16 h-16 border-4',
    };
  
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <div
          className={`animate-spin rounded-full border-accent border-t-transparent ${sizeClasses[size]}`}
        ></div>
        {text && <p className="text-primary">{text}</p>}
      </div>
    );
  }