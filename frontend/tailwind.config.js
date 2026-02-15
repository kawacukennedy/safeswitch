/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-green': '#39ff14',
                'neon-pink': '#ff00ff',
                'neon-blue': '#00ffff',
            },
            fontFamily: {
                mono: ['Courier New', 'Courier', 'monospace'],
            },
        },
    },
    plugins: [],
}
