import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

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

const GEMINI_PROMPT = `あなたは日本語と日本文化、そしてベトナム語の専門家です。チャットアプリで使われる日本語を分析し、ベトナム人学習者に適切なアドバイスを提供してください。

## 分析の際に必ず考慮すること：

1. **会話の文脈を理解する**: 前後の会話から意味を判断してください。
   - 例: 「ちょっと」= 「待ってね」(ちょっと待って) / 「少し」(ちょっと高い) / 婉曲な断り(誘いに対して「ちょっと...」)
   - 例: 「いい」= 「良い」/ 断りの「いいです」(No, thank you)
   - 例: 「大丈夫」= OK / 断りの「大丈夫です」
   - 例: 「考えておきます」= 実際には断りの意味が多い

2. **ニュアンスを説明**: 直訳では伝わらない微妙なニュアンスをベトナム語で解説

3. **敬語レベル**: ビジネス、日常会話、友達同士などの適切な敬語を判断

4. **文化的背景**: 日本特有の婉曲表現、空気を読む文化などを説明

## 出力規則：
- **必ずJSON形式のみ**で出力
- culturalNotesは**ベトナム語**で5行以内
- suggestionsは2〜3個まで

## JSON形式：
{
  "culturalNotes": "この表現の文脈的な意味と文化的なニュアンスをベトナム語で説明",
  "suggestions": [
    { "id": "1", "level": "polite", "levelLabel": "敬語/丁寧", "text": "丁寧な表現" },
    { "id": "2", "level": "casual", "levelLabel": "普通/カジュアル", "text": "カジュアルな表現" }
  ]
}
`;

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private aiModel?: GoogleGenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>("GEMINI_API_KEY");
        if (!apiKey) {
            this.logger.warn("GEMINI_API_KEY not configured");
            return;
        }
        this.aiModel = new GoogleGenAI({ apiKey });
    }

    async checkCulture(text: string, context?: ContextMessage[]): Promise<AICheckResponse> {
        if (!this.aiModel) {
            return this.getDefaultResponse("AI service is not configured.");
        }

        if (!text?.trim()) {
            return this.getDefaultResponse("Content is empty.");
        }

        // Build context section
        let contextSection = "";
        if (context && context.length > 0) {
            contextSection =
                "## 会話の履歴（最新5件）:\n" +
                context
                    .slice(-5)
                    .map((msg) => `${msg.sender === "user" ? "自分" : "相手"}: ${msg.text}`)
                    .join("\n") +
                "\n\n";
        }

        const fullPrompt =
            GEMINI_PROMPT + contextSection + "## 分析するテキスト:\n" + text.slice(0, 500);

        try {
            const result = await this.aiModel.models.generateContent({
                model: "gemini-2.5-flash",
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.7,
                },
            });

            const responseText = result.text;
            if (!responseText) {
                throw new Error("Gemini returned empty response");
            }

            return JSON.parse(responseText);
        } catch (error) {
            this.logger.error("Gemini error", error);
            return this.getDefaultResponse();
        }
    }

    private getDefaultResponse(note = "Try again later."): AICheckResponse {
        return {
            culturalNotes: note,
            suggestions: [],
        };
    }
}
