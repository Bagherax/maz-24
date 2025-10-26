/**
 * @deprecated This file is a legacy service. All AI functionality has been
 * consolidated into `src/api/aiService.ts` to reflect the new on-device
 * AI architecture. Please update imports to point to the central API index.
 */
// FIX: Updated import to use the central API index and corrected module path in comment.
import { generateAdDescription, generateAdFromImage, generateAuctionSuggestions } from '../api';

// Re-export for backward compatibility
export {
    generateAdDescription,
    generateAdFromImage,
    generateAuctionSuggestions,
};
