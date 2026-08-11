import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // On désactive le reset global de Tailwind pour ne pas interférer
  // avec les styles existants du site (pages/ + styles/globals.css).
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
export default config;
