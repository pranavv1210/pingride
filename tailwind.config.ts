import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#181C1F",
        graphite: "#2B3035",
        line: "#E7ECE9",
        mist: "#F5F8F6",
        whatsapp: "#25D366",
        emeraldSoft: "#DDF8E9",
      },
      boxShadow: {
        phone: "0 34px 90px rgba(24, 28, 31, 0.18)",
        premium: "0 18px 60px rgba(24, 28, 31, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
