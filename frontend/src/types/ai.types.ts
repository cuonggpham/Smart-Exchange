export interface AISuggestion {
    id: string;
    level: "polite" | "casual" | "formal";
    levelLabel: string;
    text: string;
}

export interface ConversationSummary {
    summary: string;
    messageCount: number;
    lastUpdated: string;
}

export interface AICheckResponse {
    originalText: string;
    culturalNotes: string;
    suggestions: AISuggestion[];
    conversationSummary?: ConversationSummary;
}

export interface ContextMessage {
    sender: "user" | "other";
    text: string;
}

export interface AICheckRequest {
    text: string;
    context?: ContextMessage[];
    conversationId?: string;
    existingSummary?: string;
    displayLanguage?: "vi" | "jp";
}
