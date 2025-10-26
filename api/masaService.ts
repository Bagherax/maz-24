/**
 * MAZ-AI Search Assistant (MASA) Service
 *
 * This service simulates the lightweight, on-device AI for intelligent search autocomplete.
 * It learns from the application's own data (ads, categories, user behavior) to provide
 * relevant, in-context suggestions.
 *
 * ---
 *
 * ### Core Principles (as per spec)
 *
 * 1.  **Lightweight & Fast:** Uses simple but effective algorithms (prefix search, popularity ranking)
 *     for sub-50ms responses. No heavy ML models required for this core feature.
 *
 * 2.  **On-Device Knowledge:** The search index is generated directly from the marketplace's
 *     live ad data, ensuring suggestions are always relevant to what's available.
 *
 * 3.  **Privacy-First:** All processing happens client-side, with no search queries or
 *     keystrokes sent to external servers for suggestions.
 *
 * 4.  **Continuous Learning (Simulated):** The popularity score in the index can be updated
 *     based on user search frequency, making the assistant smarter over time.
 */

import type { Ad, View, QAPair } from '../types';
import { answerQueryAboutMarketplace } from './aiService';

export interface SearchIndexEntry {
    text: string;
    popularity: number;
}

export type AiCommandResult = 
    | { type: 'text_response', payload: string }
    | { type: 'apply_filters', payload: { searchTerm?: string, priceMin?: number, priceMax?: number }, message: string }
    | { type: 'apply_category_filter', payload: { path: string[] }, message: string }
    | { type: 'navigate', payload: { view: View }, message: string }
    | { type: 'error', payload: string };


const analyzeMarketplaceData = (ads: Ad[], analysisType: 'popularity' | 'avg_price'): string => {
    if (ads.length === 0) {
        return "There's no data to analyze yet.";
    }
    if (analysisType === 'popularity') {
        const sorted = [...ads].sort((a,b) => (b.boostScore || 0) - (a.boostScore || 0));
        const topItems = sorted.slice(0, 3).map(ad => `- ${ad.title} (Score: ${ad.boostScore || 0})`).join('\n');
        return `Based on current data, the most popular items are:\n${topItems}`;
    }
    if (analysisType === 'avg_price') {
        const total = ads.reduce((sum, ad) => sum + ad.price, 0);
        const avg = total / ads.length;
        return `The average price of an item on the marketplace is currently $${avg.toFixed(2)}.`;
    }
    return "I'm not sure how to perform that analysis.";
}

/**
 * Simulates an on-device NLU model to parse the user's intent.
 */
export const parseAiCommand = async (query: string, ads: Ad[]): Promise<AiCommandResult> => {
    const q = query.toLowerCase();

    // 1. Category Intent (NEW and HIGHEST PRIORITY)
    const categoryRegex = /(?:show me|find|search for|list)?\s*(?:items in|in)\s*(.*)/;
    const categoryMatch = q.match(categoryRegex);
    if (categoryMatch && categoryMatch[1]) {
        const pathString = categoryMatch[1].trim();
        // Split by ' > ' and then trim each part
        const path = pathString.split('>').map(p => p.trim());
        
        // The path from the browser is already formatted, but if a user types it,
        // we might want to format it. For now, we assume the format is correct.
        const formattedPath = path;

        return {
            type: 'apply_category_filter',
            payload: { path: formattedPath },
            message: `Filtering for category: ${formattedPath.join(' > ')}`
        };
    }

    // 2. Navigation Intent
    if (q.startsWith('sell') || q.startsWith('create ad') || q.startsWith('post')) {
        return { type: 'navigate', payload: { view: 'create_ad' }, message: 'Right away! Opening the ad creation screen for you.' };
    }

    // 3. Analysis Intent
    if (q.includes('most popular') || q.includes('hottest items')) {
        const result = analyzeMarketplaceData(ads, 'popularity');
        return { type: 'text_response', payload: result };
    }
    if (q.includes('average price')) {
        const result = analyzeMarketplaceData(ads, 'avg_price');
        return { type: 'text_response', payload: result };
    }

    // 4. Filtering Intent (simple example)
    const filterRegex = /(?:show me|find|search for)?\s*(.*?)\s*(?:under|less than)\s*\$?(\d+)/;
    const match = q.match(filterRegex);
    if (match) {
        const searchTerm = match[1].trim();
        const priceMax = parseInt(match[2], 10);
        return { 
            type: 'apply_filters', 
            payload: { searchTerm, priceMax },
            message: `Applied filter: "${searchTerm}" under $${priceMax}.`
        };
    }
     const filterRegex2 = /(?:show me|find|search for)\s*(.*)/;
     const match2 = q.match(filterRegex2);
     if(match2 && match2[1]){
         const searchTerm = match2[1].trim();
         return {
             type: 'apply_filters',
             payload: { searchTerm },
             message: `Filtering marketplace for "${searchTerm}"`
         }
     }


    // 5. Q&A Intent (fallback)
    const qaResponse = await answerQueryAboutMarketplace(query, ads);
    return { type: 'text_response', payload: qaResponse };
}


