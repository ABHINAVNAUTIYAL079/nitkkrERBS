"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to unified login page
export default function DriverLoginRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace("/login");
    }, [router]);
    return null;
}
