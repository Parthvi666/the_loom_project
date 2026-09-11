export function recommendPrice(costs: { materialCost?: number; labourCost?: number; packagingCost?: number; otherCosts?: number; category?: string; craft?: string; region?: string }) {
	const values = [costs.materialCost, costs.labourCost, costs.packagingCost, costs.otherCosts].map(value => Number(value) || 0);
	const estimatedCost = values.reduce((total: number, value: number) => total + value, 0);
	const recommendedPrice = Math.ceil((estimatedCost * 1.35) / 50) * 50;
	const fallbackRange = { marketRangeLow: Math.ceil((recommendedPrice * 0.85) / 50) * 50, marketRangeHigh: Math.ceil((recommendedPrice * 1.2) / 50) * 50 };
	return { estimatedCost, ...fallbackRange, recommendedPrice, fallback: true };
}