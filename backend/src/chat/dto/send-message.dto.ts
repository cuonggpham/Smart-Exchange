import { IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
    @IsString()
    chatId?: string;

    @IsString()
    @IsNotEmpty({ message: "Receiver ID is required" })
    receiverId: string;

    @IsString()
    content?: string;

    @IsNotEmpty()
    attachment?: {
        url: string;
        name: string;
        type: string;
    };
}
