"use client";

import { useEffect, useState } from "react";
import devicesData from "@/data/devices.json";
import { Device, resolveImagePath } from "@/utils/recommendation";
import { ArrowLeft, Trash2, Heart, Scale, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const [favoriteDevices, setFavoriteDevices] = useState<Device[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedFavs = localStorage.getItem("gearmatch_favorites");
        if (storedFavs) {
          const ids: string[] = JSON.parse(storedFavs);
          const devices = (devicesData as Device[]).filter((d) => ids.includes(d.id));
          setFavoriteDevices(devices);
        }

        const storedCompare = localStorage.getItem("gearmatch_compare");
        if (storedCompare) {
          setCompareList(JSON.parse(storedCompare));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const removeFromFavorites = (id: string) => {
    const updated = favoriteDevices.filter((d) => d.id !== id);
    setFavoriteDevices(updated);
    const updatedIds = updated.map((d) => d.id);
    localStorage.setItem("gearmatch_favorites", JSON.stringify(updatedIds));
    
    // Dispatch event to update navbar badge
    window.dispatchEvent(new Event("favorites-changed"));
  };

  const toggleCompare = (deviceId: string) => {
    let updated;
    if (compareList.includes(deviceId)) {
      updated = compareList.filter((id) => id !== deviceId);
    } else {
      if (compareList.length >= 3) {
        alert("Bạn chỉ có thể so sánh tối đa 3 thiết bị cùng lúc.");
        return;
      }
      updated = [...compareList, deviceId];
    }
    setCompareList(updated);
    localStorage.setItem("gearmatch_compare", JSON.stringify(updated));
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
  };

  const translateCategory = (cat: string) => {
    switch (cat) {
      case "mobile": return "Điện thoại";
      case "tablet": return "Máy tính bảng";
      case "laptop": return "Laptop";
      case "pc": return "PC Build";
      default: return cat;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Thiết Bị Yêu Thích</h1>
          <p className="text-xs text-brand-muted mt-1">Danh sách các thiết bị bạn đã lưu để xem lại sau.</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      {favoriteDevices.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
          <Heart className="h-12 w-12 text-brand-muted mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2">Chưa có thiết bị yêu thích</h2>
          <p className="text-xs text-brand-muted max-w-sm leading-relaxed mb-6">
            Danh sách lưu trữ đang trống. Hãy tìm kiếm gợi ý thiết bị phù hợp và thả tim vào các sản phẩm bạn ưng ý.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:scale-105"
          >
            <span>Khám phá ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteDevices.map((device) => {
            const isComparing = compareList.includes(device.id);

            return (
              <div
                key={device.id}
                className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-brand-primary/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] text-brand-muted font-bold tracking-widest uppercase block">{device.brand}</span>
                      <h3 className="font-bold text-white text-base truncate max-w-[180px]">{device.name}</h3>
                      <span className="inline-block text-[9px] bg-white/5 text-brand-muted px-2 py-0.5 rounded-md mt-1">
                        {translateCategory(device.category)}
                      </span>
                    </div>
                    {/* Delete Fav Button */}
                    <button
                      onClick={() => removeFromFavorites(device.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Image */}
                  <div className="w-full h-36 relative rounded-xl overflow-hidden bg-brand-bg flex items-center justify-center border border-white/5 mb-4">
                    <img
                      src={resolveImagePath(device.image_url)}
                      alt={device.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Core Specs Small List */}
                  <div className="space-y-1.5 text-[11px] text-brand-muted mb-6 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between"><span className="text-brand-muted/70">CPU:</span> <span className="text-white truncate max-w-[150px]">{device.specs.cpu}</span></div>
                    <div className="flex justify-between"><span className="text-brand-muted/70">RAM/SSD:</span> <span className="text-white">{device.specs.ram} / {device.specs.storage}</span></div>
                    <div className="flex justify-between"><span className="text-brand-muted/70">Màn hình:</span> <span className="text-white truncate max-w-[150px]">{device.specs.display}</span></div>
                    {device.specs.gpu && (
                      <div className="flex justify-between"><span className="text-brand-muted/70">Đồ họa:</span> <span className="text-white truncate max-w-[150px]">{device.specs.gpu}</span></div>
                    )}
                    <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5">
                      <span className="font-bold text-white">Đầu tư:</span>
                      <span className="font-bold text-brand-primary">{formatPrice(device.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => toggleCompare(device.id)}
                    className={`flex-grow inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                      isComparing
                        ? "bg-brand-secondary border-brand-secondary text-white"
                        : "bg-white/5 border-white/5 hover:border-white/10 text-brand-muted hover:text-white"
                    }`}
                  >
                    <Scale className="h-3.5 w-3.5" />
                    <span>{isComparing ? "Đã Thêm So Sánh" : "So Sánh"}</span>
                  </button>
                  <a
                    href={device.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow inline-flex items-center justify-center space-x-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-2 rounded-xl text-[10px] font-bold hover:scale-102 transition-all shadow-md"
                  >
                    <span>Mua Ngay</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
