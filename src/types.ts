// Game state types
export interface GameState {
    imagePrompt?: string;
    sceneTitle?: string;
    actTitle?: string;
    description?: string;
    choices?: string[];
    isSceneEnd?: boolean;
    isMicroArcEnd?: boolean;
    isChapterEnd?: boolean;
    isGameWon?: boolean;
    isPlayerDefeated?: boolean;
    worldState?: Record<string, any>;
    playerState?: PlayerState;
  }
  
  export interface PlayerState {
    name?: string;
    visualDescription?: string;
    inventory?: string[];
    skills?: string[];
    [key: string]: any; // Allow for dynamic core metric
  }
  
  // Conversation types
  export interface ConversationMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }
  
  // Save data types
  export interface SaveData {
    gameState: GameState;
    history: ConversationMessage[];
    lastSaved: string;
  }
  
  // Theme types
  export interface GameTheme {
    primaryBg?: string;
    textPrimary?: string;
    textSecondary?: string;
    accent?: string;
    buttonPrimaryBg?: string;
    borderColor?: string;
    displayWindowBg?: string;
    buttonSecondaryBg?: string;
    fontFamily?: string;
  }
  
  // Component prop types
  export interface GameViewProps {
    initialSaveData?: SaveData | null;
    onExit: () => void;
  }
  
  export interface DisplayWindowProps {
    gameState: GameState | null;
    isLoading: boolean;
  }
  
  export interface ChoiceButtonsProps {
    choices?: string[];
    onChoice: (index: number) => void;
    disabled?: boolean;
  }
  
  export interface ApiKeyManagerProps {
    onKeyProvided: () => void;
  }