export interface Message {
    id: string;
    sender: "user" | "other";
    text: string;
    timestamp: string;
    avatar?: string;
}
