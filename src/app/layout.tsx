import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { SidebarWrapper } from "@/components/layout/SidebarWrapper";
import { RoleProvider } from "@/components/auth/RoleProvider";

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
      <body className="antialiased bg-white">
        <RoleProvider>
          <Header />
          <div className="max-w-[1440px] mx-auto flex pt-14 min-h-screen bg-background">
            <SidebarWrapper />
            <main className="flex-1 bg-background">
              {children}
            </main>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
