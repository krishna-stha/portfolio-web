import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Krishna Sharan Shrestha — AI / ML Enthusiast",
  description: "Portfolio of Krishna Sharan Shrestha, AI and ML enthusiast."
};

// Applied before paint so the saved theme never flashes the wrong palette.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("ks_theme");
    var theme = saved === "light" || saved === "dark" ? saved : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get("x-nonce") ?? undefined;
  return (
    <html lang="en" data-theme="light" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
