/**
 * Sample 5-line request đã bóc tách (mock kết quả AI parse từ paste/Excel/Image).
 */

import type { CatalogItem } from "./catalog";
import { CATALOG } from "./catalog";

export type RequestStatus = "matched" | "choose" | "unclear" | "missing";

/** Mặc định gán hết qty cho NCC rẻ nhất (greedy fill). */
export function defaultAllocation(line: { qty: number; match?: { suppliers: { name: string; price: number; stock: number }[] } }): Record<string, number> {
  if (!line.match) return {};
  const result: Record<string, number> = {};
  const sorted = [...line.match.suppliers].sort((a, b) => a.price - b.price);
  let remain = line.qty;
  for (const s of sorted) {
    if (remain <= 0) {
      result[s.name] = 0;
      continue;
    }
    const take = Math.min(s.stock, remain);
    result[s.name] = take;
    remain -= take;
  }
  return result;
}

export type RequestLine = {
  id: string;
  raw: string;            // text gốc user nhập / OCR
  qty: number;
  unit: string;
  status: RequestStatus;
  selectedSku?: string;   // sku đã chốt
  match?: CatalogItem;    // sản phẩm khớp khi matched
  suggestions?: CatalogItem[]; // khi status = "choose"
  reason?: string;        // lý do unclear/missing
  selectedSupplier?: string;
  selected?: boolean;     // checkbox chọn để báo giá
  /** Phân bổ số lượng theo NCC: { "MRO Smart V2": 60, "Kho SG 01": 40 } */
  allocations?: Record<string, number>;
};

/** Tổng tiền 1 dòng (chưa VAT). Nếu có allocations dùng giá theo từng NCC. */
export function lineSubtotal(l: RequestLine): number {
  if (!l.match) return 0;
  if (l.allocations && Object.keys(l.allocations).length > 0) {
    return Object.entries(l.allocations).reduce((s, [name, qty]) => {
      const sup = l.match!.suppliers.find((x) => x.name === name);
      return s + (sup?.price ?? l.match!.unitPrice) * qty;
    }, 0);
  }
  const sup = l.match.suppliers.find((s) => s.name === l.selectedSupplier);
  return l.qty * (sup?.price ?? l.match.unitPrice);
}

export const SAMPLE_LINES: RequestLine[] = [
  { id: "l1",  raw: "Mũi Khoan Thép List 500 Nachi D3.8", qty: 40, unit: "cái", status: "matched", match: CATALOG[0], selected: true, selectedSupplier: "Smart V2" },
  { id: "l2",  raw: "Mũi khoan bê tông Bosch 8mm",          qty: 5,  unit: "cái", status: "matched", match: CATALOG[1], selected: true, selectedSupplier: "Bosch VN" },
  { id: "l3",  raw: "Mũi khoan sắt Makita 10mm",            qty: 12, unit: "cái", status: "matched", match: CATALOG[2], selected: true, selectedSupplier: "Makita VN" },
  { id: "l4",  raw: "Đá cắt sắt Hải Dương 350mm",           qty: 20, unit: "cái", status: "matched", match: CATALOG[3], selected: true, selectedSupplier: "Hải Dương" },
  { id: "l5",  raw: "Đá mài Bosch 100mm",                   qty: 22, unit: "cái", status: "matched", match: CATALOG[4], selected: true, selectedSupplier: "Bosch VN" },
];

function expand(): RequestLine[] {
  // No expansion needed - SAMPLE_LINES already has 5 items
  return [];
}

export const FULL_SAMPLE: RequestLine[] = [...SAMPLE_LINES, ...expand()];

export const PLACEHOLDER_TEXT = `Dán danh sách vật tư từ Excel, Word, Zalo hoặc gõ trực tiếp vào đây...

Ví dụ: 5 cái bạc đạn 6023, 100 con bulong M8 20, 10 mũi khoan 5 li, 1 máy khoan, 1 thùng RP7

— Hoặc bạn có thể dán (Ctrl+V) hình ảnh trực tiếp vào ô chat này.`;
