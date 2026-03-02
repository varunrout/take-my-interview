import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Take My Interview — AI Interview Training Coach",
  description: "Elite AI Interview Training Coach powered by GPT-4o",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
