import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      zIndex: {
        'overlay': '40',
        'sidebar': '50',
        'dropdown': '100',
        'sticky': '200',
        'modal-backdrop': '900',
        'modal': '1000',
        'toast': '1100',
        'tooltip': '1200',
      },
    },
  },
  plugins: [],
} satisfies Config;
