import Link from "next/link";
import { Cpu, Heart, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070e] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="p-1.5 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-lg">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-wider text-white">
                GEAR<span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">MATCH</span>
              </span>
            </Link>
            <p className="text-xs text-brand-muted leading-relaxed mb-4">
              Hệ thống tư vấn phần cứng và đề xuất thiết bị thông minh dựa trên nhu cầu sử dụng thực tế của bạn.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-muted hover:text-white transition-colors"
                aria-label="Github"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-muted hover:text-white transition-colors"
                aria-label="Discord"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Thiết Bị</h3>
            <ul className="space-y-2">
              {["Mobile / Điện Thoại", "Tablet / Máy Tính Bảng", "Laptop / Máy Tính Xách Tay", "PC / Máy Tính Để Bàn"].map(
                (item) => (
                  <li key={item}>
                    <Link href="/" className="text-xs text-brand-muted hover:text-brand-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Tính Năng</h3>
            <ul className="space-y-2">
              {[
                { label: "Gợi ý thiết bị", href: "/" },
                { label: "So sánh cấu hình", href: "/compare" },
                { label: "Thiết bị yêu thích", href: "/favorites" },
                { label: "Trợ lý ảo tư vấn AI", href: "/ai-assistant" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-xs text-brand-muted hover:text-brand-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Affiliate Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Miễn trừ trách nhiệm</h3>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              GearMatch tham gia chương trình tiếp thị liên kết (Affiliate Program) để duy trì hoạt động hệ thống. Khi bạn mua hàng qua link đề xuất, chúng tôi có thể nhận được một khoản hoa hồng nhỏ mà không làm thay đổi giá bán sản phẩm của bạn.
            </p>
          </div>
        </div>

        {/* Bottom Area */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-brand-muted">
          <p>© {new Date().getFullYear()} GearMatch. Bản quyền thuộc về Vũ Hoài Nam.</p>
          <p className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>using Next.js & Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
