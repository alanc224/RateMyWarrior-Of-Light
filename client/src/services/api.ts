import { apiClient } from './apiClient';
import type { PlayerInfo } from '../types/player';

/**
 * Search for characters by name
 * Calls your backend which scrapes Lodestone
 */
export async function searchCharacters(name: string): Promise<PlayerInfo[]> {
  try {
    const { data } = await apiClient.get('/characters', {
      params: { name }
    });
    
    // Transform backend format to match PlayerInfo interface
    return data.map((char: any) => ({
      id: char.id,
      characterName: char.name,
      serverName: char.world,
      worldName: char.world,
      portrait: 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=FFXIV', // Simple placeholder
      rating: undefined,
      reviewCount: undefined,
    }));
  } catch (error: any) {
    console.error('Error searching characters:', error);
    throw new Error('Failed to search characters. Please try again.');
  }
}