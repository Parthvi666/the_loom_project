"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendPrice = recommendPrice;
function recommendPrice(costs) {
    const values = [costs.materialCost, costs.labourCost, costs.packagingCost, costs.otherCosts].map(value => Number(value) || 0);
    const estimatedCost = values.reduce((total, value) => total + value, 0);
    const recommendedPrice = Math.ceil((estimatedCost * 1.35) / 50) * 50;
    const fallbackRange = { marketRangeLow: Math.ceil((recommendedPrice * 0.85) / 50) * 50, marketRangeHigh: Math.ceil((recommendedPrice * 1.2) / 50) * 50 };
    return { estimatedCost, ...fallbackRange, recommendedPrice, fallback: true };
}
