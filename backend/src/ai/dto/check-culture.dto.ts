import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ContextMessage {
    @IsString()
    sender: "user" | "other";

    @IsString()
    text: string;
}

export class CheckCultureDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ContextMessage)
    context?: ContextMessage[];
}
