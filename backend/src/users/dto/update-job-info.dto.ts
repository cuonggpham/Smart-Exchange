import { IsString, IsNotEmpty, MaxLength, IsOptional } from "class-validator";

export class UpdateJobInfoDto {
    @IsOptional()
    @IsString()
    @MaxLength(200, { message: "Career information must not exceed 200 characters" })
    career?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200, { message: "Position information must not exceed 200 characters" })
    position?: string;
}
