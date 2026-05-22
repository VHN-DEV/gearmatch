import devicesData from "../data/devices.json";
import needsData from "../data/needs.json";

export interface Device {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  price_range: string;
  specs: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    display: string;
    battery: string;
  };
  needs: string[];
  image_url: string;
  affiliate_link: string;
  pros: string[];
  cons: string[];
}

export interface UserNeed {
  id: string;
  name: string;
  icon: string;
  description: string;
  categories: string[];
}

export interface SpecRequirement {
  cpu: string;
  ram: string;
  storage: string;
  display: string;
  battery: string;
  gpu?: string;
}

export interface RecommendationResult {
  device: Device;
  matchScore: number;
  matchingNeeds: string[];
  reason: string;
}

// Convert price range string to numeric min/max values in VND
export function getPriceRangeBounds(range: string): { min: number; max: number } {
  switch (range) {
    case "<10 triệu":
      return { min: 0, max: 10000000 };
    case "10-20 triệu":
      return { min: 10000000, max: 20000000 };
    case "20-40 triệu":
      return { min: 20000000, max: 40000000 };
    case "40 triệu+":
      return { min: 40000000, max: 999999999 };
    default:
      return { min: 0, max: 999999999 };
  }
}

// Get device recommendations based on category, selected needs, and budget
export function getRecommendations(
  category: string,
  selectedNeedIds: string[],
  budgetRange: string,
  selectedBrands: string[] = []
): {
  recommendations: RecommendationResult[];
  specRequirements: {
    minimum: SpecRequirement;
    recommended: SpecRequirement;
  };
} {
  const devices = devicesData as Device[];
  const needs = needsData as UserNeed[];

  // 1. Filter by category
  let filtered = devices.filter((d) => d.category.toLowerCase() === category.toLowerCase());

  // 2. Filter by budget range (if provided and not "all")
  if (budgetRange && budgetRange !== "all") {
    const { min, max } = getPriceRangeBounds(budgetRange);
    filtered = filtered.filter((d) => d.price >= min && d.price <= max);
  }

  // 3. Filter by brand (if provided)
  if (selectedBrands.length > 0) {
    filtered = filtered.filter((d) => selectedBrands.includes(d.brand));
  }

  // 4. Calculate match score and map results
  const results: RecommendationResult[] = filtered.map((device) => {
    // Intersecting needs
    const matchingNeeds = device.needs.filter((n) => selectedNeedIds.includes(n));
    
    let matchScore = 0;
    if (selectedNeedIds.length === 0) {
      matchScore = 100; // If no needs selected, match is based purely on category & budget
    } else {
      // Base score is proportion of selected needs that the device supports
      const baseScore = (matchingNeeds.length / selectedNeedIds.length) * 100;
      
      // Let's refine the score: devices that support additional needs related to this category get a tiny bonus
      matchScore = Math.min(100, Math.round(baseScore));
    }

    // Generate reason text dynamically
    let reason = "";
    if (matchingNeeds.length > 0) {
      const needNames = matchingNeeds.map(id => needs.find(n => n.id === id)?.name || id);
      if (needNames.length === 1) {
        reason = `Phù hợp hoàn hảo cho nhu cầu ${needNames[0]} của bạn.`;
      } else {
        reason = `Đáp ứng xuất sắc ${needNames.length} nhu cầu cốt lõi: ${needNames.slice(0, 2).join(", ")}${needNames.length > 2 ? "..." : ""}.`;
      }
    } else {
      reason = `Đáp ứng tiêu chuẩn cơ bản cho thiết bị thuộc phân khúc này.`;
    }

    return {
      device,
      matchScore,
      matchingNeeds,
      reason,
    };
  });

  // Sort by match score (descending), then price (descending/ascending depending on value, let's do descending score, then descending price for premium feel)
  results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return b.device.price - a.device.price; // Show higher-spec (more expensive) devices first if scores are equal
  });

  // 5. Generate dynamic spec recommendations based on category and selected needs
  const specRequirements = generateSpecRequirements(category, selectedNeedIds);

  return {
    recommendations: results,
    specRequirements,
  };
}

