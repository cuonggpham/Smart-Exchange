import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateContextDto {
    @ApiProperty({
        description: "Free-text description of the conversation context",
        example: "Đối phương là sếp trưởng bộ phận (Bucho), đang giận vì tôi nộp báo cáo muộn.",
        maxLength: 2000,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    contextDescription: string;
}

export class CreateTemplateDto {
    @ApiProperty({
        description: "Name of the template for easy identification",
        example: "Sếp Nhật khó tính",
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    templateName: string;

    @ApiProperty({
        description: "Template content - the context description text",
        example: "Đối phương là sếp khó tính, cần dùng keigo cao nhất.",
        maxLength: 2000,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    description: string;
}
