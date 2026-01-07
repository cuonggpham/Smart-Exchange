import { axiosInstance } from "./axios.config";

export interface SuggestionHistoryItem {
    historyId: string;
    receiverName: string;
    chatId?: string;
    contextDescription?: string;
    originalText: string;
    selectedSuggestion: string;
    suggestionLevel: 'polite' | 'casual' | 'formal';
    culturalNotes?: string;
    createdAt: string;
}

export interface HistoryListResponse {
    items: SuggestionHistoryItem[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateHistoryRequest {
    receiverName: string;
    chatId?: string;
    contextDescription?: string;
    originalText: string;
    selectedSuggestion: string;
    suggestionLevel: 'polite' | 'casual' | 'formal';
    culturalNotes?: string;
}

class HistoryService {
    async getHistory(
        page = 1,
        limit = 20,
        receiver?: string,
        startDate?: string,
        endDate?: string
    ): Promise<HistoryListResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (receiver) params.append('receiver', receiver);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return axiosInstance.get(`/history?${params.toString()}`);
    }

    async createHistory(data: CreateHistoryRequest): Promise<SuggestionHistoryItem> {
        return axiosInstance.post('/history', data);
    }

    async deleteHistory(historyId: string): Promise<{ success: boolean }> {
        return axiosInstance.delete(`/history/${historyId}`);
    }

    async getReceivers(): Promise<string[]> {
        return axiosInstance.get('/history/receivers');
    }
}

export const historyService = new HistoryService();
