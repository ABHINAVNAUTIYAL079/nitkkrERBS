import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "nitkkr_erickshaw_jwt_secret_key_2024_secure"
);

interface TokenPayload {
    id: string;
    role: "admin" | "driver" | "user";
    name: string;
}

async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value;

    // Protect /admin/* routes
    if (pathname.startsWith("/admin")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        const user = await verifyTokenEdge(token);
        if (!user || user.role !== "admin") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Protect /driver/* routes (except /driver/register)
    if (pathname.startsWith("/driver") && pathname !== "/driver/register") {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        const user = await verifyTokenEdge(token);
        if (!user || user.role !== "driver") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Protect /dashboard for verified students
    if (pathname.startsWith("/dashboard")) {
        if (!token) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        const user = await verifyTokenEdge(token);
        if (!user || user.role !== "user") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/driver/:path*", "/dashboard/:path*"],
};
