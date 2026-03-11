import type { Metadata } from "next";
import { Inter } from "next/font/google";


// Load the Inter font optimized by Next.js
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Updated SEO Metadata for your Pastebin
export const metadata: Metadata = {
  title: "Simple Pastebin | Fast & Secure",
  description: "A sleek, modern pastebin to securely share your text snippets in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
        style={{
          backgroundColor: "#0f172a", // Deep dark background to match the new UI
          color: "#f8fafc",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