function generateSpecRequirements(category: string, selectedNeedIds: string[]): {
  minimum: SpecRequirement;
  recommended: SpecRequirement;
} {
  const hasGaming = selectedNeedIds.includes("gaming");
  const hasDesign = selectedNeedIds.includes("graphic_design") || selectedNeedIds.includes("video_editing");
  const hasProgramming = selectedNeedIds.includes("programming");
  const hasAI = selectedNeedIds.includes("aiml");
  const hasHeavyLoad = hasGaming || hasDesign || hasProgramming || hasAI;
  
  const hasSales = selectedNeedIds.includes("consultant_sales");
  const hasMultiTasking = selectedNeedIds.includes("online_seller") || selectedNeedIds.includes("stock_trading") || selectedNeedIds.includes("zoom_meeting") || hasSales;
  const hasEyeCare = selectedNeedIds.includes("heavy_reading") || selectedNeedIds.includes("reading_news");

  if (category === "mobile") {
    return {
      minimum: {
        cpu: (hasHeavyLoad || hasMultiTasking) ? "Snapdragon 8 Gen 2 / Apple A16 Bionic" : "Snapdragon 7s Gen 2 / MediaTek Dimensity 7200",
        ram: (hasHeavyLoad || hasMultiTasking) ? "8GB LPDDR5" : "6GB LPDDR4X",
        storage: "128GB UFS 3.1",
        display: hasSales ? "OLED độ sáng cao ngoài trời (1000+ nits)" : (hasGaming ? "AMOLED 120Hz" : "OLED / AMOLED 90Hz+"),
        battery: "4500mAh, Sạc nhanh 25W"
      },
      recommended: {
        cpu: (hasHeavyLoad || hasMultiTasking) ? "Snapdragon 8 Gen 3 / Apple A18 Pro" : "Snapdragon 8 Gen 2 / Dimensity 9200+",
        ram: (hasHeavyLoad || hasMultiTasking) ? "12GB - 16GB LPDDR5X" : "8GB - 12GB LPDDR5X",
        storage: "256GB - 512GB UFS 4.0",
        display: hasSales ? "OLED LTPO 120Hz chống chói độ sáng cực cao" : "OLED LTPO 120Hz - 165Hz chống chói",
        battery: "5000mAh+, Sạc nhanh 45W - 120W"
      }
    };
  } else if (category === "tablet") {
    return {
      minimum: {
        cpu: (hasHeavyLoad || hasMultiTasking) ? "Apple A15 Bionic / Snapdragon 8 Gen 1" : "Apple A14 Bionic / Snapdragon 7 Gen 1",
        ram: (hasHeavyLoad || hasMultiTasking) ? "8GB" : "4GB",
        storage: "128GB",
        display: hasEyeCare ? "Màn hình nhám PaperMatte / Chống phản chiếu bảo vệ mắt" : (hasSales ? "IPS LCD 90Hz+ (Hỗ trợ bút viết/ký số)" : (hasDesign ? "IPS LCD 120Hz (Chuẩn màu sRGB)" : "IPS LCD 90Hz")),
        battery: "7000mAh, Sạc 18W"
      },
      recommended: {
        cpu: (hasHeavyLoad || hasMultiTasking) ? "Apple M2/M4 / Dimensity 9300+" : "Apple M1 / Snapdragon 8 Gen 2",
        ram: (hasHeavyLoad || hasMultiTasking) ? "8GB - 12GB" : "8GB",
        storage: "256GB+ UFS 4.0",
        display: hasEyeCare ? "Màn hình nhám PaperMatte / Mực điện tử E-Ink bảo vệ mắt tối đa" : (hasSales ? "Tandem OLED / AMOLED 120Hz+ (Hỗ trợ bút cảm ứng nét mảnh & mỏng nhẹ)" : "Tandem OLED / Dynamic AMOLED 2X, 120Hz+ (Hỗ trợ bút cảm ứng)"),
        battery: "10000mAh+, Sạc nhanh 45W - 120W"
      }
    };
  } else if (category === "laptop") {
    return {
      minimum: {
        cpu: (hasHeavyLoad || hasMultiTasking) ? "Intel Core i7 12th Gen / AMD Ryzen 7 6000 Series / Apple M1" : "Intel Core i5 12th Gen / AMD Ryzen 5 7000 Series / Apple M1",
        gpu: (hasHeavyLoad) ? "NVIDIA RTX 3050 / RTX 4050" : "Intel Iris Xe / Arc Graphics / AMD Radeon Graphics",
        ram: (hasHeavyLoad || hasMultiTasking) ? "16GB DDR5" : "8GB - 16GB DDR4/LPDDR5",
        storage: "512GB SSD NVMe PCIe 4.0",
        display: hasSales ? "IPS / OLED chống chói màn cảm ứng" : (hasDesign ? "IPS Full HD, 100% sRGB, độ sáng 300 nits" : "IPS Full HD, 250 nits"),
        battery: "50Wh (Khoảng 5-6h sử dụng)"
      },
      recommended: {
        cpu: (hasHeavyLoad || hasMultiTasking) ? "Intel Core i9 14th Gen / AMD Ryzen 9 8000 Series / Apple M3 Pro" : "Intel Core Ultra 7 / AMD Ryzen 7 8000 Series / Apple M3",
        gpu: (hasHeavyLoad) ? "NVIDIA RTX 4060 / 4070 8GB VRAM" : "Intel Arc Graphics / Apple 10-core GPU",
        ram: (hasHeavyLoad || hasMultiTasking) ? "32GB LPDDR5X / DDR5" : "16GB - 24GB LPDDR5X",
        storage: "1TB SSD NVMe PCIe 4.0",
        display: hasSales ? "OLED / Mini-LED mỏng nhẹ, có cảm ứng & xoay gập 360 độ" : "OLED / Mini-LED 2K/3K, 120Hz+, 100% DCI-P3, Delta E < 1.5",
        battery: "75Wh - 99Wh (Thời gian sử dụng 10h - 15h+)"
      }
    };
  } else {
    // PC Build
    return {
      minimum: {
        cpu: (hasHeavyLoad || hasMultiTasking) ? "Intel Core i5-13400F / AMD Ryzen 5 7500F" : "Intel Core i3-12100 / AMD Ryzen 3 4100",
        gpu: (hasHeavyLoad) ? "NVIDIA RTX 4060 8GB / AMD RX 7600 XT" : "Tích hợp Intel UHD / AMD Radeon Graphics",
        ram: (hasHeavyLoad || hasMultiTasking) ? "16GB - 32GB DDR4 / DDR5" : "16GB DDR4 / DDR5",
        storage: "512GB SSD NVMe PCIe 4.0",
        display: "Hỗ trợ cổng HDMI 2.0 / DP 1.4 (Màn hình mua rời)",
        battery: "Nguồn 600W - 650W 80 Plus Bronze"
      },
      recommended: {
        cpu: (hasHeavyLoad || hasMultiTasking) ? "Intel Core i9-14900K / AMD Ryzen 7 7800X3D" : "Intel Core i5-14400 / AMD Ryzen 5 7600",
        gpu: (hasHeavyLoad) ? (hasAI ? "NVIDIA RTX 4090 24GB VRAM" : "NVIDIA RTX 4070 Ti Super 16GB / AMD RX 7800 XT") : "NVIDIA RTX 4060 8GB",
        ram: (hasHeavyLoad || hasMultiTasking) ? "32GB - 64GB DDR5 6000MHz" : "16GB - 32GB DDR5",
        storage: "1TB - 2TB SSD Samsung 990 Pro PCIe 4.0",
        display: "Khuyên dùng Màn hình 2K/4K IPS/OLED 144Hz+ chuẩn màu",
        battery: "Nguồn 750W - 1200W 80 Plus Gold / Platinum"
      }
    };
  }
}
