import { axiosInstance } from "./axios.config";

export interface ChatUser {
    userId: string;
    fullName: string;
    email: string;
}

export interface LastMessage {
    content: string;
    createdAt: string;
}

export interface ChatSession {
    chatId: string;
    userOne: ChatUser;
    userTwo: ChatUser;
    messages: LastMessage[];
    updateAt: string;
}

export interface ChatMessage {
    messageId: string;
    senderId: string;
    content: string;
    createdAt: string;
    aiAnalysisContent?: string; // JSON string of AI analysis
}

class ChatService {
    // Get chat list
    async getMyChats(): Promise<ChatSession[]> {
        return axiosInstance.get("/chats");
    }

    async getMessages(chatId: string): Promise<ChatMessage[]> {
        return axiosInstance.get(`/chats/${chatId}/messages`);
    }

    async getAllUsers(search?: string): Promise<ChatUser[]> {
        const params = search ? { search } : {};
        return axiosInstance.get("/users", { params });
    }

    async deleteMessage(messageId: string): Promise<{ messageId: string; chatId: string }> {
        return axiosInstance.delete(`/chats/messages/${messageId}`);
    }

    async analyzeMessage(messageId: string): Promise<any> {
        return axiosInstance.post(`/chats/messages/${messageId}/analyze`);
    }
}

export const chatService = new ChatService();
