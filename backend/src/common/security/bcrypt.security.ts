import * as bcrypt from "bcrypt";

export class BcryptSecurity {
    private static readonly SALT_ROUNDS = 12;
    private static readonly PEPPER = process.env.BCRYPT_PEPPER || "default_pepper";

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password + this.PEPPER, this.SALT_ROUNDS);
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password + this.PEPPER, hash);
    }
}
