import type { Metadata, Viewport } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import LoadingScreen from "./components/LoadingScreen";

// "On file" type system: one sans in upright + italic for everything people read,
// and a typewriter mono for tabs, labels and figures (the file-folder voice).
const sans = Instrument_Sans({
  variable: "--font-sans-face",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-face",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capstack · What’s your business really worth?",
  description:
    "Know what your business is worth. Answer a few plain questions and get a valuation range in Naira, with every reason written down.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-ink">
        <LoadingScreen />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
