"use client";
import * as React from "react";
import { FULL_SAMPLE, defaultAllocation, type RequestLine } from "@/data/sample-request";
import type { CatalogItem } from "@/data/catalog";

type Ctx = {
  /** danh sách dòng yêu cầu sau khi bóc tách */
  lines: RequestLine[];
  /** đã từng tải/paste để biết khi nào điều hướng */
  hasRequest: boolean;
  /** tên file/source */
  sourceLabel: string;
  loadSample: (label?: string) => void;
  setLines: (next: RequestLine[]) => void;
  updateLine: (id: string, patch: Partial<RequestLine>) => void;
  /** Xoá 1 dòng */
  removeLine: (id: string) => void;
  /** Nhân đôi 1 dòng (id mới) */
  duplicateLine: (id: string) => void;
  /** Thêm 1 sản phẩm catalog vào đơn hàng dạng line mới.
   *  Nếu `afterLineId` được truyền: insert ngay sau line đó (cho UX "thêm liên quan").
   *  Else: append cuối danh sách. Trả về line id mới. */
  addCatalogLine: (item: CatalogItem, qty?: number, afterLineId?: string) => string;
  /** Lịch sử đơn hàng đã đặt */
  orders: SavedOrder[];
  /** Lưu đơn hàng hiện tại sau khi /payment thành công */
  saveOrder: (orderId: string, totalAmount: number) => void;
  getOrder: (id: string) => SavedOrder | undefined;
  /** address/checkout state */
  shipping: ShippingInfo;
  setShipping: (s: ShippingInfo) => void;
  paymentMethod: "qr" | "credit" | "card" | "bnpl";
  setPaymentMethod: (m: Ctx["paymentMethod"]) => void;
  orderId: string;
  setOrderId: (s: string) => void;
  reset: () => void;
};

export type SavedOrder = {
  id: string;
  createdAt: number;
  totalAmount: number;
  itemCount: number;
  lines: RequestLine[];
  shipping: ShippingInfo;
  paymentMethod: string;
  status: "placed" | "confirmed" | "packed" | "shipped" | "delivered";
};

export type ShippingInfo = {
  recipient: string;
  phone: string;
  address: string;
  note: string;
  vatRequired: boolean;
  companyName: string;
  taxId: string;
  invoiceEmail: string;
  /** "all" = đợi đủ hàng giao 1 lần | "available-first" = mã có hàng giao trước */
  deliveryPriority: "all" | "available-first";
  /** "standard" = 1-3 ngày miễn phí | "express" = 4-8h, +150k */
  deliveryMode: "standard" | "express";
};

const DEFAULT_SHIPPING: ShippingInfo = {
  recipient: "Nguyễn Văn A",
  phone: "0988 123 456",
  address: "KCN Sóng Thần 2, Dĩ An, Bình Dương",
  note: "",
  vatRequired: true,
  companyName: "Công ty TNHH MECSU",
  taxId: "0312345678",
  invoiceEmail: "ketoan@mecsu.vn",
  deliveryPriority: "all",
  deliveryMode: "standard",
};

const C = React.createContext<Ctx | null>(null);
const KEY = "mecsu-request-v1";

