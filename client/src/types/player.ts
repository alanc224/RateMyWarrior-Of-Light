export interface PlayerInfo {
    // This will be scraped from Lodestone
    id: string;
    characterName: string;
    serverName: string;
    freeCompany?: string;
    portrait?: string;

    // Attributes from our end
    rating?: number;
    reviewCount?: number;

}