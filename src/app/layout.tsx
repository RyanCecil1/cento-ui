import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Montserrat,
  Poppins,
} from "next/font/google";
import "./globals.css";

const bodySans = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

const displaySans = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

const monoSans = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Menlo", "Monaco", "monospace"],
});

export const metadata: Metadata = {
  title: "Cento",
  description:
    "Cento is a premium SMS workspace for campaigns, credits, reporting, and AI-assisted messaging.",
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("cento-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodySans.variable} ${displaySans.variable} ${monoSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
