import { apiClient } from './apiClient';
import type { PlayerInfo } from '../types/player';

/**
 * Search for characters by name
 * Calls your backend which scrapes Lodestone
 */
export async function searchCharacters(name: string, world: string = 'Faerie'): Promise<PlayerInfo[]> {
  try {
    const { data } = await apiClient.get('/characters', {
      params: { name, world }
    });
    
    // Transform backend format to match PlayerInfo interface
    return data.map((char: any) => ({
      id: char.ID,
      characterName: char.Name,
      serverName: char.World,
      worldName: char.World,
      portrait: char.Avatar,
      rating: undefined,
      reviewCount: undefined,
    }));
  } catch (error: any) {
    console.error('Error searching characters:', error);
    throw new Error('Failed to search characters. Please try again.');
  }
}