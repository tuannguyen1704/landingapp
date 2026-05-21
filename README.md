# MECSU – Procurement AI (UI Prototype)

Prototype giao diện cho cổng B2B **MECSU**: paste/upload danh sách vật tư MRO → AI bóc tách → chốt mã → ép giá NCC → đặt hàng & thanh toán.

> **Không phải e-commerce thông thường** — đây là procurement tool có:
> - Bảng tổng hợp vật tư dạng Excel grid (có thể tick/chọn từng dòng)
> - 4 trạng thái dòng: matched · cần chọn (1-trong-N) · không rõ tên · thiếu thông số
> - Trợ lý AI **"Mai – Trợ lý MRO"** sidebar có thể chat trực tiếp về dòng vật tư đang xử lý
> - Ép giá realtime nhiều NCC, cho phép đổi NCC từng dòng
> - Thanh toán đa kênh: VietQR · công nợ 30 ngày · thẻ · BNPL Fundiin

---

## 1. Chạy local

Yêu cầu: **Node.js ≥ 18.18**.

```bash
npm install
npm run dev
# mở http://localhost:3000
```

Build production: `npm run build && npm start`.

---

## 2. Tech stack

| Lớp | Lựa chọn |
|-----|----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui style |
| State | React Context + localStorage (`RequestProvider`) |
| Icon | `lucide-react` |
| Toast | `sonner` |
| Modal | `@radix-ui/react-dialog` |

---

## 3. Luồng 4 bước

```
[1] Tìm kiếm   → /              (paste/upload danh sách)
                /processing      (loading bóc tách AI – 3s)
[2] Chốt mã    → /match          (excel grid + Mai chat)
[3] Báo giá    → /quote          (ép giá NCC realtime)
[4] Thanh toán → /checkout       (địa chỉ + VAT)
                /payment         (QR/công nợ/thẻ/BNPL)
                /success         (đặt hàng thành công)
```

Header có **stepper 4 bước** highlight bước hiện tại.

---

## 4. Mô tả từng màn hình

### 4.1. `/` — Tạo yêu cầu báo giá mới
- Textarea lớn cho paste danh sách (nhận drag-drop file).
- 2 nút "Tải File Excel" / "Tải Ảnh".
- Hỗ trợ: `.xlsx, .csv, .pdf, .png, .jpg`.
- Quick start: "Dùng dữ liệu mẫu 36 dòng" để demo.
- Trust strip 3 USP + Quy trình 4 bước.

### 4.2. `/processing` — Đang bóc tách
- Spinner kép + 3 bước nhỏ (đọc file → bóc tách AI → chuẩn hoá SKU).
- Tự chuyển sang `/match` sau ~3s.

### 4.3. `/match` — Bảng tổng hợp vật tư ⭐
**Header**: tên file source + nút "+ Thêm vật tư" + badge `28/36 dòng đã chốt mã`.
**Excel grid**:

| ☐ | STT | Yêu cầu gốc | Sản phẩm khớp (hệ thống) | SL | Đơn giá / Báo giá | Thao tác |
|---|-----|-------------|---------------------------|-----|--------------------|----------|

4 trạng thái mỗi row (có border trái màu):
- 🟢 **matched** — hiện tên SP + SKU
- 🔵 **choose** — "Cần chọn 1 trong N sản phẩm đề xuất" + nút **Chọn mã** → mở modal `SuggestionPicker`
- 🔴 **unclear** — "Không rõ tên vật tư" + nút **Hỏi Mai ngay**
- 🟠 **missing** — "Thiếu thông số kỹ thuật" + nút **Bổ sung thông số**

**Sticky bottom bar**: cảnh báo còn N dòng chưa chốt + 3 actions (gửi báo giá / hỏi Mai / tiếp tục).

**Mai chat panel** (right sidebar, lg+):
- Avatar Mai với green dot online.
- Hiện context "Đang hỗ trợ: <tên dòng>" khi user click Mai từ row.
- Quick replies: "Đề xuất rẻ hơn" · "Xem lịch sử giá" · "So sánh NCC" · "Giải thích vì sao khớp mã này".
- Input "Nhắn tin cho Mai..." + send button.
- Có response giả lập theo context (xem `mai-chat-panel.tsx::generateReply`).
- Mobile: floating button góc dưới phải.

