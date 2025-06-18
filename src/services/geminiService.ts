import { GoogleGenerativeAI } from '@google/generative-ai';
import { GameState } from '../types';

const MODEL_NAME = 'gemini-2.5-flash-preview-05-20';

interface GeminiResponse {
  gameState: GameState | null;
  conversationHistory: any[];
  error?: string;
}

export async function getNextTurn(
  conversationHistory: any[],
  userInput: string,
  turnsInScene: number
): Promise<GeminiResponse> {
  const apiKey = sessionStorage.getItem('gemini-api-key');
  if (!apiKey) {
    return {
      gameState: null,
      conversationHistory,
      error: 'API key not found. Please return to main menu.'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Add pacing directive if needed
    let finalUserInput = userInput;
    if (turnsInScene >= 3) {
      finalUserInput = `[URGENT PACING DIRECTIVE: The current scene has lasted ${turnsInScene} turns. Please progress the story to a new scene or situation immediately.]\n${userInput}`;
    }
    
    // Create chat with history
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        parts: [{ text: msg.content }]
      }))
    });
    
    // Send message
    const result = await chat.sendMessage(finalUserInput);
    const responseText = result.response.text();
    
    // Parse response
    const gameState = parseGameResponse(responseText);
    
    if (!gameState) {
      return {
        gameState: null,
        conversationHistory,
        error: 'Failed to parse game response. Please try again.'
      };
    }
    
    // Store for dev mode
    (window as any).lastGameState = gameState;
    
    // Update history
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: finalUserInput },
      { role: 'assistant', content: responseText }
    ];
    
    return {
      gameState,
      conversationHistory: newHistory
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'Invalid API key';
    } else if (error.message?.includes('RATE_LIMIT')) {
      errorMessage = 'Rate limit exceeded. Please wait a moment.';
    } else if (error.message?.includes('SAFETY')) {
      errorMessage = 'Content blocked by safety filters';
    }
    
    return {
      gameState: null,
      conversationHistory,
      error: errorMessage
    };
  }
}

function parseGameResponse(responseText: string): GameState | null {
  try {
    // Clean up response text
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/gm, '');
    cleanedText = cleanedText.replace(/\n?```\s*$/gm, '');
    
    // Parse JSON
    const parsed = JSON.parse(cleanedText);
    
    // Normalize choices
    if (parsed.choices && Array.isArray(parsed.choices)) {
      parsed.choices = parsed.choices.map((choice: any, index: number) => {
        if (typeof choice === 'string') {
          return { id: `choice-${index}`, text: choice };
        }
        return choice;
      });
    }
    
    return parsed as GameState;
  } catch (error) {
    console.error('Failed to parse game response:', error);
    return null;
  }
}