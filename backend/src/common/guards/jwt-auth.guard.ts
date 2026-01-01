import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ExceptionCode } from "../constants/exception-code.constant";
import { AppException } from "../exceptions/app.exception";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    handleRequest<TUser = any>(err: any, user: any): TUser {
        if (err || !user) {
            throw err || new AppException(ExceptionCode.UNAUTHORIZED);
        }
        return user;
    }
}
