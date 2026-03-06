import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "nitkkr_erickshaw_jwt_secret_key_2024_secure"
);

async function verifyTokenEdge(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}

export async function middleware(request) {
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
