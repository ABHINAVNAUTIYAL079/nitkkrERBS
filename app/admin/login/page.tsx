"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page now redirects to the unified login page
export default function AdminLoginRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/login");
    }, [router]);
    return null;
}
