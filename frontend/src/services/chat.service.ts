import { axiosInstance } from "./axios.config";

export interface ChatUser {
    userId: string;
    fullName: string;
    email: string;
    avatar?: string;
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
    content: string | null;
    createdAt: string;
    aiAnalysisContent?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
}

class ChatService {
    // Post file to upload
    async uploadFile(file: File): Promise<{ url: string; name: string; type: string }> {
        const formData = new FormData();
        formData.append("file", file);
        return axiosInstance.post("/chats/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
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

    async analyzeMessage(messageId: string, displayLanguage: "vi" | "jp"): Promise<any> {
        return axiosInstance.post(`/chats/messages/${messageId}/analyze`, { displayLanguage });
    }

    async initChat(partnerId: string): Promise<ChatSession> {
        return axiosInstance.post("/chats/init", { partnerId });
    }
}

export const chatService = new ChatService();
