import jwt from "jsonwebtoken";
import environments from "../environments";

interface TokenPayload {
    id: number;
    email: string;
    name: string;
    role: string;
}

const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, environments.JWT_SECRET!, {
        expiresIn: (environments.JWT_EXPIRES_IN ||
            "24h") as jwt.SignOptions["expiresIn"],
        issuer: "mh-admin-server",
        audience: "mh-admin-server",
        algorithm: "HS256",
    });
};

const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, environments.JWT_SECRET as string) as TokenPayload;
};

export { generateToken, verifyToken, TokenPayload };