### 4.4. `/quote` — Ép giá NCC
- Bảng tương tự /match nhưng có cột **Nhà cung cấp / Lựa chọn** dropdown:
  - Mỗi NCC hiện giá / tồn / ETA.
  - Badge "Rẻ nhất" tự động.
- Cột **Đơn giá** show skeleton trước, fade-up khi quét xong.
- Modal trung tâm: **"Đang ép giá NCC..."** với gauge tròn `0% → 100%`, đếm `X/Y sản phẩm đã quét`.
- Thời hạn báo giá 48H (fake countdown).
- Bottom: tổng đơn (gồm VAT) + 2 nút: **Lưu báo giá** / **Tạo đơn mua hàng**.

### 4.5. `/checkout` — Thông tin giao hàng & VAT
- Card "Địa chỉ nhận hàng": người nhận, phone, địa chỉ, ghi chú.
- Toggle **"Yêu cầu xuất hoá đơn VAT"** → expand form công ty/MST/email.
- Right sidebar: `OrderSummary` (sticky).

### 4.6. `/payment` — Thanh toán
- **Phương thức QR** (default, expand sẵn): QR code giả + tên TK + số TK + nút copy + ghi chú nội dung CK `MEC-9988`.
- **Công nợ 30 ngày** (badge VIP) — hạn mức hiển thị.
- **Thẻ tín dụng/ghi nợ** — Visa/MC/JCB/Amex.
- **BNPL Fundiin** — chia 3 kỳ.
- Right sidebar `OrderSummary` có **nút cam "Thanh toán X đ"** prominent.
- Khi click Pay → SteppedLoader 4 bước (1.7s) → chuyển `/success`.

### 4.7. `/success` — Đặt hàng thành công
- Big check + ping animation.
- Card thông tin: mã đơn `#MEC-9988`, total, phương thức, giao hàng dự kiến.
- 2 actions: Về trang chủ (clear data) / Theo dõi đơn hàng.

---

