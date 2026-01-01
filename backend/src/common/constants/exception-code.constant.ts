export const ExceptionCode = {
    UNKNOWN_ERROR: { code: 1000, msg: "Unknown error", status: 500 },
    VALIDATION_ERROR: { code: 1001, msg: "Validation failed", status: 400 },
    NOT_FOUND: { code: 1002, msg: "Resource not found", status: 404 },
    UNAUTHORIZED: { code: 1003, msg: "Unauthorized access", status: 401 },
    FORBIDDEN: { code: 1004, msg: "Forbidden access", status: 403 },
    CONFLICT: { code: 1005, msg: "Conflict error", status: 409 },
    BAD_REQUEST: { code: 1006, msg: "Bad request", status: 400 },
    INTERNAL_SERVER_ERROR: { code: 1007, msg: "Internal server error", status: 500 },

    INVALID_PASSWORD: { code: 1008, msg: "Password is incorrect", status: 401 },
    USER_NOT_FOUND: { code: 1010, msg: "User not found", status: 404 },
    ACCESS_DENIED: { code: 1009, msg: "Access denied", status: 403 },
    TOKEN_FAILED: { code: 4000, msg: "Token validation failed", status: 401 },
    HASHING_FAILED: { code: 4001, msg: "Hashing failed", status: 500 },
} as const;
