/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'cyber-dark': '#0a0e1a',
                'cyber-blue': '#00f0ff',
                'cyber-purple': '#a855f7',
                'cyber-red': '#ff3366',
            },
        },
    },
    plugins: [],
}
