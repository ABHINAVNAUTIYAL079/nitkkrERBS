import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "nitkkr_erickshaw_jwt_secret_key_2024_secure";

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export const requireAuth = (role) => {
    return (req, res, next) => {
        const token = req.cookies.auth_token;
        
        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = verifyToken(token);
        if (!user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        if (role && user.role !== role) {
            return res.status(403).json({ message: "Forbidden: Insufficient privileges" });
        }

        req.user = user;
        next();
    };
};

export const getUserFromRequest = (req) => {
    const token = req.cookies.auth_token;
    if (!token) return null;
    return verifyToken(token);
};
