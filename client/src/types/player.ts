export interface PlayerInfo {
    // This will be scraped from Lodestone
    id: string;
    characterName: string;
    serverName: string;
    level: number;
    job: string;
    freeCompany?: string;
    portrait?: string;

    // Attributes from our end
    rating?: number;
    reviewCount?: number;

}