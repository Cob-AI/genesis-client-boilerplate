import { GameState } from '../types';

export interface SaveData {
  gameState: GameState;
  conversationHistory: any[];
  turnsInCurrentScene: number;
  totalChoices: number;
  sessionStartTime: number;
  saveVersion: number;
  lastSaved: string;
}

export class SaveGameService {
  private static readonly SAVE_KEY = 'genesis-engine-manual-save';
  private static readonly SAVE_VERSION = 1;

  static saveGame(data: Omit<SaveData, 'saveVersion' | 'lastSaved'>): boolean {
    try {
      const saveData: SaveData = {
        ...data,
        saveVersion: this.SAVE_VERSION,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  static loadGame(): SaveData | null {
    try {
      const saved = localStorage.getItem(this.SAVE_KEY);
      if (!saved) return null;
      
      const data = JSON.parse(saved) as SaveData;
      
      if (data.saveVersion !== this.SAVE_VERSION) {
        this.deleteSave();
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to load game:', error);
      this.deleteSave();
      return null;
    }
  }

  static deleteSave(): void {
    try {
      localStorage.removeItem(this.SAVE_KEY);
    } catch (error) {
      console.error('Failed to delete save:', error);
    }
  }

  static hasSaveGame(): boolean {
    try {
      return localStorage.getItem(this.SAVE_KEY) !== null;
    } catch (error) {
      return false;
    }
  }

  static getSaveInfo(): { 
    lastSaved: string; 
    chapterInfo: string;
  } | null {
    try {
      const save = this.loadGame();
      if (!save) return null;
      
      return {
        lastSaved: save.lastSaved,
        chapterInfo: `${save.gameState.actTitle || 'Chapter 1'} - ${save.gameState.sceneTitle || 'Unknown Scene'}`
      };
    } catch (error) {
      return null;
    }
  }
}