import { IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
    @IsString()
    chatId?: string;

    @IsString()
    @IsNotEmpty({ message: "Receiver ID is required" })
    receiverId: string;

    @IsString()
    @IsNotEmpty({ message: "Content cannot be empty" })
    content: string;
}
