"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-sans)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(80px, 20vw, 200px)",
          fontWeight: 800,
          color: "var(--accent)",
          lineHeight: 1,
          margin: 0,
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 700,
          marginTop: "16px",
          marginBottom: "8px",
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "18px",
          maxWidth: "400px",
          marginBottom: "32px",
        }}
      >
        {"The page you're looking for doesn't exist or has been moved."}
      </p>

      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "16px 32px",
          background: "var(--accent)",
          color: "white",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "16px",
          textDecoration: "none",
          transition: "all 0.2s",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      <style jsx>{`
        a:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(70, 124, 235, 0.3);
        }
      `}</style>
    </div>
  );
}
