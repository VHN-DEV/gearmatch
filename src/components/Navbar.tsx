"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Cpu, Heart, BarChart3, MessageSquareCode, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Monitor scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update favorites count from LocalStorage
  useEffect(() => {
    const updateFavoritesCount = () => {
      try {
        const stored = localStorage.getItem("gearmatch_favorites");
        if (stored) {
          const list = JSON.parse(stored);
          setFavoritesCount(list.length);
        } else {
          setFavoritesCount(0);
        }
      } catch (err) {
        setFavoritesCount(0);
      }
    };

    updateFavoritesCount();
    // Listen for storage events (e.g. from other pages or custom dispatch)
    window.addEventListener("storage", updateFavoritesCount);
    window.addEventListener("favorites-changed", updateFavoritesCount);
    return () => {
      window.removeEventListener("storage", updateFavoritesCount);
      window.removeEventListener("favorites-changed", updateFavoritesCount);
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Chọn Thiết Bị", icon: Cpu },
    { href: "/compare", label: "So Sánh", icon: BarChart3 },
    { href: "/favorites", label: "Yêu Thích", icon: Heart, badge: favoritesCount },
    { href: "/ai-assistant", label: "Trợ Lý AI", icon: MessageSquareCode },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#080b16]/80 backdrop-blur-md border-b border-white/5 py-3 shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white group-hover:text-brand-primary transition-colors duration-300">
                GEAR<span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">MATCH</span>
              </span>
              <p className="text-[9px] text-brand-muted font-mono tracking-widest uppercase">Smart Hardware Guide</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                    isActive
                      ? "text-brand-primary bg-white/5"
                      : "text-brand-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-[10px] font-bold text-white animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute left-0 w-full bg-[#080b16] border-b border-white/5 transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? "max-h-screen opacity-100 py-4 shadow-xl" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActive
                    ? "text-brand-primary bg-white/5"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-xs font-bold text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
