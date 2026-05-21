"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRequest } from "@/components/request-provider";
import { formatVND } from "@/lib/utils";
import { lineSubtotal } from "@/data/sample-request";
import { Truck, Tag } from "lucide-react";

type Props = {
  /** Show the big "Thanh toán" button (used on payment page) */
  onPay?: () => void;
  /** Custom CTA shown at bottom (used on checkout page) */
  cta?: React.ReactNode;
};

export function OrderSummary({ onPay, cta }: Props) {
  const { lines, shipping } = useRequest();
  const items = lines.filter((l) => l.selected && l.match);
  const subtotal = items.reduce((s, l) => s + lineSubtotal(l), 0);
  const vat = Math.round(subtotal * 0.08);
  const expressFee = shipping.deliveryMode === "express" ? 150000 : 0;
  const grand = subtotal + vat + expressFee;

  return (
    <Card className="p-5 sm:sticky sm:top-20">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-semibold">Tóm tắt đơn hàng</h3>
        <span className="text-xs text-muted-foreground">{items.length} sản phẩm đã chọn</span>
      </div>

      <div className="max-h-72 overflow-y-auto -mx-2 px-2 space-y-2 mt-3">
        {items.map((l) => (
          <div key={l.id} className="flex items-start justify-between gap-3 text-sm py-1">
            <div className="min-w-0">
              <div className="font-medium leading-snug truncate">{l.match?.name}</div>
              <div className="text-[11px] text-muted-foreground">
                SL: {l.qty} · VAT: {l.match?.vatPct}%
              </div>
            </div>
            <div className="font-semibold tabular-nums whitespace-nowrap">
              {formatVND(lineSubtotal(l))}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-3" />

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tạm tính (Chưa VAT)</span>
          <span className="tabular-nums">{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tổng tiền VAT</span>
          <span className="tabular-nums">{formatVND(vat)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            Phí vận chuyển
            {expressFee > 0 && <span className="text-[10px] text-amber-700">(hoả tốc)</span>}
          </span>
          {expressFee > 0 ? (
            <span className="tabular-nums font-medium text-amber-700">+{formatVND(expressFee)}</span>
          ) : (
            <span className="text-emerald-600 font-medium">Miễn phí</span>
          )}
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex justify-between items-baseline">
        <div>
          <div className="font-semibold">Tổng thanh toán</div>
          <div className="text-[10px] text-muted-foreground">(Đã bao gồm VAT)</div>
        </div>
        <span className="text-2xl font-bold brand-gradient-text tabular-nums">{formatVND(grand)}</span>
      </div>

      {onPay && (
        <button
          onClick={onPay}
          className="mt-4 w-full h-12 rounded-xl brand-gradient text-white font-semibold text-base shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Tag className="h-5 w-5" />
          Thanh toán
        </button>
      )}
      {cta}
    </Card>
  );
}
