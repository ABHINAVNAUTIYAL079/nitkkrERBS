"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to unified login page
export default function SignInRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/login");
    }, [router]);
    return null;
}
