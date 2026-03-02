"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        // Read saved preference or system preference
        const saved = localStorage.getItem("theme") as Theme | null;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = saved ?? "dark";
        setTheme(initial);
        document.documentElement.classList.toggle("dark", initial === "dark");
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("theme", next);
            document.documentElement.classList.toggle("dark", next === "dark");
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
