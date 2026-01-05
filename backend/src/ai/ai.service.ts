import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import * as z from "zod";

import { AISuggestion, AICheckResponse, ContextMessage, ConversationSummary, AICheckWithSummaryRequest, AICheckWithSummaryResponse, ReceivedMessageAnalysis, getAISuggestionSchema, getAICheckResponseSchema, getConversationSummarySchema, getReceivedMessageAnalysisSchema } from "./types/ai.types";
import { getSystemPrompt, getSummarySystemPrompt, getReceivedMessagePrompt } from "./prompts/ai.prompts";


const MAX_MESSAGES_BEFORE_SUMMARY = 10;
const MAX_CONTEXT_MESSAGES = 5;
const MAX_TEXT_LENGTH = 500;

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private chatModel?: ChatOpenAI;
    private summaryModel?: ChatOpenAI;

    constructor(private configService: ConfigService) {
        this.initializeModels();
    }

    private initializeModels(): void {
        const apiKey = this.configService.get<string>("OPENAI_API_KEY");
        const baseURL = this.configService.get<string>("OPENAI_BASE_URL");
        const modelName = this.configService.get<string>("OPENAI_MODEL") || "gpt-4o-mini";
        const summaryModelName = this.configService.get<string>("OPENAI_SUMMARY_MODEL") || modelName;

        if (!apiKey) {
            this.logger.warn("OPENAI_API_KEY not configured - AI service disabled");
            return;
        }

        const modelConfig = {
            apiKey,
            ...(baseURL && { configuration: { baseURL } }),
        };

        this.chatModel = new ChatOpenAI({
            ...modelConfig,
            model: modelName,
            temperature: 0.7,
        });

        this.summaryModel = new ChatOpenAI({
            ...modelConfig,
            model: summaryModelName,
            temperature: 0.3,
        });

        this.logger.log(`AI Service initialized with model: ${modelName}, base URL: ${baseURL || "default"}`);
    }

    /**
     * Check cultural context of a Japanese text with optional conversation summary
     */
    async checkCulture(text: string, context?: ContextMessage[], displayLanguage: "vi" | "jp" = "vi"): Promise<AICheckResponse> {
        if (!this.chatModel) {
            return this.getDefaultResponse("AI service is not configured.");
        }

        if (!text?.trim()) {
            return this.getDefaultResponse("Content is empty.");
        }

        try {
            const messages = this.buildCultureCheckMessages(text, context, undefined, displayLanguage);
            const structuredModel = this.chatModel.withStructuredOutput(getAICheckResponseSchema(displayLanguage));
            const response = await structuredModel.invoke(messages);

            return {
                culturalNotes: response.culturalNotes,
                suggestions: response.suggestions.map((s, idx) => ({
                    ...s,
                    id: s.id || String(idx + 1),
                })),
            };
        } catch (error) {
            this.logger.error("Culture check error:", error);
            return this.getDefaultResponse();
        }
    }

    /**
     * Check cultural context with automatic conversation summarization
     * When message count exceeds threshold, generates a summary for efficient context management
     */
    async checkCultureWithSummary(request: AICheckWithSummaryRequest): Promise<AICheckWithSummaryResponse> {
        const { text, context, existingSummary, displayLanguage } = request;

        if (!this.chatModel) {
            return {
                ...this.getDefaultResponse("AI service is not configured."),
            };
        }

        if (!text?.trim()) {
            return {
                ...this.getDefaultResponse("Content is empty."),
            };
        }

        try {
            // Build messages with summary context and user-defined context if available
            const messages = this.buildCultureCheckMessages(text, context, existingSummary, displayLanguage, request.contextDescription);
            const structuredModel = this.chatModel.withStructuredOutput(getAICheckResponseSchema(displayLanguage));
            const response = await structuredModel.invoke(messages);

            const result: AICheckWithSummaryResponse = {
                culturalNotes: response.culturalNotes,
                suggestions: response.suggestions.map((s, idx) => ({
                    ...s,
                    id: s.id || String(idx + 1),
                })),
            };

            // Generate summary if context exceeds threshold
            const contextLength = context?.length || 0;
            if (contextLength >= MAX_MESSAGES_BEFORE_SUMMARY) {
                const summary = await this.generateConversationSummary(context!, existingSummary, displayLanguage);
                if (summary) {
                    result.conversationSummary = {
                        summary: summary.summary,
                        messageCount: contextLength,
                        lastUpdated: new Date(),
                    };
                }
            }

            return result;
        } catch (error) {
            this.logger.error("Culture check with summary error:", error);
            return {
                ...this.getDefaultResponse(),
            };
        }
    }

    /**
     * Generate a summary of the conversation history
     */
    async generateConversationSummary(
        context: ContextMessage[],
        existingSummary?: string,
        displayLanguage: "vi" | "jp" = "vi"
    ): Promise<{ summary: string; keyTopics: string[]; relationshipContext: string } | null> {
        if (!this.summaryModel || context.length === 0) {
            return null;
        }

        try {
            const conversationText = context
                .map((msg) => `${msg.sender === "user" ? "自分" : "相手"}: ${msg.text}`)
                .join("\n");

            let summaryPrompt = `以下の会話を分析して要約してください：\n\n${conversationText}`;
            if (existingSummary) {
                summaryPrompt = `以前の会話の要約：\n${existingSummary}\n\n新しい会話の内容：\n${conversationText}\n\n上記を踏まえて、全体の要約を更新してください。`;
            }

            const structuredSummaryModel = this.summaryModel.withStructuredOutput(getConversationSummarySchema(displayLanguage));
            const response = (await structuredSummaryModel.invoke([
                new SystemMessage(getSummarySystemPrompt(displayLanguage)),
                new HumanMessage(summaryPrompt),
            ])) as { summary: string; keyTopics: string[]; relationshipContext: string };

            return response;
        } catch (error) {
            this.logger.error("Summarization error:", error);
            return null;
        }
    }

    /**
     * Build message array for culture check request
     */
    private buildCultureCheckMessages(
        text: string,
        context?: ContextMessage[],
        existingSummary?: string,
        displayLanguage: "vi" | "jp" = "vi",
        contextDescription?: string
    ): BaseMessage[] {
        const messages: BaseMessage[] = [new SystemMessage(getSystemPrompt(displayLanguage))];

        // Add user-defined context description if available
        if (contextDescription) {
            messages.push(
                new SystemMessage(
                    `## ユーザーが設定した会話の背景:\n${contextDescription}`
                )
            );
        }

        // Add summary context if available
        if (existingSummary) {
            messages.push(
                new SystemMessage(
                    `## 会話の要約（これまでの文脈）:\n${existingSummary}`
                )
            );
        }

        // Add recent conversation context
        if (context && context.length > 0) {
            const recentContext = context.slice(-MAX_CONTEXT_MESSAGES);
            const contextText = recentContext
                .map((msg) => `${msg.sender === "user" ? "自分" : "相手"}: ${msg.text}`)
                .join("\n");

            messages.push(
                new SystemMessage(`## 最近の会話履歴（参考用・最新${recentContext.length}件）:\n${contextText}`)
            );
        }

        // Add the text to analyze - this is what the user is ABOUT TO SEND
        messages.push(
            new HumanMessage(
                `## これから送信しようとしているメッセージ（このテキストに対して提案してください）:\n「${text.slice(0, MAX_TEXT_LENGTH)}」`
            )
        );

        return messages;
    }

    /**
     * Analyze a received Japanese message for Vietnamese user
     * Extracts hidden subjects, decodes intent, and provides cultural context
     */
    async analyzeReceivedMessage(
        japaneseText: string,
        contextDescription?: string,
        conversationHistory?: ContextMessage[],
        displayLanguage: "vi" | "jp" = "vi"
    ): Promise<ReceivedMessageAnalysis> {
        if (!this.chatModel) {
            return this.getDefaultReceivedAnalysis("AI service is not configured.");
        }

        if (!japaneseText?.trim()) {
            return this.getDefaultReceivedAnalysis("Content is empty.");
        }

        try {
            const messages: BaseMessage[] = [new SystemMessage(getReceivedMessagePrompt(displayLanguage))];

            // Add user-defined context if available
            if (contextDescription) {
                messages.push(
                    new SystemMessage(`## 会話の背景（ユーザーが設定）:\n${contextDescription}`)
                );
            }

            // Add conversation history
            if (conversationHistory && conversationHistory.length > 0) {
                const recentContext = conversationHistory.slice(-MAX_CONTEXT_MESSAGES);
                const contextText = recentContext
                    .map((msg) => `${msg.sender === "user" ? "自分" : "相手"}: ${msg.text}`)
                    .join("\n");
                messages.push(
                    new SystemMessage(`## 最近の会話履歴：\n${contextText}`)
                );
            }

            // Add the message to analyze
            messages.push(
                new HumanMessage(
                    `## 分析する受信メッセージ：\n「${japaneseText.slice(0, MAX_TEXT_LENGTH)}」`
                )
            );

            const structuredModel = this.chatModel.withStructuredOutput(getReceivedMessageAnalysisSchema(displayLanguage));
            const response = (await structuredModel.invoke(messages)) as ReceivedMessageAnalysis;

            return response;
        } catch (error) {
            this.logger.error("Received message analysis error:", error);
            return this.getDefaultReceivedAnalysis();
        }
    }

    /**
     * Get default response for received message analysis errors
     */
    private getDefaultReceivedAnalysis(note = "Try again later."): ReceivedMessageAnalysis {
        return {
            translatedText: note,
            intentSummary: "",
            culturalNote: "",
            isIndirectExpression: false,
        };
    }

    /**
     * Get default response for error cases
     */
    private getDefaultResponse(note = "Try again later."): AICheckResponse {
        return {
            culturalNotes: note,
            suggestions: [],
        };
    }

    /**
     * Check if AI service is available
     */
    isAvailable(): boolean {
        return !!this.chatModel;
    }
}
