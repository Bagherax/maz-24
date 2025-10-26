/**
 * MAZ-AI Engine (On-Device + On-Prem Simulation)
 *
 * This service simulates the MAZ-AI Engine as specified in the architecture.
 * It follows a privacy-first, on-device inference model, removing reliance on
 * external cloud-based AI services for core functionality.
 *
 * ---
 *
 * ### MAZ-AI Architecture
 *
 * 1.  **On-Device Inference (Primary):** The application uses lightweight, specialized
 *     models (`.onnx` format) for all AI tasks. These models are executed directly
 *     on the user's device using a runtime like ONNX Runtime or TensorFlow Lite.
 *     This ensures maximum privacy, offline capability, and low latency.
 *
 * 2.  **P2P Model Distribution:** The AI models themselves are small (2-10 MB) and are
 *     distributed securely to clients via the same P2P mechanism used for UI themes.
 *     When a model is updated, clients download, verify, and apply it seamlessly.
 *
 * 3.  **Model Zoo (Specialized Tasks):**
 *     - `AdAssistant.onnx`: A multi-modal model that analyzes an image to extract product
 *       details, suggest a price, and generate a title/description.
 *     - `SemanticSearch.onnx`: A text embedding model that converts search queries into
 *       vectors for advanced, context-aware searching.
 *     - `ModeratorTiny.onnx`: A small, efficient model for detecting inappropriate content
 *       in text fields.
 *     - `MarketplaceQnA.onnx`: (NEW) A model that takes user queries and marketplace data
 *       as context to provide intelligent, conversational answers about listings.
 *
 * 4.  **Optional On-Prem Fallback:** For devices that cannot run the models locally or
 *     for more intensive tasks, the system can optionally fall back to a self-hosted
 *     AI server within the MAZDADY infrastructure. This is a last resort and is not
 *     the primary mode of operation.
 *
 * The functions in this file simulate the output of these on-device models.
 */
import type { Ad, AdCondition } from '../types';

interface AdGenerationResult {
    title: string;
    description: string;
    suggestedPrice: number;
    categoryPath: string[];
    condition: AdCondition;
}

// Simulates running the AdAssistant.onnx model on a product image.
export const generateAdFromImage = async (base64Image: string): Promise<AdGenerationResult> => {
    // This simulates loading the ONNX model and running inference on the device.
    console.log("Simulating on-device inference with AdAssistant.onnx...");
    await new Promise(res => setTimeout(res, 2500)); // On-device is faster than a network call.

    return {
        title: "Vintage Leather Biker Jacket",
        description: "Classic black leather biker jacket in great condition. Features multiple zip pockets and a belted waist. Perfect for a timeless, edgy look. Minimal signs of wear.",
        suggestedPrice: 149.99,
        categoryPath: ["Fashion & Apparel", "Men's Clothing"],
        condition: 'used',
    };
};

// This function is kept for potential future use where a user might want to regenerate just the description.
// It simulates the text-generation part of the AdAssistant.onnx model.
export const generateAdDescription = async (title: string): Promise<string> => {
    console.log("Simulating on-device text generation...");
    await new Promise(res => setTimeout(res, 800));
    return `A compelling and brief product description for a marketplace listing with the title: "${title}". This was generated locally on your device for maximum privacy.`;
};


interface AuctionSuggestions {
    startPrice: number;
    durationHours: number;
    optimalStartTime: string;
}

// Simulates a small model that provides auction strategy tips.
export const generateAuctionSuggestions = async (title: string): Promise<AuctionSuggestions> => {
    console.log("Simulating on-device auction suggestion model...");
    await new Promise(res => setTimeout(res, 500));

    const lowerTitle = title.toLowerCase();
    let startPrice = 50;
    let durationHours = 48;

    if (lowerTitle.includes('console') || lowerTitle.includes('rare')) {
        startPrice = 250;
        durationHours = 72;
    } else if (lowerTitle.includes('jacket') || lowerTitle.includes('guitar')) {
        startPrice = 75;
    }

    const optimalStartTime = new Date(Date.now() + 3600 * 1000 * 2).toISOString();

    return {
        startPrice,
        durationHours,
        optimalStartTime,
    };
};

/**
 * Simulates the `ModeratorTiny.onnx` model to check for prohibited content.
 * @param content The title and description of the ad.
 * @returns An object indicating if the content is safe and a reason if it's not.
 */
export const moderateAdContent = async (content: { title: string; description: string }): Promise<{ isSafe: boolean; reason?: string }> => {
    console.log("Simulating on-device content moderation with ModeratorTiny.onnx...");
    await new Promise(res => setTimeout(res, 300)); // Moderation check is very fast.

    const combinedText = `${content.title.toLowerCase()} ${content.description.toLowerCase()}`;
    const prohibitedKeywords = ['scam', 'fake', 'replica', 'counterfeit', 'prohibited', 'illegal'];

    for (const keyword of prohibitedKeywords) {
        if (combinedText.includes(keyword)) {
            return {
                isSafe: false,
                reason: `Content violates policy: Contains prohibited term "${keyword}".`,
            };
        }
    }

    return { isSafe: true };
};

/**
 * Simulates the `SemanticSearch.onnx` model to convert a query into a vector.
 * @param query The user's search text.
 * @returns A promise that resolves to an array of numbers representing the semantic vector.
 */
