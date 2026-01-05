import { axiosInstance } from "./axios.config";
import type { AICheckResponse, ContextMessage, ConversationSummary } from "../types/ai.types";
import i18n from "../i18n";

export type { ContextMessage };

export interface ReceivedMessageAnalysis {
    translatedText: string;
    intentSummary: string;
    culturalNote: string;
    isIndirectExpression: boolean;
}

interface AICheckApiResponse {
    culturalNotes: string;
    suggestions: AICheckResponse["suggestions"];
    conversationSummary?: ConversationSummary;
}

class AIService {
    private getDisplayLanguage(): "vi" | "jp" {
        const lang = i18n.language;
        return lang === "vi" ? "vi" : "jp";
    }

    async checkCulture(
        text: string,
        context?: ContextMessage[],
        existingSummary?: string,
        conversationId?: string,
        contextDescription?: string
    ): Promise<AICheckResponse> {
        try {
            const response = (await axiosInstance.post("/ai/check-culture", {
                text,
                context,
                existingSummary,
                conversationId,
                contextDescription,
                displayLanguage: this.getDisplayLanguage(),
            })) as AICheckApiResponse;

            return {
                originalText: text,
                culturalNotes: response.culturalNotes,
                suggestions: response.suggestions,
                conversationSummary: response.conversationSummary,
            };
        } catch (error) {
            console.error("AI check culture error:", error);
            return {
                originalText: text,
                culturalNotes: "Không thể kiểm tra văn hóa lúc này.",
                suggestions: [],
            };
        }
    }

    async analyzeReceived(
        text: string,
        contextDescription?: string,
        conversationHistory?: ContextMessage[]
    ): Promise<ReceivedMessageAnalysis> {
        try {
            return await axiosInstance.post("/ai/analyze-received", {
                text,
                contextDescription,
                conversationHistory,
                displayLanguage: this.getDisplayLanguage(),
            });
        } catch (error) {
            console.error("AI analyze received error:", error);
            return {
                translatedText: "Không thể phân tích tin nhắn lúc này.",
                intentSummary: "",
                culturalNote: "",
                isIndirectExpression: false,
            };
        }
    }

    async getStatus(): Promise<{ available: boolean; timestamp: string }> {
        try {
            return await axiosInstance.get("/ai/status");
        } catch {
            return { available: false, timestamp: new Date().toISOString() };
        }
    }
}

export const aiService = new AIService();

