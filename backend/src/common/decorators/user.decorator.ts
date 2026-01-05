import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Custom decorator to extract user data from the JWT-authenticated request
 * Usage: @User() user or @User('userId') userId
 */
export const User = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return null;
        }

        return data ? user[data] : user;
    }
);
