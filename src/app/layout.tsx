import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "마감재 & 업체 통합 관리 시스템",
  description: "인테리어 마감재 및 협력업체 통합 관리 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Header />
        <Sidebar />
        <main className="ml-72 min-h-screen bg-background pt-14">{children}</main>
      </body>
    </html>
  );
}
