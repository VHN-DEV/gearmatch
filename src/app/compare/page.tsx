"use client";

import { useEffect, useState } from "react";
import devicesData from "@/data/devices.json";
import { Device } from "@/utils/recommendation";
import { ArrowLeft, Trash2, ExternalLink, Cpu, HardDrive, ShieldAlert, BadgeCheck } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const [compareDevices, setCompareDevices] = useState<Device[]>([]);

  useEffect(() => {
    const loadCompareList = () => {
      try {
        const stored = localStorage.getItem("gearmatch_compare");
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          const devices = (devicesData as Device[]).filter((d) => ids.includes(d.id));
          setCompareDevices(devices);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCompareList();
  }, []);

  const removeFromCompare = (id: string) => {
    const updated = compareDevices.filter((d) => d.id !== id);
    setCompareDevices(updated);
    const updatedIds = updated.map((d) => d.id);
    localStorage.setItem("gearmatch_compare", JSON.stringify(updatedIds));
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">So Sánh Thiết Bị</h1>
          <p className="text-xs text-brand-muted mt-1">So sánh song song thông số cấu hình và ưu nhược điểm chi tiết.</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      {compareDevices.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center justify-center">
          <Trash2 className="h-12 w-12 text-brand-muted mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Bảng so sánh trống</h2>
          <p className="text-xs text-brand-muted max-w-sm leading-relaxed mb-6">
            Bạn chưa chọn bất kỳ thiết bị nào để so sánh. Hãy thực hiện tìm kiếm gợi ý và bấm vào nút &quot;Thêm So Sánh&quot; trên các thiết bị.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:scale-105"
          >
            <span>Bắt đầu chọn thiết bị</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px] glass-panel rounded-3xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 text-xs font-extrabold text-brand-muted uppercase tracking-wider w-1/4">Thông số / Tiêu chí</th>
                  {compareDevices.map((device) => (
                    <th key={device.id} className="p-6 w-1/4 border-l border-white/5 relative group">
                      <button
                        onClick={() => removeFromCompare(device.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Xóa khỏi so sánh"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Image */}
                      <div className="w-full h-24 relative rounded-xl overflow-hidden bg-brand-bg flex items-center justify-center border border-white/5 mb-4">
                        <img
                          src={device.image_url}
                          alt={device.name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* Brand & Name */}
                      <span className="text-[10px] text-brand-muted font-bold tracking-widest uppercase block">{device.brand}</span>
                      <span className="font-bold text-sm text-white block truncate">{device.name}</span>
                      <span className="text-xs text-brand-primary font-extrabold mt-1 block">{formatPrice(device.price)}</span>
                    </th>
                  ))}
                  {/* Empty headers to fill the remaining table slots if less than 3 devices */}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <th key={`empty-h-${idx}`} className="p-6 w-1/4 border-l border-white/5 text-center text-brand-muted/30">
                      <div className="h-24 rounded-xl border border-dashed border-white/5 flex items-center justify-center text-xs">
                        Trống
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs text-brand-muted divide-y divide-white/5">
                {/* CPU Row */}
                <tr>
                  <td className="p-4 font-bold text-white bg-white/[0.02]">Bộ Vi Xử Lý (CPU)</td>
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-4 border-l border-white/5 font-medium text-white">{device.specs.cpu}</td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-cpu-${idx}`} className="p-4 border-l border-white/5" />
                  ))}
                </tr>

                {/* GPU Row */}
                <tr>
                  <td className="p-4 font-bold text-white bg-white/[0.02]">Bộ Xử Lý Đồ Họa (GPU)</td>
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-4 border-l border-white/5">{device.specs.gpu || "Tích hợp / N/A"}</td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-gpu-${idx}`} className="p-4 border-l border-white/5" />
                  ))}
                </tr>

                {/* RAM Row */}
                <tr>
                  <td className="p-4 font-bold text-white bg-white/[0.02]">Bộ nhớ RAM</td>
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-4 border-l border-white/5 font-medium text-white">{device.specs.ram}</td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-ram-${idx}`} className="p-4 border-l border-white/5" />
                  ))}
                </tr>

                {/* Storage Row */}
                <tr>
                  <td className="p-4 font-bold text-white bg-white/[0.02]">Dung Lượng Ổ Cứng (SSD)</td>
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-4 border-l border-white/5">{device.specs.storage}</td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-storage-${idx}`} className="p-4 border-l border-white/5" />
                  ))}
                </tr>

                {/* Display Row */}
                <tr>
                  <td className="p-4 font-bold text-white bg-white/[0.02]">Màn Hình</td>
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-4 border-l border-white/5">{device.specs.display}</td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-display-${idx}`} className="p-4 border-l border-white/5" />
                  ))}
                </tr>

                {/* Battery Row */}
                <tr>
                  <td className="p-4 font-bold text-white bg-white/[0.02]">Thời Lượng Pin & Sạc</td>
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-4 border-l border-white/5">{device.specs.battery}</td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-battery-${idx}`} className="p-4 border-l border-white/5" />
                  ))}
                </tr>

                {/* Pros Row */}
                <tr>
                  <td className="p-4 font-bold text-white bg-white/[0.02]">Ưu Điểm Nổi Bật</td>
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-4 border-l border-white/5 text-[11px] leading-relaxed text-brand-muted">
                      <div className="space-y-1.5">
                        {device.pros.map((pro, index) => (
                          <div key={index} className="flex items-start space-x-1">
                            <BadgeCheck className="h-3.5 w-3.5 text-brand-success flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-pros-${idx}`} className="p-4 border-l border-white/5" />
                  ))}
                </tr>

                {/* Cons Row */}
                <tr>
                  <td className="p-4 font-bold text-white bg-white/[0.02]">Nhược Điểm Hạn Chế</td>
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-4 border-l border-white/5 text-[11px] leading-relaxed text-brand-muted">
                      <div className="space-y-1.5">
                        {device.cons.map((con, index) => (
                          <div key={index} className="flex items-start space-x-1">
                            <ShieldAlert className="h-3.5 w-3.5 text-brand-warning flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-cons-${idx}`} className="p-4 border-l border-white/5" />
                  ))}
                </tr>

                {/* Actions Row */}
                <tr>
                  <td className="p-6 bg-white/[0.02]" />
                  {compareDevices.map((device) => (
                    <td key={device.id} className="p-6 border-l border-white/5">
                      <a
                        href={device.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white w-full py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] transition-all shadow-md"
                      >
                        <span>Mua Ngay</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareDevices.length) }).map((_, idx) => (
                    <td key={`empty-actions-${idx}`} className="p-6 border-l border-white/5" />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
