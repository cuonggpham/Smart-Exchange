import * as z from "zod";

export interface AISuggestion {
    id: string;
    level: "polite" | "casual" | "formal";
    levelLabel: string;
    text: string;
}

export interface AICheckResponse {
    culturalNotes: string;
    suggestions: AISuggestion[];
}

export interface ContextMessage {
    sender: "user" | "other";
    text: string;
}

export interface ConversationSummary {
    summary: string;
    messageCount: number;
    lastUpdated: Date;
}

export interface AICheckWithSummaryRequest {
    text: string;
    context?: ContextMessage[];
    conversationId?: string;
    existingSummary?: string;
    displayLanguage?: "vi" | "jp";
    contextDescription?: string;  // User-defined context
}

export interface AICheckWithSummaryResponse extends AICheckResponse {
    conversationSummary?: ConversationSummary;
}

export interface ReceivedMessageAnalysis {
    translatedText: string;      // Vietnamese translation with [subjects] inline
    intentSummary: string;       // Brief summary of the real intent
    culturalNote: string;        // Cultural context note
    isIndirectExpression: boolean; // True if the message uses indirect/polite refusal etc.
}


export const getAISuggestionSchema = (displayLanguage: "vi" | "jp" = "vi") => {
    const labelLang = displayLanguage === "jp" ? "日本語" : "ベトナム語";
    return z.object({
        id: z.string().describe("Unique identifier for the suggestion"),
        level: z.enum(["polite", "casual", "formal"]).describe("Politeness level"),
        levelLabel: z.string().describe(`Human-readable label for the level in ${labelLang}`),
        text: z.string().describe("The suggested expression"),
    });
};

export const getAICheckResponseSchema = (displayLanguage: "vi" | "jp" = "vi") => {
    const outputLang = displayLanguage === "jp" ? "Japanese" : "Vietnamese";
    return z.object({
        culturalNotes: z.string().describe(`Cultural explanation in ${outputLang}, max 5 lines`),
        suggestions: z.array(getAISuggestionSchema(displayLanguage)).describe("2-3 alternative expressions"),
    });
};

export const getConversationSummarySchema = (displayLanguage: "vi" | "jp" = "vi") => {
    const outputLang = displayLanguage === "jp" ? "Japanese" : "Vietnamese";
    return z.object({
        summary: z.string().describe(`Concise summary of the conversation in ${outputLang}`),
        keyTopics: z.array(z.string()).describe("Main topics discussed"),
        relationshipContext: z.string().describe("Inferred relationship context (formal/casual/business)"),
    });
};

export const getReceivedMessageAnalysisSchema = (displayLanguage: "vi" | "jp" = "vi") => {
    const outputLang = displayLanguage === "jp" ? "Japanese" : "Vietnamese";
    return z.object({
        translatedText: z.string().describe(`${outputLang} translation with inferred subjects in [brackets]`),
        intentSummary: z.string().describe(`Brief explanation of the real intent in ${outputLang}, 1-2 sentences`),
        culturalNote: z.string().describe(`Cultural context note in ${outputLang}, 1-2 sentences`),
        isIndirectExpression: z.boolean().describe("True if the message uses indirect expression, polite refusal, or euphemism"),
    });
};
