"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Cpu as CpuIcon,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Gamepad2,
  Code,
  Video,
  Palette,
  Briefcase,
  BookOpen,
  Cpu,
  Mic,
  Camera,
  Plane,
  BatteryCharging,
  Tv
} from "lucide-react";
import needsData from "@/data/needs.json";

// Map string icon names to Lucide Icon components
const iconMap: Record<string, any> = {
  Gamepad2,
  Code,
  Video,
  Palette,
  Briefcase,
  BookOpen,
  Cpu,
  Mic,
  Camera,
  Plane,
  BatteryCharging,
  Tv
};

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [searchNeedQuery, setSearchNeedQuery] = useState("");

  const categories = [
    { id: "mobile", name: "Điện Thoại (Mobile)", icon: Smartphone, desc: "Smartphone gaming, camera flagship, di động mỏng nhẹ", gradient: "from-blue-500 to-cyan-400" },
    { id: "tablet", name: "Máy Tính Bảng (Tablet)", icon: TabletIcon, desc: "iPad, Galaxy Tab vẽ đồ họa, giải trí, học tập tiện lợi", gradient: "from-purple-500 to-indigo-400" },
    { id: "laptop", name: "Laptop", icon: LaptopIcon, desc: "Macbook, Ultrabook mỏng nhẹ, Laptop gaming & đồ họa", gradient: "from-pink-500 to-rose-400" },
    { id: "pc", name: "PC Build", icon: CpuIcon, desc: "Cấu hình PC lắp ráp hiệu năng cao, tối ưu render & AI", gradient: "from-amber-500 to-orange-400" }
  ];

  const budgets = [
    { id: "<10 triệu", name: "Dưới 10 Triệu", label: "Phân khúc Giá Rẻ", desc: "Đủ dùng cho các tác vụ cơ bản, học tập, văn phòng nhẹ nhàng.", gradient: "from-emerald-500 to-teal-400" },
    { id: "10-20 triệu", name: "10 - 20 Triệu", label: "Phân khúc Tầm Trung", desc: "Chơi game phổ thông, lập trình web, thiết kế Figma mượt mà.", gradient: "from-blue-500 to-indigo-400" },
    { id: "20-40 triệu", name: "20 - 40 Triệu", label: "Phân khúc Cận Cao Cấp", desc: "Chiến game AAA, lập trình máy ảo, đồ họa nặng, render video tốt.", gradient: "from-purple-500 to-pink-400" },
    { id: "40 triệu+", name: "Trên 40 Triệu", label: "Phân khúc Flagship", desc: "Đỉnh cao hiệu năng, đồ họa 3D phức tạp, máy học AI chuyên nghiệp.", gradient: "from-amber-500 to-red-500" }
  ];

  // Filter needs based on selected category & search query
  const filteredNeeds = needsData.filter((need) => {
    const matchesCategory = category ? need.categories.includes(category) : true;
    const matchesSearch = need.name.toLowerCase().includes(searchNeedQuery.toLowerCase()) || 
                          need.description.toLowerCase().includes(searchNeedQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    // Reset selected needs when category changes to prevent incompatible selections
    setSelectedNeeds([]);
    setStep(2);
  };

  const handleNeedToggle = (needId: string) => {
    if (selectedNeeds.includes(needId)) {
      setSelectedNeeds(selectedNeeds.filter((id) => id !== needId));
    } else {
      setSelectedNeeds([...selectedNeeds, needId]);
    }
  };

  const handleBudgetSelect = (budgetId: string) => {
    setBudget(budgetId);
  };

  const handleFinish = () => {
    const needsParam = selectedNeeds.join(",");
    router.push(`/results?category=${category}&needs=${needsParam}&budget=${budget}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -z-10 animate-pulse-soft" />

      {/* Hero section inside wizard */}
      <div className="text-center mb-10 md:mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full glass-panel text-[11px] font-semibold text-brand-primary tracking-wide uppercase mb-4 animate-float">
          <Sparkles className="h-3 w-3" />
          <span>Hệ thống tư vấn phần cứng 2026</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Tìm Thiết Bị <span className="text-shimmer">Hoàn Hảo</span> Cho Bạn
        </h1>
        <p className="text-sm md:text-base text-brand-muted max-w-xl mx-auto">
          Nhập nhu cầu thực tế và ngân sách của bạn, GearMatch sẽ chấm điểm và đề xuất cấu hình phần cứng phù hợp nhất trong 3 bước.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 max-w-md mx-auto">
        <div className="flex justify-between items-center text-xs font-semibold text-brand-muted mb-2 px-1">
          <span className={step >= 1 ? "text-brand-primary" : ""}>1. Thiết bị</span>
          <span className={step >= 2 ? "text-brand-primary" : ""}>2. Nhu cầu</span>
          <span className={step >= 3 ? "text-brand-primary" : ""}>3. Ngân sách</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
            initial={{ width: "33.3%" }}
            animate={{ width: `${step * 33.3}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Wizard Form Wrapper */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 shadow-2xl relative border border-white/5">
        <AnimatePresence mode="wait">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl md:text-2xl font-bold mb-2">Bạn đang cần tìm loại thiết bị nào?</h2>
              <p className="text-xs text-brand-muted mb-6">Chọn phân mục phần cứng để chúng tôi áp dụng bộ tiêu chí gợi ý chuẩn xác nhất.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`text-left p-6 rounded-2xl transition-all duration-300 border flex items-start space-x-4 ${
                        isSelected
                          ? "bg-brand-card border-brand-primary shadow-[0_0_20px_rgba(79,140,255,0.15)]"
                          : "bg-brand-card/50 border-white/5 hover:border-white/10 hover:bg-brand-card"
                      }`}
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-tr ${cat.gradient} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{cat.name}</h3>
                        <p className="text-xs text-brand-muted mt-1 leading-relaxed">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: NEEDS SELECTION */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Nhu cầu sử dụng chính là gì?</h2>
                  <p className="text-xs text-brand-muted mt-1">Bạn có thể chọn nhiều nhu cầu cùng lúc. GearMatch sẽ lọc cấu hình tốt nhất.</p>
                </div>
                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm nhu cầu..."
                    value={searchNeedQuery}
                    onChange={(e) => setSearchNeedQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary transition-all duration-300"
                  />
                </div>
              </div>

              {/* Needs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-2 mb-8">
                {filteredNeeds.map((need) => {
                  const NeedIcon = iconMap[need.icon] || CpuIcon;
                  const isSelected = selectedNeeds.includes(need.id);
                  return (
                    <button
                      key={need.id}
                      onClick={() => handleNeedToggle(need.id)}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 flex items-start space-x-3 group ${
                        isSelected
                          ? "bg-brand-primary/10 border-brand-primary"
                          : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${
                        isSelected ? "bg-brand-primary text-white" : "bg-white/5 text-brand-muted group-hover:text-white"
                      }`}>
                        <NeedIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-xs text-white block truncate">{need.name}</span>
                        <span className="text-[10px] text-brand-muted block mt-0.5 leading-snug line-clamp-2">{need.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center border-t border-white/5 pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-2 text-xs font-semibold text-brand-muted hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedNeeds.length === 0}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md ${
                    selectedNeeds.length > 0
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:scale-105"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <span>Tiếp tục</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: BUDGET SELECTION */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl md:text-2xl font-bold mb-2">Ngân sách dự kiến của bạn?</h2>
              <p className="text-xs text-brand-muted mb-6">Mức tài chính đầu tư giúp chúng tôi phân loại thiết bị tối thiểu và tối ưu nhất.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {budgets.map((b) => {
                  const isSelected = budget === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleBudgetSelect(b.id)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? "bg-brand-card border-brand-primary shadow-[0_0_20px_rgba(79,140,255,0.15)]"
                          : "bg-brand-card/50 border-white/5 hover:border-white/10 hover:bg-brand-card"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-extrabold text-white text-base">{b.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-gradient-to-r ${b.gradient} text-white`}>
                          {b.label}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted leading-relaxed">{b.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center border-t border-white/5 pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2 text-xs font-semibold text-brand-muted hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Quay lại</span>
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!budget}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg ${
                    budget
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:scale-105"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <span>Tìm Kiếm Đề Xuất</span>
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