## 5. Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx              # SiteHeader + RequestProvider
│   ├── globals.css             # Tailwind + skeleton + scan-line + step-dots
│   ├── page.tsx                # / Tạo yêu cầu báo giá
│   ├── processing/page.tsx     # Loading bóc tách
│   ├── match/page.tsx          # ⭐ Excel grid + Mai chat
│   ├── quote/page.tsx          # Ép giá NCC
│   ├── checkout/page.tsx       # Địa chỉ + VAT
│   ├── payment/page.tsx        # QR/công nợ/thẻ/BNPL
│   └── success/page.tsx        # Đặt hàng thành công
├── components/
│   ├── ui/                     # button, card, input, badge, label, separator
│   ├── request-provider.tsx    # State toàn flow (lines + shipping + payment)
│   ├── site-header.tsx         # Logo MECSU + 4-step nav stepper
│   ├── mai-chat-panel.tsx      # Chat sidebar AI Mai
│   ├── suggestion-picker.tsx   # Modal chọn 1 trong N gợi ý
│   ├── supplier-select        # (inline trong quote/page.tsx)
│   ├── stepped-loader.tsx     # Loader nhảy bước
│   ├── order-summary.tsx       # Sidebar tóm tắt đơn (checkout & payment)
│   └── qr-code.tsx             # Pseudo VietQR
├── data/
│   ├── catalog.ts              # 7 SKU + 12 gợi ý mỏ lết răng
│   └── sample-request.ts       # Sample 36 dòng yêu cầu mẫu
└── lib/utils.ts                # cn(), formatVND()
```

---

## 6. Key animation & UX (cảm giác nhanh)

| Kỹ thuật | Vị trí |
|----------|--------|
| **Stepper top nav** | Mọi page — user luôn biết đang ở đâu |
| **Stepped loader** | `/processing`, `/payment` (sau khi click Pay) |
| **Scan-line overlay** | Bảng /quote khi đang ép giá |
| **Gauge tròn 0→100%** | Modal ép giá NCC |
| **Skeleton + fade-up** | Cột giá trong /quote, dòng trong /match |
| **Row border màu** | Indicator trạng thái dòng (matched/choose/unclear/missing) |
| **Toast tức thì** | Mọi action (chốt mã, copy, lưu) |
| **Active scale-98** | Mọi button |
| **Mai typing dots** | Khi Mai đang "suy nghĩ" |
| **Ping ring** | Success page check icon |

---

## 7. Hướng dẫn IT khi build production

### 7.1. API endpoints cần BE cung cấp

| Method | Endpoint | Body / Query | Mục đích |
|--------|----------|--------------|----------|
| POST | `/api/parse` | `{ text?, file? }` | AI bóc tách → trả về `RequestLine[]` |
| GET | `/api/catalog/search` | `q` | Trả về `CatalogItem[]` để fill `suggestions` |
| POST | `/api/quote/scan` | `{ lineIds[] }` | Stream SSE/WebSocket: `{ lineId, suppliers[] }` per line |
| POST | `/api/quote/save` | `{ lines, customer }` | Lưu báo giá → `quoteId, pdfUrl` |
| POST | `/api/orders` | `{ lines, shipping, paymentMethod }` | Tạo đơn → `orderId` |
| GET | `/api/payment/qr` | `orderId` | Sinh chuỗi VietQR thật (thay `FakeQR`) |

### 7.2. AI bóc tách (Parse engine)
Trong prototype dùng `loadSample()` trả về `FULL_SAMPLE` cố định. Production cần:
- OCR ảnh (Google Vision / AWS Textract) cho upload ảnh.
- Excel parser (sheetjs) cho `.xlsx/.csv`.
- LLM (GPT-4 / Claude / Gemini) chuẩn hoá:
  - Tách `qty + unit + description`.
  - Embed search vào catalog SKU → matched / choose / unclear / missing.
  - Trả về JSON theo schema `RequestLine` (xem `src/data/sample-request.ts`).

### 7.3. Mai chat (Trợ lý MRO)
Hiện chat reply là **rule-based mock** (`generateReply()`). Production:
- Tích hợp LLM với system prompt + RAG từ catalog + lịch sử mua.
- Stream response để giữ feel "đang gõ".
- Lưu hội thoại vào BE (cho NV sourcing review).

### 7.4. Ép giá NCC (`/quote`)
- Hiện là setInterval giả lập tăng %.
- Production: WebSocket/SSE stream từ supplier integration service.
- Mỗi response: `{ lineId, supplierName, price, stock, eta }` → cập nhật cell + tăng %.
- Timeout 30-60s, fallback price từ catalog.

### 7.5. VietQR thật
Component `FakeQR` chỉ là placeholder. Production:
```bash
npm i qrcode
```
```ts
import QR from "qrcode";
const dataUrl = await QR.toDataURL(vietQRString);
// vietQRString format: https://vietqr.io/#/api/embed
```

### 7.6. Cần bổ sung trước go-live
- [ ] Auth (login công ty / NV mua hàng).
- [ ] Lịch sử báo giá / đơn hàng (`/orders`).
- [ ] Quản lý nhiều địa chỉ giao mặc định.
- [ ] Webhook nhận xác nhận thanh toán từ ngân hàng (cho QR).
- [ ] Sinh PDF báo giá có dấu công ty (puppeteer/react-pdf).
- [ ] Email/SMS notification khi đặt đơn.
- [ ] Analytics funnel: parse → match → quote → order.
- [ ] Bot Mai có handoff sang NV thật khi cần.

### 7.7. Design tokens

| Token | Giá trị | Dùng |
|-------|---------|------|
| `--primary` (MECSU navy) | `226 57% 24%` | Logo, header chính |
| `--accent` (action blue) | `217 91% 60%` | Button, link, focus ring |
| Orange CTA | `bg-orange-500` | Nút thanh toán cuối |
| Status colors | emerald (matched), blue (choose), red (unclear), amber (missing) | Border row + label |
| Radius | `0.625rem` | Tất cả border-radius |

---

## 8. Câu hỏi mở (cần sếp / IT trả lời)

1. **Mai chatbot có handoff sang sale thật không**, hay 100% AI?
2. **Công nợ 30 ngày**: ai duyệt hạn mức? có cần API kết nối ERP không?
3. **VietQR**: dùng nhà cung cấp nào (VietQR.io, Casso, Misa)?
4. **Webhook xác nhận thanh toán**: tự động chuyển trạng thái đơn → confirmed?
5. **PDF báo giá**: template ai làm, có chữ ký số không?
6. **Hạn 48H báo giá**: hết hạn thì tự huỷ hay user phải refresh?
7. **Khi user đổi NCC**: có lock giá tại thời điểm đó hay vẫn realtime?
8. **Multi-warehouse**: tồn kho hiện chỉ 1 con số — có cần chia kho HCM/HN không?

---

**Status**: 7 trang hoàn chỉnh, dev server `localhost:3000`, sẵn sàng demo & handoff.
