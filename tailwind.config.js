/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,jsx,mdx}",
        "./components/**/*.{js,jsx,mdx}",
        "./app/**/*.{js,jsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#fffbeb",
                    100: "#fef3c7",
                    200: "#fde68a",
                    300: "#fcd34d",
                    400: "#fbbf24",
                    500: "#f59e0b",
                    600: "#d97706",
                    700: "#b45309",
                    800: "#92400e",
                    900: "#78350f",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
