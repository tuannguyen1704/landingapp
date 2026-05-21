import { toast } from "sonner";
import type { RequestLine } from "@/data/sample-request";
import { lineSubtotal } from "@/data/sample-request";

/** Xuất báo giá ra file CSV (Excel mở được). */
export function exportQuoteCSV(lines: RequestLine[], orderRef = "MEC-DRAFT") {
  const rows = [
    ["STT", "Mã SKU", "Tên sản phẩm", "Số lượng", "Đơn vị", "Đơn giá (chưa VAT)", "Thành tiền"],
  ];
  let runningSubtotal = 0;
  lines
    .filter((l) => l.selected && l.match)
    .forEach((l, i) => {
      const sub = lineSubtotal(l);
      runningSubtotal += sub;
      rows.push([
        String(i + 1),
        l.match!.sku,
        l.match!.name,
        String(l.qty),
        l.unit,
        String(l.match!.unitPrice),
        String(sub),
      ]);
    });
  const vat = Math.round(runningSubtotal * 0.08);
  rows.push([]);
  rows.push(["", "", "", "", "", "Tạm tính:", String(runningSubtotal)]);
  rows.push(["", "", "", "", "", "VAT 8%:", String(vat)]);
  rows.push(["", "", "", "", "", "Tổng cộng:", String(runningSubtotal + vat)]);

  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell);
          if (s.includes(",") || s.includes("\n") || s.includes('"')) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(","),
    )
    .join("\n");

  // Add UTF-8 BOM so Excel reads Vietnamese correctly
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MECSU-baogia-${orderRef}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Xuất báo giá PDF — mở print dialog để user "Save as PDF". */
export function exportQuotePDF(lines: RequestLine[], orderRef = "MEC-DRAFT") {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    toast.error("Trình duyệt chặn pop-up. Vui lòng cho phép để xuất PDF.");
    return;
  }
  const items = lines.filter((l) => l.selected && l.match);
  let subtotal = 0;
  const rows = items
    .map((l, i) => {
      const sub = lineSubtotal(l);
      subtotal += sub;
      return `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td><strong>${l.match!.sku}</strong></td>
          <td>${l.match!.name}</td>
          <td style="text-align:right">${l.qty} ${l.unit}</td>
          <td style="text-align:right">${formatVND(l.match!.unitPrice)}</td>
          <td style="text-align:right; font-weight:bold">${formatVND(sub)}</td>
        </tr>
      `;
    })
    .join("");
  const vat = Math.round(subtotal * 0.08);
  const grand = subtotal + vat;
  const today = new Date().toLocaleDateString("vi-VN");

  win.document.write(`
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Báo giá MECSU ${orderRef}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1a1a2e; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #7c3aed; }
  .logo { font-size: 28px; font-weight: 900; background: linear-gradient(135deg, #7c3aed, #2563eb); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .meta { text-align: right; font-size: 12px; color: #666; }
  h1 { font-size: 22px; margin: 16px 0 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
  th { background: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #d1d5db; font-size: 11px; text-transform: uppercase; }
  td { padding: 10px; border: 1px solid #e5e7eb; }
  .totals { width: 320px; margin-left: auto; margin-top: 16px; font-size: 13px; }
  .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { font-size: 18px; font-weight: bold; border-top: 2px solid #7c3aed; padding-top: 8px; margin-top: 8px; color: #7c3aed; }
  .footer { margin-top: 40px; font-size: 11px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">MECSU</div>
      <div style="font-size:11px;color:#666;margin-top:4px">Procurement AI · Cung ứng vật tư MRO</div>
    </div>
    <div class="meta">
      <div><strong>BÁO GIÁ #${orderRef}</strong></div>
      <div>Ngày: ${today}</div>
      <div>Hiệu lực: 48 giờ</div>
    </div>
  </div>

  <h1>Báo giá vật tư</h1>
  <p style="font-size:12px;color:#666">Báo giá tự động sinh từ hệ thống MECSU Procurement AI.</p>

  <table>
    <thead>
      <tr>
        <th style="width:40px">STT</th>
        <th style="width:110px">SKU</th>
        <th>Tên sản phẩm</th>
        <th style="width:80px;text-align:right">SL</th>
        <th style="width:110px;text-align:right">Đơn giá</th>
        <th style="width:120px;text-align:right">Thành tiền</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Tạm tính:</span><strong>${formatVND(subtotal)}</strong></div>
    <div class="row"><span>VAT 8%:</span><strong>${formatVND(vat)}</strong></div>
    <div class="row"><span>Vận chuyển:</span><strong>Miễn phí</strong></div>
    <div class="row grand"><span>Tổng cộng:</span><strong>${formatVND(grand)}</strong></div>
  </div>

  <div class="footer">
    <p><strong>Ghi chú:</strong> Báo giá đã gồm VAT 8%. Giá có thể thay đổi sau 48 giờ. Liên hệ NV kinh doanh để xác nhận đơn hàng.</p>
    <p>MECSU Co., Ltd · Hotline 1900 0000 · sales@mecsu.vn</p>
  </div>

  <button class="no-print" onclick="window.print()" style="margin-top:24px;padding:10px 20px;background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;border:0;border-radius:8px;cursor:pointer;font-weight:bold">In / Lưu PDF</button>
</body>
</html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}
