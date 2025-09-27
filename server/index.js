require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, '../client')));
const axios = require('axios');
const cheerio = require('cheerio');


const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));



app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client', 'index.html')));
const cache = new Map();
const CACHE_EXPIRATION_TIME = 15 * 60 * 1000; // Note: cache is just set to 15 minutes for now, can be changed later if need be

// API for webscraping
app.get('/api/characters', async (req, res) => {
    const characterName = req.query.name; // Input
    if (!characterName) {
        return res.status(400).send('Missing character name');
    }
    // Using cache to reduce API calls to prevent rate limit and possible ip blocks
    const cacheKey = characterName.toLowerCase();
    const cachedData = cache.get(cacheKey);

    // If cache is not expired return cache data
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION_TIME) {
        return res.json(cachedData.results);
    }

    try {
        const lodestoneURL = 'https://na.finalfantasyxiv.com/lodestone/character/?q=';
        const allResponses = [];
        
        // Loop through all 4 regions.
        for (let i = 1; i <= 4; i++) {
            // We need to get page numbers, noticed on initial testing that it only returned page 1 results
            const initialUrl = `${lodestoneURL}${encodeURIComponent(characterName)}&worldname=_region_${i}&page=1`;
            const initialResponse = await axios.get(initialUrl);
            const $ = cheerio.load(initialResponse.data);

            // Tried to use if results on page < 50 then we know we are on the last page since lodestone only loads 50 per page, but realized that
            // if results = 150 we would infinite loop call the api since if you go to page 4 on 150 results lodestone just reloads last page.
            // Thankfully the lodestone displays characters result number so we can just use that
            const totalCountText = $('.parts__total').text().trim();
            const totalCharacters = parseInt(totalCountText.split(' ')[0].trim().replace(/,/g, ''), 10);
            
            // If no characters are found in one region just move on to the next region
            if (isNaN(totalCharacters) || totalCharacters === 0) {
                continue;
            }
        
            const totalPages = Math.ceil(totalCharacters / 50);

            // Now we can just loop through all pages and get the characters from all regions
            for (let page = 1; page <= totalPages; page++) {
                const url = `${lodestoneURL}${encodeURIComponent(characterName)}&worldname=_region_${i}&page=${page}`;
                const response = await axios.get(url);
                allResponses.push(response);
            }
        }
        
        let scrapedResults = [];
        allResponses.forEach(response => { // Now we just scrape the data from the html elements
            const html = response.data;
            const $ = cheerio.load(html);
            const regionResults = $('.entry') // CSS selector containing the data we need
                .map((i, el) => {
                    const link = $(el).find('.entry__link').attr('href');
                    const id = link ? link.split('/')[3] : null;
                    const name = $(el).find('.entry__name').text().trim();
                    const worldText = $(el).find('.entry__world').text().trim();

                    let world = null;
                    let dataCenter = null;

                    const dc_info = worldText.split(/[\s\[\]"]/).filter(part => part.trim() !== ""); // the data center and world are in the format "world [data center]"
                    if (dc_info.length === 2) { // So just need to extract
                        world = dc_info[0].trim();
                        dataCenter = dc_info[1].trim();
                    }
                    

                    return { id, name, world, dataCenter };
                })
                .get()
                .filter(char => char.id);
            
            scrapedResults.push(...regionResults);
        });

        // Was getting dupe results for some searches so just made a new arr with id as key to ensure no dupes
        const uniqueResults = Array.from(new Map(scrapedResults.map(item => [item.id, item])).values());

        res.json(uniqueResults);
    } catch (error) {
        console.error('error:', error.message);
        res.status(500).json({ error: 'An Error Occured' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));