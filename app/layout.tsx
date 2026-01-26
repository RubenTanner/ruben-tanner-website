import React from "react";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Ruben Tanner | Technology Programme Graduate @ Tesco",
  description:
    "Graduate Technology Programme Manager at Tesco. Software Engineer & Tech Enthusiast. Building digital experiences with clean code and creative solutions.",
  keywords:
    "software engineer, technology programme, Tesco, web development, portfolio, ruben tanner, project management",
  authors: [{ name: "Ruben Tanner" }],
  openGraph: {
    title: "Ruben Tanner | Technology Programme Graduate @ Tesco",
    description:
      "Graduate Technology Programme Manager at Tesco. Software Engineer & Tech Enthusiast.",
    url: "https://ruben-tanner.uk",
    siteName: "Ruben Tanner",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#467ceb" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
