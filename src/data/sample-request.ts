/**
 * Sample 36-line request đã bóc tách (mock kết quả AI parse từ paste/Excel/Image).
 * 28 dòng matched, 8 dòng cần xử lý (chọn 1-trong-N / unclear / missing).
 */

import type { CatalogItem } from "./catalog";
import { CATALOG, SUGGESTIONS_MOLET } from "./catalog";

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
  { id: "l2",  raw: "mỏ lết răng stanley",                  qty: 10, unit: "cái", status: "choose",  suggestions: SUGGESTIONS_MOLET, selected: true },
  { id: "l3",  raw: "keo chó dán ống",                      qty: 5,  unit: "cái", status: "unclear", reason: "Không rõ tên vật tư. Vui lòng chat để xác nhận.", selected: true },
  { id: "l4",  raw: "dây xích phi nhỏ",                     qty: 20, unit: "cái", status: "missing", reason: "Thiếu thông số kỹ thuật (size).", selected: true },
  { id: "l5",  raw: "Mũi khoan bê tông Bosch 8mm",          qty: 5,  unit: "cái", status: "matched", match: CATALOG[1], selected: true, selectedSupplier: "Bosch VN" },
  { id: "l6",  raw: "Mũi khoan sắt Makita 10mm",            qty: 12, unit: "cái", status: "matched", match: CATALOG[2], selected: true, selectedSupplier: "Makita VN" },
  { id: "l7",  raw: "Đá cắt sắt Hải Dương 350mm",           qty: 20, unit: "cái", status: "matched", match: CATALOG[3], selected: true, selectedSupplier: "Hải Dương" },
  { id: "l8",  raw: "Đá mài Bosch 100mm",                   qty: 22, unit: "cái", status: "matched", match: CATALOG[4], selected: true, selectedSupplier: "Bosch VN" },
  { id: "l9",  raw: "Kìm cắt điện Stanley 150mm",           qty: 15, unit: "cái", status: "matched", match: CATALOG[5], selected: true, selectedSupplier: "Stanley VN" },
];

/** Tạo thêm 27 dòng "matched" nữa để có tổng ~36 dòng.
 * Dùng seed deterministic (không Math.random) để SSR + CSR ra cùng giá trị,
 * tránh hydration mismatch nếu sau này render server-side.
 *
 * Vài line cố tình có qty rất cao (>200) → demo case "có hàng nhưng không đủ"
 * → cell qty hiện icon vàng + tooltip "X/qty", row có nền vàng nhạt. */
function expand(): RequestLine[] {
  const more: RequestLine[] = [];
  const matched = SAMPLE_LINES.filter((l) => l.status === "matched");
  // Cố tình mark vài index là "partial" để demo
  const partialIndices = new Set([3, 9, 16, 22]);
  for (let i = 0; i < 27; i++) {
    const ref = matched[i % matched.length];
    const baseQty = 1 + ((i * 7 + 3) % 30);
    // Partial line: qty cao gấp ~2-3 lần tổng stock của ref → guaranteed thiếu
    const partialQty = ref.match
      ? Math.floor(ref.match.suppliers.reduce((s, x) => s + x.stock, 0) * (1.5 + (i % 3) * 0.5))
      : baseQty * 10;
    more.push({
      ...ref,
      id: `g${i + 1}`,
      qty: partialIndices.has(i) ? partialQty : baseQty,
      raw: `${ref.raw} (lô ${i + 1})`,
    });
  }
  return more;
}

export const FULL_SAMPLE: RequestLine[] = [...SAMPLE_LINES, ...expand()];

export const PLACEHOLDER_TEXT = `Dán danh sách vật tư từ Excel, Word, Zalo hoặc gõ trực tiếp vào đây...

Ví dụ: 5 cái bạc đạn 6023, 100 con bulong M8 20, 10 mũi khoan 5 li, 1 máy khoan, 1 thùng RP7

— Hoặc bạn có thể dán (Ctrl+V) hình ảnh trực tiếp vào ô chat này.`;
