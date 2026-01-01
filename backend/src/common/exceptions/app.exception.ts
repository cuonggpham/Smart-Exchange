import { HttpException } from "@nestjs/common";

export class AppException extends HttpException {
    constructor(exception: { code: number; msg: string; status: number }, customMsg?: string) {
        super(
            {
                code: exception.code,
                data: { message: customMsg || exception.msg },
            },
            exception.status
        );
    }
}