export const getSearchVector = async (query: string): Promise<number[]> => {
    console.log(`Simulating on-device vector generation for "${query}" with SemanticSearch.onnx...`);
    await new Promise(res => setTimeout(res, 200));

    // In a real implementation, this would be a high-dimensional vector.
    // We generate a small, deterministic vector based on the query length for simulation.
    const vector = Array.from({ length: 32 }, (_, i) => Math.sin(query.length + i));
    
    console.log("Generated vector:", vector);
    return vector;
};

/**
 * Simulates the `MarketplaceQnA.onnx` model. This AI "learns" from the application
 * by taking the current ad listings as context to answer user questions.
 * @param prompt The user's question about the marketplace.
 * @param ads The current list of ads to use as context.
 * @returns A promise that resolves to a natural language answer.
 */
export const answerQueryAboutMarketplace = async (prompt: string, ads: Ad[]): Promise<string> => {
    console.log("Simulating on-device inference with MarketplaceQnA.onnx...");
    await new Promise(res => setTimeout(res, 1500));

    const p = prompt.toLowerCase();

    // 1. Handle counting queries
    if (p.includes('how many') || p.includes('count')) {
        const keyword = p.replace('how many', '').replace('count', '').replace('are there', '').trim().slice(0, -1); // remove plural 's'
        const filteredAds = ads.filter(ad => ad.title.toLowerCase().includes(keyword));
        if (filteredAds.length > 0) {
            return `I found ${filteredAds.length} listings matching "${keyword}".`;
        } else {
            return `I couldn't find any listings for "${keyword}".`;
        }
    }

    // 2. Handle pricing queries
    if (p.includes('cheapest') || p.includes('most expensive') || p.includes('priciest')) {
        const isCheapest = p.includes('cheapest');
        const keyword = p.replace('cheapest', '').replace('most expensive', '').replace('priciest', '').trim();
        let filteredAds = ads;
        if (keyword) {
           filteredAds = ads.filter(ad => ad.title.toLowerCase().includes(keyword));
        }
        
        if (filteredAds.length === 0) {
            return `I couldn't find any listings for "${keyword}" to compare prices.`;
        }

        const sortedAds = [...filteredAds].sort((a, b) => a.price - b.price);
        const targetAd = isCheapest ? sortedAds[0] : sortedAds[sortedAds.length - 1];
        
        return `The ${isCheapest ? 'cheapest' : 'most expensive'} ${keyword || 'item'} is the "${targetAd.title}" for $${targetAd.price.toFixed(2)}.`;
    }

    // 3. Handle listing queries
    if (p.startsWith('list') || p.startsWith('show me')) {
        const keyword = p.replace('list', '').replace('show me', '').trim();
        const filteredAds = ads.filter(ad => ad.title.toLowerCase().includes(keyword) || ad.description.toLowerCase().includes(keyword));
        
        if (filteredAds.length === 0) {
            return `I couldn't find any listings for "${keyword}".`;
        }

        const topResults = filteredAds.slice(0, 3).map(ad => `- ${ad.title} ($${ad.price.toFixed(2)})`).join('\n');
        return `Here are some top results for "${keyword}":\n${topResults}`;
    }
    
    // Default fallback
    return "I can answer questions about the marketplace listings. Try asking 'how many cars are there?' or 'what is the cheapest laptop?'.";
};


export const getMarketPriceAnalysis = async (title: string): Promise<{ low: number, high: number, competitive: boolean }> => {
    console.log("Simulating market analysis for:", title);
    await new Promise(res => setTimeout(res, 400));
    const basePrice = Math.random() * 100 + 80;
    return {
        low: Math.round(basePrice * 0.85),
        high: Math.round(basePrice * 1.25),
        competitive: true,
    };
};

export const refineText = async (text: string, instruction: 'shorten' | 'bullet_points' | 'seo'): Promise<string> => {
    console.log(`Simulating AI text refinement: ${instruction}`);
    await new Promise(res => setTimeout(res, 600));

    switch (instruction) {
        case 'shorten':
            return text.split('.').slice(0, 2).join('.').trim() + '.';
        case 'bullet_points':
            return text.split('. ').filter(s => s.trim()).map(sentence => `- ${sentence.trim()}`).join('\n');
        case 'seo':
            return `${text} Now with SEO keywords like 'best deal', 'high quality', and 'buy now'.`;
        default:
            return text;
    }
};

export const regenerateFieldFromImage = async (
    base64Image: string, // This isn't actually used in the mock, but it's part of the API contract
    field: 'title' | 'description' | 'category'
): Promise<{ value: string | string[] }> => {
    console.log(`Simulating on-device regeneration for field: ${field}`);
    await new Promise(res => setTimeout(res, 800));

    const timestamp = new Date().toLocaleTimeString([], { second: '2-digit' });

    switch (field) {
        case 'title':
            const titles = ["High-Quality Item", "Excellent Condition Product", "Like New Device"];
            return { value: `${titles[Math.floor(Math.random() * titles.length)]} (${timestamp})` };
        case 'description':
            return { value: `A fresh description generated at ${timestamp}. This one highlights different features and benefits of the item.` };
        case 'category':
            const categories = [
                ["Electronics & Technology", "Computers & Laptops"],
                ["Fashion & Apparel", "Men's Clothing"],
                ["Home, Garden & DIY", "Furniture"],
            ];
            return { value: categories[Math.floor(Math.random() * categories.length)] };
        default:
            throw new Error("Invalid field for regeneration");
    }
};
