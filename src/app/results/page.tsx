"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  getRecommendations,
  Device,
  getPriceRangeBounds,
  RecommendationResult
} from "@/utils/recommendation";
import {
  ArrowLeft,
  Filter,
  Check,
  Heart,
  Scale,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  BadgeAlert
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || "mobile";
  const needsParam = searchParams.get("needs") || "";
  const selectedNeeds = needsParam ? needsParam.split(",") : [];
  const budget = searchParams.get("budget") || "all";

  // State
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [specs, setSpecs] = useState<any>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("score-desc");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  // Load results, specs, and initial dynamic brand list
  useEffect(() => {
    const { recommendations, specRequirements } = getRecommendations(
      category,
      selectedNeeds,
      budget,
      selectedBrands
    );

    // Get all unique brands in recommendations for filtering
    const allBrands = Array.from(
      new Set(
        (getRecommendations(category, selectedNeeds, budget).recommendations).map(
          (r) => r.device.brand
        )
      )
    );
    setBrands(allBrands);
    setSpecs(specRequirements);

    // Apply sorting
    const sorted = [...recommendations];
    if (sortBy === "score-desc") {
      sorted.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "price-asc") {
      sorted.sort((a, b) => a.device.price - b.device.price);
    } else if (sortBy === "price-desc") {
      sorted.sort((a, b) => b.device.price - a.device.price);
    }
    setResults(sorted);
  }, [category, needsParam, budget, selectedBrands, sortBy]);

  // Load favorites & compare list from LocalStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("gearmatch_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedCompare = localStorage.getItem("gearmatch_compare");
      if (storedCompare) setCompareList(JSON.parse(storedCompare));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleFavorite = (deviceId: string) => {
    let updated;
    if (favorites.includes(deviceId)) {
      updated = favorites.filter((id) => id !== deviceId);
    } else {
      updated = [...favorites, deviceId];
    }
    setFavorites(updated);
    localStorage.setItem("gearmatch_favorites", JSON.stringify(updated));
    // Dispatch event to update navbar
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

  const handleBrandToggle = (brandName: string) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Back Button */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại bộ lọc</span>
        </Link>
        {compareList.length > 0 && (
          <Link
            href="/compare"
            className="inline-flex items-center space-x-2 bg-brand-secondary hover:bg-brand-secondary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:scale-105"
          >
            <Scale className="h-4 w-4" />
            <span>So sánh {compareList.length} thiết bị</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS */}
        <div className="col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Filter className="h-4 w-4 text-brand-primary" />
                <span>Bộ Lọc Chi Tiết</span>
              </h3>
              {(selectedBrands.length > 0 || sortBy !== "score-desc") && (
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setSortBy("score-desc");
                  }}
                  className="text-[10px] text-brand-primary hover:underline font-semibold"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Current Criteria Summary */}
            <div className="mb-6 bg-white/5 rounded-xl p-3 text-[11px] space-y-1">
              <span className="text-brand-muted uppercase tracking-wider font-bold block mb-1">Cấu hình đang lọc</span>
              <div>
                <span className="text-brand-muted">Phân mục:</span>{" "}
                <span className="text-white font-semibold">{translateCategory(category)}</span>
              </div>
              <div>
                <span className="text-brand-muted">Ngân sách:</span>{" "}
                <span className="text-white font-semibold">{budget}</span>
              </div>
              <div>
                <span className="text-brand-muted">Nhu cầu:</span>{" "}
                <span className="text-white font-semibold">{selectedNeeds.length} mục đã chọn</span>
              </div>
            </div>

            {/* Brand Filter Checklist */}
            <div className="mb-6">
              <span className="text-xs font-bold text-white block mb-3">Thương hiệu</span>
              {brands.length === 0 ? (
                <p className="text-[10px] text-brand-muted">Không tìm thấy thương hiệu phù hợp.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {brands.map((brand) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => handleBrandToggle(brand)}
                        className="flex items-center space-x-3 w-full text-left py-1 text-xs text-brand-muted hover:text-white transition-colors"
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                          isChecked ? "bg-brand-primary border-brand-primary text-white" : "border-white/20 bg-transparent"
                        }`}>
                          {isChecked && <Check className="h-3 w-3" />}
                        </div>
                        <span>{brand}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div>
              <label className="text-xs font-bold text-white block mb-3">Sắp xếp theo</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary transition-all duration-300"
              >
                <option value="score-desc" className="bg-[#0f1428] text-white">Độ trùng khớp giảm dần</option>
                <option value="price-asc" className="bg-[#0f1428] text-white">Giá tăng dần</option>
                <option value="price-desc" className="bg-[#0f1428] text-white">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        {/* RESULTS MAIN LIST */}
        <div className="col-span-1 lg:col-span-3 space-y-8">
          {/* DYNAMIC SPECS RECOMMENDATION PANEL */}
          {specs && (
            <div className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden bg-gradient-to-br from-[#10162e] to-[#0b1022]">
              <div className="absolute top-0 right-0 p-6 bg-brand-primary/5 rounded-bl-full pointer-events-none">
                <Cpu className="h-10 w-10 text-brand-primary/20" />
              </div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
                <Cpu className="h-5 w-5 text-brand-primary animate-pulse" />
                <span>Khuyên Nghị Thông Số Cấu Hình</span>
              </h3>
              <p className="text-xs text-brand-muted mb-6">
                Được tính toán tự động dựa trên danh sách nhu cầu bạn đã chọn để đảm bảo thiết bị chạy ổn định.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Min Config */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <span className="text-xs font-extrabold text-[#f59e0b] block mb-3 uppercase tracking-wider">
                    Cấu Hình Tối Thiểu (Minimum)
                  </span>
                  <ul className="text-xs space-y-2 text-brand-muted">
                    <li><strong className="text-white">CPU:</strong> {specs.minimum.cpu}</li>
                    {specs.minimum.gpu && <li><strong className="text-white">GPU:</strong> {specs.minimum.gpu}</li>}
                    <li><strong className="text-white">RAM:</strong> {specs.minimum.ram}</li>
                    <li><strong className="text-white">Ổ cứng:</strong> {specs.minimum.storage}</li>
                    <li><strong className="text-white">Màn hình:</strong> {specs.minimum.display}</li>
                    <li><strong className="text-white">Pin:</strong> {specs.minimum.battery}</li>
                  </ul>
                </div>

                {/* Rec Config */}
                <div className="bg-brand-primary/5 rounded-2xl p-4 border border-brand-primary/10">
                  <span className="text-xs font-extrabold text-brand-primary block mb-3 uppercase tracking-wider">
                    Cấu Hình Khuyên Dùng (Recommended)
                  </span>
                  <ul className="text-xs space-y-2 text-brand-muted">
                    <li><strong className="text-white">CPU:</strong> {specs.recommended.cpu}</li>
                    {specs.recommended.gpu && <li><strong className="text-white">GPU:</strong> {specs.recommended.recommendedGpu || specs.recommended.gpu}</li>}
                    <li><strong className="text-white">RAM:</strong> {specs.recommended.ram}</li>
                    <li><strong className="text-white">Ổ cứng:</strong> {specs.recommended.storage}</li>
                    <li><strong className="text-white">Màn hình:</strong> {specs.recommended.display}</li>
                    <li><strong className="text-white">Pin:</strong> {specs.recommended.battery}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* DEVICE MATCH LIST */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-4">
              Thiết bị phù hợp ({results.length})
            </h3>

            {results.length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 text-center border border-white/5 flex flex-col items-center justify-center">
                <BadgeAlert className="h-10 w-10 text-brand-muted mb-3" />
                <h4 className="font-bold text-white text-base">Không tìm thấy thiết bị phù hợp</h4>
                <p className="text-xs text-brand-muted mt-1 max-w-sm">
                  Hãy thử mở rộng bộ lọc thương hiệu hoặc chọn phân khúc ngân sách lớn hơn để tìm thấy kết quả phù hợp.
                </p>
              </div>
            ) : (
              results.map(({ device, matchScore, reason }) => {
                const isFav = favorites.includes(device.id);
                const isComparing = compareList.includes(device.id);
                const isExpanded = expandedDevice === device.id;

                return (
                  <div
                    key={device.id}
                    className="glass-panel rounded-2xl p-4 md:p-6 border border-white/5 hover:border-brand-primary/20 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Device Image */}
                      <div className="w-full md:w-36 h-28 relative rounded-xl overflow-hidden bg-brand-bg flex items-center justify-center border border-white/5 flex-shrink-0">
                        <img
                          src={device.image_url}
                          alt={device.name}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Device Core Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] text-brand-muted font-bold tracking-widest uppercase">{device.brand}</span>
                            <h4 className="text-base md:text-lg font-bold text-white block hover:text-brand-primary transition-colors cursor-pointer" onClick={() => setExpandedDevice(isExpanded ? null : device.id)}>
                              {device.name}
                            </h4>
                          </div>
                          {/* Match Score Badge */}
                          <div className="flex flex-col items-end">
                            <span className="text-xs md:text-sm font-extrabold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                              {matchScore}% Match
                            </span>
                            <span className="text-[9px] text-brand-muted">{reason}</span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-[11px] text-brand-muted border-t border-b border-white/5 py-3 mb-4">
                          <div>
                            <span className="text-brand-muted/70 block text-[9px] uppercase font-bold">Vi xử lý</span>
                            <span className="text-white truncate block">{device.specs.cpu}</span>
                          </div>
                          <div>
                            <span className="text-brand-muted/70 block text-[9px] uppercase font-bold">RAM / SSD</span>
                            <span className="text-white truncate block">{device.specs.ram} / {device.specs.storage}</span>
                          </div>
                          <div>
                            <span className="text-brand-muted/70 block text-[9px] uppercase font-bold">Màn hình</span>
                            <span className="text-white truncate block">{device.specs.display}</span>
                          </div>
                          <div>
                            <span className="text-brand-muted/70 block text-[9px] uppercase font-bold">Đồ họa</span>
                            <span className="text-white truncate block">{device.specs.gpu}</span>
                          </div>
                          <div>
                            <span className="text-brand-muted/70 block text-[9px] uppercase font-bold">Pin & Sạc</span>
                            <span className="text-white truncate block">{device.specs.battery}</span>
                          </div>
                          <div>
                            <span className="text-brand-muted/70 block text-[9px] uppercase font-bold">Đầu tư</span>
                            <span className="text-brand-primary font-bold block">{formatPrice(device.price)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 justify-between">
                          <div className="flex items-center space-x-2">
                            {/* Compare Checkbox */}
                            <button
                              onClick={() => toggleCompare(device.id)}
                              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                isComparing
                                  ? "bg-brand-secondary border-brand-secondary text-white"
                                  : "bg-white/5 border-white/5 hover:border-white/10 text-brand-muted hover:text-white"
                              }`}
                            >
                              <Scale className="h-3.5 w-3.5" />
                              <span>{isComparing ? "Đã Thêm So Sánh" : "Thêm So Sánh"}</span>
                            </button>

                            {/* Favorite Heart */}
                            <button
                              onClick={() => toggleFavorite(device.id)}
                              className={`p-1.5 rounded-lg transition-all border ${
                                isFav
                                  ? "bg-red-500/10 border-red-500/30 text-red-500"
                                  : "bg-white/5 border-white/5 hover:border-white/10 text-brand-muted hover:text-white"
                              }`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-red-500" : ""}`} />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setExpandedDevice(isExpanded ? null : device.id)}
                              className="text-[10px] text-brand-muted hover:text-white font-semibold transition-colors flex items-center space-x-1 px-3 py-1.5"
                            >
                              <span>Chi tiết</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            <a
                              href={device.affiliate_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-4 py-1.5 rounded-lg text-[10px] font-bold hover:scale-105 transition-all shadow-md"
                            >
                              <span>Mua Ngay</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>

                        {/* Expanded Details Drawer */}
                        {isExpanded && (
                          <div className="mt-6 border-t border-white/5 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-brand-success/5 rounded-xl p-4 border border-brand-success/10">
                              <span className="font-bold text-brand-success block mb-2">Ưu Điểm Nổi Bật</span>
                              <ul className="list-disc list-inside space-y-1 text-brand-muted">
                                {device.pros.map((pro, index) => (
                                  <li key={index}>{pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-brand-warning/5 rounded-xl p-4 border border-brand-warning/10">
                              <span className="font-bold text-brand-warning block mb-2">Nhược Điểm Cần Lưu Ý</span>
                              <ul className="list-disc list-inside space-y-1 text-brand-muted">
                                {device.cons.map((con, index) => (
                                  <li key={index}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-brand-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4" />
        <p>Đang tải kết quả gợi ý...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
