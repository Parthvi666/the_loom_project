"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCatalogue = generateCatalogue;
const demoCatalogue = {
    titleEnglish: 'Handcrafted Bandhani Dupatta',
    descriptionEnglish: 'This dupatta is made using Bandhani, a traditional tie-and-dye technique practiced for centuries in Gujarat and Rajasthan. The fabric is hand-tied into hundreds of tiny knots before dyeing, creating the signature dotted patterns once the knots are released. Bandhani work is closely associated with the Kutch and Jamnagar regions of Gujarat, traditionally passed down within artisan communities. This piece is made from cotton, reflects the vibrant colour traditions of the craft, and represents hours of careful, entirely hand-done work.',
    descriptionHindi: 'यह दुपट्टा गुजरात और राजस्थान में सदियों से प्रचलित पारंपरिक बांधनी टाई-एंड-डाई तकनीक से बनाया गया है।',
    tags: ['Bandhani', 'Tie-and-Dye', 'Gujarat Handloom', 'Cotton Dupatta', 'Handmade Textile', 'Traditional Craft'],
};
function fallbackCatalogue(product) {
    return { ...demoCatalogue, fallback: true };
}
async function generateCatalogue(product) {
    return fallbackCatalogue(product);
}
