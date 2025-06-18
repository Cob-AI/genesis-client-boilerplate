import { NARRATIVE_ENGINE_PROMPT } from '../config/engine';

interface GameMetadata {
  title?: string;
  universe?: string;
  tagline?: string;
  disclaimer?: string;
  theme?: Record<string, string>;
}

export function extractGameMetadata(): GameMetadata | null {
  try {
    const prompt = NARRATIVE_ENGINE_PROMPT;
    
    // Extract title
    const titleMatch = prompt.match(/You are the Storyteller AI for "([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : null;
    
    // Extract theme object
    const themeMatch = prompt.match(/The visual theme for the UI is defined by the following object:\s*(\{[^}]+\})/s);
    let theme: Record<string, string> = {};
    
    if (themeMatch) {
      const themeStr = themeMatch[1];
      const regex = /(\w+)\s*:\s*['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = regex.exec(themeStr)) !== null) {
        const [, key, value] = match;
        if (key && value) {
          theme[key] = value;
        }
      }
    }
    
    // Extract universe from TARGET_UNIVERSE in the prompt
    const universeMatch = prompt.match(/TARGET_UNIVERSE[^"]*"([^"]+)"/);
    const universe = universeMatch ? universeMatch[1] : null;
    
    // Generate tagline based on philosophy
    const philosophyMatch = prompt.match(/Core Philosophy:\s*([^•]+)/);
    const tagline = philosophyMatch ? 
      philosophyMatch[1].trim().split('.')[0] + '.' : 
      'Your choices shape your destiny.';
    
    // Determine disclaimer
    const isOriginalUniverse = !prompt.includes('Canon Integrity');
    const disclaimer = isOriginalUniverse ?
      'This is an original story powered by the Genesis Engine.' :
      'This is an unofficial, non-profit fan project. All rights belong to their respective owners.';
    
    return {
      title: title || 'Genesis Adventure',
      universe,
      tagline,
      disclaimer,
      theme: Object.keys(theme).length > 0 ? theme : getDefaultTheme()
    };
  } catch (e) {
    console.error('Failed to extract game metadata:', e);
    return null;
  }
}

function getDefaultTheme(): Record<string, string> {
  return {
    primaryBg: '#1a2a3a',
    textPrimary: '#e0e8f0',
    textSecondary: '#8d99ae',
    accent: '#f7b801',
    buttonPrimaryBg: '#5c3a21',
    borderColor: '#3a4a5a',
    displayWindowBg: '#2a3a4a',
    buttonSecondaryBg: '#3a2e24',
    fontFamily: "'Inter', system-ui, sans-serif"
  };
}