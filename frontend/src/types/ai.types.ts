export interface AISuggestion {
    id: string;
    level: "polite" | "casual" | "formal";
    levelLabel: string;
    text: string;
}

export interface AICheckResponse {
    originalText: string;
    culturalNotes: string;
    suggestions: AISuggestion[];
}

export interface AICheckRequest {
    text: string;
    targetLanguage: "ja" | "vi";
}
