// Typed frontend boundary for the backend API. The token never leaves this module.
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api').replace(/\/$/, '');
export type InterviewAnswer = { question: string; answer: string };
export type ApiProduct = { id: string; artisanId: string; name: string; category: string; craft: string; material?: string; region?: string; productionTime?: string; materialCost?: number; labourCost?: number; packagingCost?: number; otherCosts?: number; recommendedPrice?: number; finalPrice?: number; descriptionEnglish?: string; descriptionHindi?: string; tags: string[]; images: string[]; interviewAnswers: InterviewAnswer[]; status: string; artisan?: ApiArtisan };
export type ApiArtisan = { id: string; fullName: string; email?: string; preferredLanguage: string; region?: string; craft?: string; bio?: string; profileImage?: string };
export type CatalogueResponse = { titleEnglish: string; descriptionEnglish: string; descriptionHindi: string; tags: string[] };
export type PriceResponse = { estimatedCost: number; marketRangeLow: number; marketRangeHigh: number; recommendedPrice: number; lineItems: Array<{ label: string; value: string; source?: string; note?: string }>; sources?: Array<{ url: string; title?: string }>; source: 'reference-data' | 'arithmetic-only'; materialEstimate: { value: string; note: string }; comparableProductRange: { low: number; high: number; note: string; examples: string[] }; suggestedPrice: number; breakdown: { material: number; labour: number; packaging: number; other: number; estimatedCost: number }; };
export type AnalysisResponse = { category: string; craft: string; visualDescription: string; confidence: number; fallback?: boolean };

export function getToken() { return localStorage.getItem('loom_token'); }
export function setSession(token: string, artisan: ApiArtisan) { localStorage.setItem('loom_token', token); localStorage.setItem('loom_artisan', JSON.stringify(artisan)); }
export function getStoredArtisan(): ApiArtisan | null { try { return JSON.parse(localStorage.getItem('loom_artisan') ?? 'null') as ApiArtisan | null; } catch { return null; } }
export function clearSession() { localStorage.removeItem('loom_token'); localStorage.removeItem('loom_artisan'); }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const headers = new Headers(options.headers);
	if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
	const token = getToken();
	if (token) headers.set('Authorization', `Bearer ${token}`);
	const response = await fetch(`${API_URL}${path}`, { ...options, headers });
	const payload = await response.json().catch(() => ({}));
	if (response.status === 401) clearSession();
	if (!response.ok) throw new Error(payload.error ?? `Request failed (${response.status})`);
	return payload as T;
}

export const register = (data: { fullName: string; email: string; password: string }) => request<{ token: string; artisan: ApiArtisan }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const login = (data: { email: string; password: string }) => request<{ token: string; artisan: ApiArtisan }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const getMe = () => request<ApiArtisan>('/auth/me');
export const getProducts = (query = '') => request<ApiProduct[]>(`/products${query}`);
export const createProduct = (data: unknown) => request<ApiProduct>('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id: string, data: unknown) => request<ApiProduct>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id: string) => request<void>(`/products/${id}`, { method: 'DELETE' });
export const publishProduct = (id: string) => request<ApiProduct>(`/products/${id}/publish`, { method: 'POST' });
export const uploadImages = (id: string, files: File[]) => { const form = new FormData(); files.forEach(file => form.append('images', file)); return request<ApiProduct>(`/products/${id}/images`, { method: 'POST', body: form }); };
export const saveInterviewAnswer = (id: string, payload: { question: string; answer: string }) => request<ApiProduct>(`/products/${id}/interview-answer`, { method: 'POST', body: JSON.stringify(payload) });
export const transcribeAudio = (id: string, audio: Blob, languageCode: string) => { const form = new FormData(); form.append('audio', audio, 'interview.webm'); form.append('languageCode', languageCode); return request<{ transcript: string }>(`/products/${id}/transcribe`, { method: 'POST', body: form }); };
export const backgroundRemove = (id: string, imageUrl: string) => request<{ outputImageUrl?: string; error?: string }>(`/products/${id}/background-remove`, { method: 'POST', body: JSON.stringify({ imageUrl }) });
export const editProductImage = (id: string, editType: 'lighting' | 'background' | 'distractions' | 'crop', source: { imagePath?: string; imageData?: string }, cropParams?: { left?: number; top?: number; size?: number }) => request<{ imagePath: string; originalImagePath?: string; editType: string }>(`/products/${id}/edit-image`, { method: 'POST', body: JSON.stringify({ editType, ...source, cropParams }) });
export const analyzeImage = (id: string) => request<AnalysisResponse>(`/products/${id}/analyze-image`, { method: 'POST', body: JSON.stringify({}) });
export const generateCatalogue = (id: string) => request<CatalogueResponse>(`/products/${id}/generate-catalogue`, { method: 'POST' });
export const recommendPrice = async (id: string) => { const result = await request<Omit<PriceResponse, 'estimatedCost' | 'marketRangeLow' | 'marketRangeHigh' | 'recommendedPrice' | 'lineItems'>>(`/products/${id}/recommend-price`, { method: 'POST' }); return { ...result, estimatedCost: result.breakdown.estimatedCost, marketRangeLow: result.comparableProductRange.low, marketRangeHigh: result.comparableProductRange.high, recommendedPrice: result.suggestedPrice, lineItems: [{ label: 'Material', value: `INR ${result.breakdown.material}` }, { label: 'Labour', value: `INR ${result.breakdown.labour}` }, { label: 'Packaging', value: `INR ${result.breakdown.packaging}` }, { label: 'Comparable range', value: `INR ${result.comparableProductRange.low} - INR ${result.comparableProductRange.high}`, note: result.comparableProductRange.note }] }; };
export const getArtisanProducts = (id: string, status = '') => request<ApiProduct[]>(`/artisans/${id}/products${status ? `?status=${encodeURIComponent(status)}` : ''}`);
export const getProduct = (id: string) => request<ApiProduct>(`/products/${id}`);
export const getArtisan = (id: string) => request<ApiArtisan>(`/artisans/${id}`);
export const updateArtisan = (id: string, data: Partial<ApiArtisan>) => request<ApiArtisan>(`/artisans/${id}`, { method: 'PUT', body: JSON.stringify(data) });