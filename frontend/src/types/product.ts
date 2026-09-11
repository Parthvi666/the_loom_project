// Defines the shared artisan and product data contracts.
export interface Artisan { id: string; name: string; email: string; preferredLanguage: string; region: string; craft: string; bio?: string; profileImage?: string; }
export interface Product {
  id: string; name: string; category: string; craft: string; material: string; colours: string[]; region: string; dimensions: string; productionTime: string;
  materialCost: number; labourCost: number; packagingCost: number; otherCosts: number; recommendedPrice: number; finalPrice: number;
  descriptionEnglish: string; descriptionHindi: string; tags: string[]; images: string[]; status: string; createdAt: string; updatedAt: string; artisanId?: string;
}