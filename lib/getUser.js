import { verifyToken } from "@/lib/jwt";

export function getUserFromRequest(req) {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return null;
    return verifyToken(token);
}
