import type { Metadata } from "next";
import { ReduxProvider } from "@/store/Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "홍익 Playground",
  description: "홍익 프로그래밍 언어 온라인 플레이그라운드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
