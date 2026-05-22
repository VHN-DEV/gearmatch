"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Scale, Heart, ExternalLink, RefreshCw } from "lucide-react";
import { getRecommendations, Device, RecommendationResult, resolveImagePath } from "@/utils/recommendation";
import devicesData from "@/data/devices.json";
import Link from "next/link";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
  devices?: RecommendationResult[];
  specs?: any;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào! Mình là trợ lý tư vấn phần cứng GearMatch. Bạn hãy nhập nhu cầu hoặc sản phẩm mong muốn bằng ngôn ngữ tự nhiên. Ví dụ: 'Tôi muốn mua laptop lập trình dưới 30 triệu' hoặc 'Tư vấn điện thoại chơi game pin trâu tầm 15 triệu'.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load favorites and compare lists
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("gearmatch_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedCompare = localStorage.getItem("gearmatch_compare");
      if (storedCompare) setCompareList(JSON.parse(storedCompare));
    } catch (e) {}
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

  // Helper NLP keyword parsing engine
  const parseNaturalLanguage = (query: string) => {
    const text = query.toLowerCase();
    
    // 1. Detect Category
    let category = "laptop"; // default fallback
    if (text.includes("điện thoại") || text.includes("smartphone") || text.includes("mobile") || text.includes("đt") || text.includes("iphone") || text.includes("rog phone") || text.includes("s24")) {
      category = "mobile";
    } else if (text.includes("ipad") || text.includes("tablet") || text.includes("máy tính bảng") || text.includes("tab")) {
      category = "tablet";
    } else if (text.includes("pc") || text.includes("máy bàn") || text.includes("lắp ráp") || text.includes("case") || text.includes("xeon") || text.includes("monster")) {
      category = "pc";
    } else if (text.includes("laptop") || text.includes("macbook") || text.includes("ultrabook") || text.includes("notebook") || text.includes("xps")) {
      category = "laptop";
    }

    // 2. Detect Budget Range
    let budget = "all";
    
    // Parse numeric numbers if possible
    const matchMillion = text.match(/(\d+)\s*(triệu|tr)/);
    if (matchMillion) {
      const value = parseInt(matchMillion[1]);
      if (value < 10) budget = "<10 triệu";
      else if (value >= 10 && value < 20) budget = "10-20 triệu";
      else if (value >= 20 && value <= 40) budget = "20-40 triệu";
      else if (value > 40) budget = "40 triệu+";
    } else {
      if (text.includes("dưới 10") || text.includes("dưới 10tr") || text.includes("giá rẻ") || text.includes("học sinh")) {
        budget = "<10 triệu";
      } else if (text.includes("tầm trung") || text.includes("mười mấy triệu")) {
        budget = "10-20 triệu";
      } else if (text.includes("cận cao cấp") || text.includes("ba mươi triệu")) {
        budget = "20-40 triệu";
      } else if (text.includes("flagship") || text.includes("khủng") || text.includes("mạnh nhất") || text.includes("cao cấp") || text.includes("tiền triệu")) {
        budget = "40 triệu+";
      }
    }

    // 3. Detect Needs
    const needs: string[] = [];
    if (text.includes("game nặng") || text.includes("gaming nặng") || text.includes("aaa") || text.includes("chiến game nặng")) {
      needs.push("gaming");
    }
    if (text.includes("game") || text.includes("gaming") || text.includes("esport") || text.includes("liên quân") || text.includes("pubg") || text.includes("lol") || text.includes("valorant") || text.includes("esports")) {
      needs.push("budget_gaming");
    }
    if (text.includes("code") || text.includes("lập trình") || text.includes("it") || text.includes("docker") || text.includes("visual studio")) {
      needs.push("programming");
    }
    if (text.includes("khoa học dữ liệu") || text.includes("data science") || text.includes("python") || text.includes("sql") || text.includes("xử lý dữ liệu") || text.includes("bảng tính lớn")) {
      needs.push("data_science");
    }
    if (text.includes("dựng phim") || text.includes("edit video") || text.includes("premiere") || text.includes("capcut") || text.includes("dựng video")) {
      needs.push("video_editing");
    }
    if (text.includes("vlog") || text.includes("tiktok") || text.includes("video ngắn") || text.includes("quay vlog")) {
      needs.push("vlogging");
    }
    if (text.includes("đồ họa") || text.includes("thiết kế") || text.includes("design") || text.includes("photoshop") || text.includes("illustrator") || text.includes("figma")) {
      needs.push("graphic_design");
    }
    if (text.includes("kỹ thuật") || text.includes("cad") || text.includes("cam") || text.includes("solidworks") || text.includes("autocad") || text.includes("revit") || text.includes("3d")) {
      needs.push("engineering_cad");
    }
    if (text.includes("văn phòng") || text.includes("word") || text.includes("excel") || text.includes("office")) {
      needs.push("office_work");
    }
    if (text.includes("doanh nhân") || text.includes("sang trọng") || text.includes("mỏng nhẹ cao cấp") || text.includes("vip")) {
      needs.push("thin_light_executive");
    }
    if (text.includes("học") || text.includes("học tập") || text.includes("online") || text.includes("zoom")) {
      needs.push("study");
    }
    if (text.includes("ghi chú") || text.includes("học vẽ") || text.includes("viết vẽ") || text.includes("stylus") || text.includes("pencil") || text.includes("bút")) {
      needs.push("note_taking");
    }
    if (text.includes("ai") || text.includes("trí tuệ nhân tạo") || text.includes("machine learning") || text.includes("deep learning") || text.includes("llm")) {
      needs.push("aiml");
    }
    if (text.includes("stream") || text.includes("livestream") || text.includes("podcast")) {
      needs.push("livestream");
    }
    if (text.includes("làm nhạc") || text.includes("thu âm") || text.includes("fl studio") || text.includes("ableton") || text.includes("audio")) {
      needs.push("music_production");
    }
    if (text.includes("ảnh") || text.includes("chụp hình") || text.includes("camera") || text.includes("chụp ảnh")) {
      needs.push("photography");
    }
    if (text.includes("người già") || text.includes("trẻ nhỏ") || text.includes("ông bà") || text.includes("phụ huynh") || text.includes("bố mẹ")) {
      needs.push("parental_control");
    }
    if (text.includes("di chuyển") || text.includes("mỏng nhẹ") || text.includes("gọn") || text.includes("du lịch") || text.includes("mang đi")) {
      needs.push("travel");
    }
    if (text.includes("pin") || text.includes("pin trâu") || text.includes("pin khỏe") || text.includes("sạc nhanh") || text.includes("battery")) {
      needs.push("battery_life");
    }
    if (text.includes("phim") || text.includes("xem phim") || text.includes("giải trí") || text.includes("loa") || text.includes("youtube")) {
      needs.push("entertainment");
    }
    if (text.includes("nas") || text.includes("máy chủ") || text.includes("home server") || text.includes("lưu trữ dữ liệu")) {
      needs.push("nas_server");
    }
    if (text.includes("ép xung") || text.includes("overclock") || text.includes("tản nước") || text.includes("rgb") || text.includes("độ đèn")) {
      needs.push("extreme_overclocking");
    }
    if (text.includes("phòng khách") || text.includes("itx") || text.includes("mini pc") || text.includes("pc mini") || text.includes("htpc")) {
      needs.push("htpc_livingroom");
    }
    if (text.includes("bán hàng") || text.includes("chốt đơn") || text.includes("livestream sản phẩm") || text.includes("kinh doanh online")) {
      needs.push("online_seller");
    }
    if (text.includes("đọc báo") || text.includes("lướt facebook") || text.includes("mạng xã hội") || text.includes("đọc tin tức")) {
      needs.push("reading_news");
    }
    if (text.includes("chứng khoán") || text.includes("biểu đồ") || text.includes("chơi coin") || text.includes("forex") || text.includes("giao dịch")) {
      needs.push("stock_trading");
    }
    if (text.includes("họp") || text.includes("teams") || text.includes("họp trực tuyến") || text.includes("meet")) {
      needs.push("zoom_meeting");
    }
    if (text.includes("tài xế") || text.includes("shipper") || text.includes("định vị") || text.includes("xe máy") || text.includes("chạy grab")) {
      needs.push("ride_hailing_shipper");
    }
    if (text.includes("đọc sách") || text.includes("e-book") || text.includes("kindle") || text.includes("truyện tranh")) {
      needs.push("heavy_reading");
    }
    if (text.includes("bảo hiểm") || text.includes("bất động sản") || text.includes("gặp khách") || text.includes("tư vấn") || text.includes("ký hợp đồng") || text.includes("sales") || text.includes("insurance") || text.includes("đối tác")) {
      needs.push("consultant_sales");
    }

    return { category, budget, needs };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const parsed = parseNaturalLanguage(userText);
      const { recommendations, specRequirements } = getRecommendations(
        parsed.category,
        parsed.needs,
        parsed.budget
      );

      let responseText = "";
      const catVn = parsed.category === "mobile" ? "Điện thoại" : parsed.category === "tablet" ? "Máy tính bảng" : parsed.category === "laptop" ? "Laptop" : "PC Build";
      
      const matchedNeedNames = parsed.needs.map(
        (nId) =>
          ({
            gaming: "Chơi game nặng (AAA)",
            budget_gaming: "Gaming phổ thông",
            programming: "Lập trình",
            data_science: "Khoa học dữ liệu",
            video_editing: "Dựng video",
            vlogging: "Quay Vlog & TikTok",
            graphic_design: "Thiết kế đồ họa",
            engineering_cad: "Kỹ thuật & Đồ họa 3D",
            office_work: "Văn phòng",
            thin_light_executive: "Doanh nhân & Sang trọng",
            study: "Học tập",
            note_taking: "Ghi chú & Học vẽ",
            aiml: "AI/Machine Learning",
            livestream: "Livestream",
            music_production: "Sản xuất âm nhạc",
            photography: "Chụp ảnh & Quay phim",
            parental_control: "Cho người già & Trẻ nhỏ",
            travel: "Di chuyển nhiều",
            battery_life: "Pin trâu",
            entertainment: "Giải trí",
            nas_server: "Làm NAS & Home Server",
            extreme_overclocking: "Ép xung & Đèn LED",
            htpc_livingroom: "PC phòng khách",
            online_seller: "Bán hàng online & Chốt đơn",
            reading_news: "Đọc báo & Lướt mạng xã hội",
            stock_trading: "Xem biểu đồ & Chứng khoán",
            zoom_meeting: "Họp trực tuyến & Học online",
            ride_hailing_shipper: "Tài xế & Giao hàng (GPS)",
            heavy_reading: "Đọc sách chuyên sâu (E-Book)",
            consultant_sales: "Tư vấn khách hàng & Ký hợp đồng"
          }[nId] || nId)
      );

      if (recommendations.length > 0) {
        responseText = `Dựa trên phân tích, mình thấy bạn đang cần tìm **${catVn}** ${
          matchedNeedNames.length > 0 ? `cho nhu cầu: **${matchedNeedNames.join(", ")}**` : ""
        } với ngân sách tầm **${parsed.budget === "all" ? "tùy chọn" : parsed.budget}**.\n\nHệ thống đề xuất các cấu hình thích hợp bên dưới:`;
      } else {
        responseText = `Mình đã ghi nhận nhu cầu tìm kiếm **${catVn}** của bạn. Tuy nhiên dữ liệu phân khúc ngân sách này hiện tại chưa khớp sản phẩm nào. Dưới đây là các lựa chọn cấu hình đề xuất gần nhất thuộc phân khúc khác:`;
      }

      // Pick top 2 matched devices
      const topMatches = recommendations.slice(0, 2);

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: responseText,
        timestamp: new Date(),
        devices: topMatches,
        specs: specRequirements
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
  };

  const handleSuggestionClick = (queryText: string) => {
    setInputValue(queryText);
  };

  const suggestions = [
    "Laptop lập trình tầm 25 triệu",
    "Điện thoại chơi game pin trâu tầm 15 triệu",
    "iPad học vẽ cho sinh viên giá rẻ",
    "PC lắp ráp làm AI đồ họa nặng"
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center space-x-2">
            <Bot className="h-7 w-7 text-brand-primary" />
            <span>Trợ Lý Tư Vấn AI</span>
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">Hỏi đáp bằng ngôn ngữ tự nhiên để tìm thiết bị lý tưởng.</p>
        </div>
        {compareList.length > 0 && (
          <Link
            href="/compare"
            className="inline-flex items-center space-x-1.5 bg-brand-secondary hover:bg-brand-secondary/95 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shadow-md"
          >
            <Scale className="h-3.5 w-3.5" />
            <span>So sánh ({compareList.length})</span>
          </Link>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-grow glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col justify-between shadow-xl">
        {/* Messages Body */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div key={msg.id} className={`flex ${isAi ? "justify-start" : "justify-end"} items-start space-x-3`}>
                {isAi && (
                  <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex-shrink-0">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                  isAi
                    ? "bg-white/5 text-white border border-white/5"
                    : "bg-brand-primary text-white font-medium"
                }`}>
                  <p className="text-xs whitespace-pre-line">{msg.text}</p>

                  {/* SPEC RECOMMENDATIONS MINI PANEL */}
                  {isAi && msg.specs && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div className="bg-white/5 rounded-xl p-3 text-[10px] leading-relaxed">
                        <span className="font-extrabold text-brand-warning block mb-1">CẤU HÌNH TỐI THIỂU</span>
                        <ul className="space-y-0.5 text-brand-muted">
                          <li><strong>CPU:</strong> {msg.specs.minimum.cpu}</li>
                          <li><strong>RAM:</strong> {msg.specs.minimum.ram}</li>
                          <li><strong>SSD:</strong> {msg.specs.minimum.storage}</li>
                          <li><strong>Màn hình:</strong> {msg.specs.minimum.display}</li>
                        </ul>
                      </div>
                      <div className="bg-brand-primary/5 rounded-xl p-3 text-[10px] leading-relaxed border border-brand-primary/10">
                        <span className="font-extrabold text-brand-primary block mb-1">CẤU HÌNH KHUYÊN DÙNG</span>
                        <ul className="space-y-0.5 text-brand-muted">
                          <li><strong>CPU:</strong> {msg.specs.recommended.cpu}</li>
                          <li><strong>RAM:</strong> {msg.specs.recommended.ram}</li>
                          <li><strong>SSD:</strong> {msg.specs.recommended.storage}</li>
                          <li><strong>Màn hình:</strong> {msg.specs.recommended.display}</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* CAROUSEL DEVICE RECOMMENDATIONS */}
                  {isAi && msg.devices && msg.devices.length > 0 && (
                    <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                      <span className="text-[10px] font-bold text-brand-primary block">CÁC SẢN PHẨM KHỚP NHẤT:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.devices.map(({ device, matchScore }) => {
                          const isFav = favorites.includes(device.id);
                          const isComparing = compareList.includes(device.id);

                          return (
                            <div key={device.id} className="bg-brand-card/45 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <span className="text-[8px] text-brand-muted font-bold tracking-widest uppercase block">{device.brand}</span>
                                    <span className="font-bold text-xs text-white block truncate max-w-[120px]">{device.name}</span>
                                  </div>
                                  <span className="text-[9px] font-extrabold text-brand-primary">{matchScore}% Match</span>
                                </div>
                                <div className="h-16 w-full relative rounded-lg overflow-hidden bg-brand-bg flex items-center justify-center border border-white/5 mb-3">
                                  <img src={resolveImagePath(device.image_url)} alt={device.name} className="object-cover h-full w-full" />
                                </div>
                                <div className="text-[9px] text-brand-muted space-y-0.5 mb-3">
                                  <div className="truncate"><strong>CPU:</strong> {device.specs.cpu}</div>
                                  <div><strong>RAM/SSD:</strong> {device.specs.ram} / {device.specs.storage}</div>
                                  <div className="text-brand-primary font-bold">{formatPrice(device.price)}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 border-t border-white/5 pt-2">
                                <button
                                  onClick={() => toggleCompare(device.id)}
                                  className={`flex-1 p-1 rounded-md text-[8px] font-bold transition-all border flex items-center justify-center space-x-1 ${
                                    isComparing
                                      ? "bg-brand-secondary border-brand-secondary text-white"
                                      : "bg-white/5 border-white/5 hover:border-white/10 text-brand-muted hover:text-white"
                                  }`}
                                >
                                  <Scale className="h-2.5 w-2.5" />
                                  <span>{isComparing ? "Đã Thêm" : "So Sánh"}</span>
                                </button>
                                <button
                                  onClick={() => toggleFavorite(device.id)}
                                  className={`p-1 rounded-md transition-all border ${
                                    isFav ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/5 text-brand-muted hover:text-white"
                                  }`}
                                >
                                  <Heart className={`h-2.5 w-2.5 ${isFav ? "fill-red-500" : ""}`} />
                                </button>
                                <a
                                  href={device.affiliate_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-md bg-brand-primary text-white hover:scale-102 transition-all flex items-center justify-center"
                                >
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="p-2 rounded-xl bg-brand-primary text-white flex-shrink-0">
                    <User className="h-4.5 w-4.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start items-center space-x-3">
              <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="bg-white/5 text-brand-muted rounded-2xl px-4 py-3 flex space-x-1 items-center border border-white/5">
                <div className="h-1.5 w-1.5 bg-brand-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-1.5 w-1.5 bg-brand-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 bg-brand-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Dynamic query suggestions */}
        {messages.length === 1 && !isTyping && (
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <span className="text-[10px] font-bold text-brand-muted block mb-2 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5 text-brand-primary animate-pulse" />
              <span>Gợi ý mẫu câu hỏi:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSuggestionClick(sug)}
                  className="text-[10px] bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex items-center space-x-2 bg-[#080b16]">
          <input
            type="text"
            placeholder="Nhập nhu cầu của bạn ở đây..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition-all duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isTyping || !inputValue.trim()}
            className="p-3 rounded-xl bg-brand-primary text-white hover:scale-105 hover:bg-brand-primary/95 transition-all shadow-md disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
