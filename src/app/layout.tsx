import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "claude-sessions",
  description: "CLI Terminal Session Manager - Kanban UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-body">{children}</body>
    </html>
  );
}
