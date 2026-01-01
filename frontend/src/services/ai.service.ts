import { axiosInstance } from "./axios.config";
import type { AICheckResponse } from "../types/ai.types";

export interface ContextMessage {
    sender: "user" | "other";
    text: string;
}

class AIService {
    async checkCulture(text: string, context?: ContextMessage[]): Promise<AICheckResponse> {
        try {
            const response = (await axiosInstance.post("/ai/check-culture", {
                text,
                context,
            })) as { culturalNotes: string; suggestions: AICheckResponse["suggestions"] };
            return {
                originalText: text,
                culturalNotes: response.culturalNotes,
                suggestions: response.suggestions,
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
}

export const aiService = new AIService();
