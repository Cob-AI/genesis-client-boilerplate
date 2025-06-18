export interface Choice {
  id: string;
  text: string;
}

export interface GameState {
  description: string;
  choices?: Choice[];
  imagePrompt?: string;
  sceneTitle?: string;
  actTitle?: string;
  isSceneEnd?: boolean;
  isMicroArcEnd?: boolean;
  isChapterEnd?: boolean;
  isActEnd?: boolean;
  isGameWon?: boolean;
  isPlayerDefeated?: boolean;
  worldState?: Record<string, any>;
  playerState?: Record<string, any>;
}

export interface SaveData {
  gameState: GameState;
  conversationHistory: any[];
  turnsInCurrentScene: number;
  totalChoices: number;
  sessionStartTime: number;
  saveVersion: number;
  lastSaved: string;
}