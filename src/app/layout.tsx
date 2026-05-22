import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfitFont = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "GearMatch - Chọn Thiết Bị Theo Nhu Cầu Thông Minh",
  description: "Trải nghiệm hệ thống gợi ý và so sánh điện thoại, máy tính bảng, laptop và cấu hình PC phù hợp nhất với nhu cầu và ngân sách của bạn.",
  openGraph: {
    title: "GearMatch - Chọn Thiết Bị Theo Nhu Cầu Thông Minh",
    description: "Hệ thống tư vấn phần cứng và so sánh cấu hình tối ưu nhất cho học tập, chơi game, đồ họa, lập trình và AI.",
    type: "website",
    locale: "vi_VN",
    siteName: "GearMatch",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${outfitFont.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text font-sans selection:bg-brand-primary/30 selection:text-white">
        {/* Animated ambient tech gradient background */}
        <div className="animated-bg" />
        
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-grow z-10 relative">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
