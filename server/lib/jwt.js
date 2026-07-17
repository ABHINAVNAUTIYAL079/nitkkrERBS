import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nitkkr_erickshaw_jwt_secret_key_2024_secure";

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}
