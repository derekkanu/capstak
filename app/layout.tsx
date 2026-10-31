import type { Metadata, Viewport } from "next";
import { Inter_Tight, Faustina, Geist_Mono } from "next/font/google";
import "./globals.css";
import LoadingScreen from "./components/LoadingScreen";

// Free stand-ins for Exa's Dinamo faces. To switch to the licensed fonts
// later, replace these with next/font/local and keep the same CSS variables.
// Body / UI: Inter Tight (≈ ABC Diatype).
const sans = Inter_Tight({
  variable: "--font-sans-face",
  subsets: ["latin"],
});

// Headlines: Faustina at regular weight (≈ ABC Arizona Flare): sturdy,
// low-contrast, softly flared serifs.
const display = Faustina({
  variable: "--font-display-face",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Numbers in data cards and charts.
const mono = Geist_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capstak — Effortless Business Valuations",
  description:
    "Unlock your business's true value with ease and confidence. A free, streamlined valuation today.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-ink">
        <LoadingScreen />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