const ORDERS_KEY = "mecsu-orders-v1";

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<RequestLine[]>([]);
  const [sourceLabel, setSourceLabel] = React.useState("");
  const [hydrated, setHydrated] = React.useState(false);
  const [shipping, setShipping] = React.useState<ShippingInfo>(DEFAULT_SHIPPING);
  const [paymentMethod, setPaymentMethod] = React.useState<Ctx["paymentMethod"]>("qr");
  const [orderId, setOrderId] = React.useState("");
  const [orders, setOrders] = React.useState<SavedOrder[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setLines(data.lines ?? []);
        setSourceLabel(data.sourceLabel ?? "");
        if (data.shipping) setShipping(data.shipping);
        if (data.paymentMethod) setPaymentMethod(data.paymentMethod);
        if (data.orderId) setOrderId(data.orderId);
      }
      const ordersRaw = localStorage.getItem(ORDERS_KEY);
      if (ordersRaw) setOrders(JSON.parse(ordersRaw));
      else {
        // Seed 3 đơn mẫu cho lịch sử trông có nội dung
        setOrders(seedOrders());
      }
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      KEY,
      JSON.stringify({ lines, sourceLabel, shipping, paymentMethod, orderId }),
    );
  }, [lines, sourceLabel, shipping, paymentMethod, orderId, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const value = React.useMemo<Ctx>(
    () => ({
      lines,
      hasRequest: lines.length > 0,
      sourceLabel,
      loadSample: (label = "Upload_Image.png") => {
        setLines(FULL_SAMPLE.map((l) => ({ ...l })));
        setSourceLabel(label);
      },
      setLines,
      updateLine: (id, patch) =>
        setLines((cur) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l))),
      removeLine: (id) => setLines((cur) => cur.filter((l) => l.id !== id)),
      duplicateLine: (id) => {
        setLines((cur) => {
          const idx = cur.findIndex((l) => l.id === id);
          if (idx === -1) return cur;
          const src = cur[idx];
          const newLine: RequestLine = {
            ...src,
            id: `dup-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
            raw: src.raw + " (bản sao)",
          };
          return [...cur.slice(0, idx + 1), newLine, ...cur.slice(idx + 1)];
        });
      },
      orders,
      saveOrder: (orderId, totalAmount) => {
        const newOrder: SavedOrder = {
          id: orderId,
          createdAt: Date.now(),
          totalAmount,
          itemCount: lines.filter((l) => l.selected && l.match).length,
          lines: lines.filter((l) => l.selected && l.match),
          shipping,
          paymentMethod,
          status: "placed",
        };
        // Bound 50 đơn gần nhất để tránh localStorage vượt 5MB sau ~1000 đơn (JSON.stringify throw)
        setOrders((cur) => [newOrder, ...cur].slice(0, 50));
      },
      getOrder: (id) => orders.find((o) => o.id === id),
      addCatalogLine: (item, qty = 1, afterLineId) => {
        const id = `add-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
        const newLine: RequestLine = {
          id,
          raw: item.name,
          qty,
          unit: item.unit,
          status: "matched",
          match: item,
          selectedSku: item.sku,
          selectedSupplier: item.suppliers[0]?.name,
          selected: true,
          allocations: defaultAllocation({ qty, match: item }),
        };
        setLines((cur) => {
          if (afterLineId) {
            const idx = cur.findIndex((l) => l.id === afterLineId);
            if (idx !== -1) return [...cur.slice(0, idx + 1), newLine, ...cur.slice(idx + 1)];
          }
          return [...cur, newLine];
        });
        return id;
      },
      shipping,
      setShipping,
      paymentMethod,
      setPaymentMethod,
      orderId,
      setOrderId,
      reset: () => {
        setLines([]);
        setSourceLabel("");
        setOrderId("");
      },
    }),
    [lines, sourceLabel, shipping, paymentMethod, orderId, orders],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

/** Sinh 3 đơn mẫu để màn lịch sử trông không trống. */
function seedOrders(): SavedOrder[] {
  const now = Date.now();
  const day = 86400000;
  return [
    {
      id: "MEC-9876",
      createdAt: now - day * 2,
      totalAmount: 12_540_000,
      itemCount: 8,
      lines: [],
      shipping: { ...DEFAULT_SHIPPING },
      paymentMethod: "qr",
      status: "delivered",
    },
    {
      id: "MEC-9920",
      createdAt: now - day * 7,
      totalAmount: 28_770_000,
      itemCount: 14,
      lines: [],
      shipping: { ...DEFAULT_SHIPPING, address: "Lô F2, KCN Tân Bình, TP.HCM" },
      paymentMethod: "credit",
      status: "shipped",
    },
    {
      id: "MEC-9954",
      createdAt: now - day * 18,
      totalAmount: 5_320_000,
      itemCount: 4,
      lines: [],
      shipping: { ...DEFAULT_SHIPPING, address: "Số 88 Nguyễn Văn Linh, Q.7" },
      paymentMethod: "qr",
      status: "delivered",
    },
  ];
}

export function useRequest() {
  const ctx = React.useContext(C);
  if (!ctx) throw new Error("useRequest must be used inside RequestProvider");
  return ctx;
}
