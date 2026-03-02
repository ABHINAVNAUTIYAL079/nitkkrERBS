import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeBackground from "@/components/ThemeBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NIT KKR E-Rickshaw Booking",
    description: "Book an electric rickshaw on NIT Kurukshetra campus",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                {/* Prevent flash of wrong theme by reading preference before paint */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function(){
                        try {
                            var t = localStorage.getItem('theme');
                            if (t === 'light') {
                                document.documentElement.classList.remove('dark');
                            }
                        } catch(e){}
                    })();
                `}} />
            </head>
            <body className={inter.className}>
                <ThemeProvider>
                    <ThemeBackground />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#1e293b",
                                color: "#f8fafc",
                                borderRadius: "12px",
                                border: "1px solid #334155",
                            },
                            success: {
                                iconTheme: { primary: "#22c55e", secondary: "#fff" },
                            },
                            error: {
                                iconTheme: { primary: "#ef4444", secondary: "#fff" },
                            },
                        }}
                    />
                    <div className="relative z-10">{children}</div>
                </ThemeProvider>
            </body>
        </html>
    );
}
