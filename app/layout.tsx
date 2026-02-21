import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "모담(MODAM) | AI 기반 탈모 자가진단 및 맞춤 관리",
  description:
    "두피 사진으로 AI 자가진단, 맞춤 관리 추천, 제품 정보, 커뮤니티, 전문가 연계까지 한 플랫폼에서.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#94AC3A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
