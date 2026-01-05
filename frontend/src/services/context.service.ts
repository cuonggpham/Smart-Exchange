import { axiosInstance } from "./axios.config";

export interface ChatContext {
    contextId: string;
    chatId: string;
    contextDescription: string;
    updatedAt: string;
}

export interface ContextTemplate {
    templateId: string;
    userId: string;
    templateName: string;
    description: string;
    createdAt: string;
}

class ContextService {
    // Chat Context operations
    async getContext(chatId: string): Promise<ChatContext | { contextDescription: string }> {
        return axiosInstance.get(`/context/${chatId}`);
    }

    async updateContext(chatId: string, contextDescription: string): Promise<ChatContext> {
        return axiosInstance.put(`/context/${chatId}`, { contextDescription });
    }

    async deleteContext(chatId: string): Promise<void> {
        return axiosInstance.delete(`/context/${chatId}`);
    }

    // Template operations
    async getTemplates(): Promise<ContextTemplate[]> {
        return axiosInstance.get("/context/templates/list");
    }

    async createTemplate(templateName: string, description: string): Promise<ContextTemplate> {
        return axiosInstance.post("/context/templates", { templateName, description });
    }

    async deleteTemplate(templateId: string): Promise<void> {
        return axiosInstance.delete(`/context/templates/${templateId}`);
    }
}

export const contextService = new ContextService();
