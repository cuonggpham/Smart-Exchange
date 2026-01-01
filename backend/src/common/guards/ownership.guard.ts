import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { AppException } from "../exceptions/app.exception";
import { ExceptionCode } from "../constants/exception-code.constant";

@Injectable()
export class OwnershipGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        
        if (!user || !user.userId) {
            throw new AppException(ExceptionCode.UNAUTHORIZED, "User not authenticated");
        }

        // Kiểm tra userId từ params (có thể là :id hoặc :userId)
        const resourceUserId = request.params.id || request.params.userId || request.body.userId;

        if (!resourceUserId) {
            throw new AppException(ExceptionCode.BAD_REQUEST, "User ID not provided");
        }

        if (user.userId !== resourceUserId) {
            throw new AppException(ExceptionCode.FORBIDDEN, "You can only access your own resources");
        }

        return true;
    }
}
