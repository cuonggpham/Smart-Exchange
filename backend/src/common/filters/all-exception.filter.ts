import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const isHttpException = exception instanceof HttpException;
        const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = isHttpException ? (exception.getResponse() as any) : null;

        const code = exceptionResponse?.code || status;
        const data = exceptionResponse?.data || {
            message: exception.message || "Internal server error",
        };

        response.status(status).json({
            code,
            data,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
