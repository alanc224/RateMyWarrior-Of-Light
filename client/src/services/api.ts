import { apiClient } from './apiClient';
import type { PlayerInfo } from '../types/player';

/**
 * Search for characters by name
 * Calls your backend which scrapes Lodestone
 */
export async function searchCharacters(name: string, world: string): Promise<PlayerInfo[]> {
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

/**
 * Get average rating and review count for a character
 * Fetches from MongoDB reviews endpoint
 */
export async function getCharacterRatings(characterId: string): Promise<{ rating: number; reviewCount: number } | null> {
  try {
    const { data } = await apiClient.get(`/reviews/${characterId}/reviews`);
    
    if (!data.reviews || data.reviews.length === 0) {
      return null;
    }
    
    // Calculate average rating from all reviews
    const ratings = data.reviews.map((r: any) => r.rating);
    const totalRating = ratings.reduce((sum: number, r: number) => sum + r, 0);
    const average = totalRating / ratings.length;
    
    return {
      rating: Math.round(average * 10) / 10, // Round to 1 decimal
      reviewCount: ratings.length
    };
  } catch (error) {
    console.error(`Failed to fetch ratings for character ${characterId}:`, error);
    return null;
  }
}