/**
 * Generates the search knowledge base from the current list of ads.
 * In a real app, this would be built incrementally and stored locally.
 * Here, we generate it on-the-fly for simulation purposes.
 * @param ads The list of ads from the marketplace.
 * @returns An array of search index entries.
 */
export const generateSearchIndexFromAds = (ads: Ad[]): SearchIndexEntry[] => {
    const indexMap = new Map<string, SearchIndexEntry>();

    ads.forEach(ad => {
        // Use ad title as a primary search term
        const entryText = ad.title.trim();
        if (entryText) {
            const existingEntry = indexMap.get(entryText.toLowerCase());
            // Popularity is a mix of reviews, boost score, and views to simulate relevance
            const popularity = (ad.reviews || 0) + (ad.boostScore || 0) * 5 + (ad.viewCount || 0) / 100;
            if (existingEntry) {
                existingEntry.popularity += popularity;
            } else {
                indexMap.set(entryText.toLowerCase(), {
                    text: entryText,
                    popularity: popularity,
                });
            }
        }
        // Future enhancement: could also add brands, models, etc. from specs here
    });

    return Array.from(indexMap.values());
};


/**
 * Gets a single, top-ranked autocomplete suggestion based on the user's input.
 * Implements a prefix search with popularity ranking.
 * A fuzzy search could be added here later for typo tolerance.
 * @param query The user's current input text.
 * @param searchIndex The knowledge base to search within.
 * @returns The suggested suffix string, or null if no suggestion is found.
 */
export const getAutocompleteSuggestion = (query: string, searchIndex: SearchIndexEntry[]): string | null => {
    if (!query || searchIndex.length === 0) {
        return null;
    }

    const lowerCaseQuery = query.toLowerCase();

    const candidates = searchIndex
        .filter(entry =>
            entry.text.toLowerCase().startsWith(lowerCaseQuery) &&
            entry.text.toLowerCase() !== lowerCaseQuery
        )
        .sort((a, b) => b.popularity - a.popularity);

    if (candidates.length > 0) {
        const bestMatch = candidates[0];
        // Return only the part of the string that comes after the user's query
        return bestMatch.text.substring(query.length);
    }

    return null;
};

/**
 * Simulates on-device AI to suggest replies in a chat conversation.
 * It prioritizes learned Q&A pairs, then falls back to analyzing the ad's data.
 * @param question The buyer's message/question.
 * @param ad The ad context for the conversation.
 * @param learnedQA The seller's personal knowledge base of Q&A pairs.
 * @returns A promise that resolves to an array of suggested reply strings.
 */
export const suggestChatReply = async (
    question: string,
    ad: Ad,
    learnedQA: QAPair[] = []
): Promise<string[]> => {
    console.log("Simulating on-device chat reply suggestion...");
    await new Promise(res => setTimeout(res, 300));

    const q = question.toLowerCase();
    const suggestions: Set<string> = new Set();

    // 1. Check learned Q&A first (highest priority)
    const learnedResponse = learnedQA.find(qa => q.includes(qa.question.toLowerCase().slice(0, -1))); // simple substring match
    if (learnedResponse) {
        suggestions.add(learnedResponse.answer);
    }

    // 2. Fallback to ad data analysis
    if (q.includes('price')) {
        suggestions.add(`The price is $${ad.price.toFixed(2)}.`);
    }
    if (q.includes('condition')) {
        suggestions.add(`The item is listed as "${ad.condition}".`);
    }
    if (q.includes('location') || q.includes('where')) {
        suggestions.add(`It's located in ${ad.location}.`);
    }
    if (q.includes('available')) {
        suggestions.add("Yes, it's still available!");
    }

    return Array.from(suggestions);
};
