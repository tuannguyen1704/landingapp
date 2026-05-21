/**
 * MECSU Catalog – data tham chiếu cho engine bóc tách & ép giá.
 * Trong production sẽ thay bằng API tới catalog service.
 */

export type CatalogItem = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  unitPrice: number;
  vatPct: number;
  leadTimeDays: number;
  suppliers: { name: string; price: number; stock: number; eta: number }[];
  image?: string; // dataURL SVG; nếu không có -> dùng generateImage(category)
};

/** Sinh ảnh placeholder SVG inline theo category. */
export function getProductImage(item: { image?: string; category?: string; sku?: string }): string {
  if (item.image) return item.image;
  return generateImage(item.category ?? "default", item.sku ?? "");
}

function generateImage(category: string, seed: string): string {
  const palette: Record<string, [string, string]> = {
    "Mũi khoan":     ["#7c3aed", "#a78bfa"],
    "Đá cắt":        ["#dc2626", "#f87171"],
    "Đá mài":        ["#ea580c", "#fb923c"],
    "Kìm":           ["#0891b2", "#22d3ee"],
    "Mỏ lết":        ["#0ea5e9", "#7dd3fc"],
    "Vòng bi":       ["#2563eb", "#60a5fa"],
    "Dây xích":      ["#65a30d", "#a3e635"],
    "Bu lông – ốc – vít": ["#92400e", "#d97706"],
    "Phớt chặn":     ["#059669", "#34d399"],
    "Mỡ bôi trơn":   ["#ca8a04", "#facc15"],
    "Khớp nối":      ["#9333ea", "#c084fc"],
    "Đá cắt / mài":  ["#dc2626", "#f87171"],
    "Theo thông số": ["#475569", "#94a3b8"],
    "AI gợi ý":      ["#7c3aed", "#a78bfa"],
    default:         ["#6366f1", "#a5b4fc"],
  };
  const [c1, c2] = palette[category] ?? palette.default;
  const shape = renderShape(category);
  const bg = `<rect width='200' height='200' fill='${c1}' fill-opacity='0.06'/>`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='g${seed.replace(/[^a-z0-9]/gi, "")}' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${c1}'/><stop offset='100%' stop-color='${c2}'/></linearGradient></defs>${bg}${shape.replace(/__C__/g, c1).replace(/__G__/g, `url(#g${seed.replace(/[^a-z0-9]/gi, "")})`)}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function renderShape(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("vòng bi")) {
    return `<circle cx='100' cy='100' r='70' fill='none' stroke='__C__' stroke-width='10'/><circle cx='100' cy='100' r='40' fill='none' stroke='__C__' stroke-width='6'/><circle cx='100' cy='100' r='18' fill='__G__'/>${[0,45,90,135,180,225,270,315].map((a)=>`<circle cx='${100+55*Math.cos(a*Math.PI/180)}' cy='${100+55*Math.sin(a*Math.PI/180)}' r='8' fill='__C__'/>`).join("")}`;
  }
  if (c.includes("mũi khoan")) {
    return `<polygon points='100,30 115,60 100,170 85,60' fill='__G__'/><polygon points='100,30 110,55 100,90 90,55' fill='__C__' opacity='0.5'/><circle cx='100' cy='178' r='4' fill='__C__'/>`;
  }
  if (c.includes("đá cắt") || c.includes("đá mài")) {
    return `<circle cx='100' cy='100' r='75' fill='__G__'/><circle cx='100' cy='100' r='75' fill='none' stroke='__C__' stroke-width='3' stroke-dasharray='4 3'/><circle cx='100' cy='100' r='12' fill='white'/><circle cx='100' cy='100' r='12' fill='none' stroke='__C__' stroke-width='2'/>`;
  }
  if (c.includes("kìm")) {
    return `<rect x='30' y='90' width='80' height='10' fill='__C__' transform='rotate(-30 70 95)'/><rect x='90' y='90' width='80' height='10' fill='__C__' transform='rotate(30 130 95)'/><circle cx='100' cy='100' r='8' fill='__G__'/><rect x='40' y='130' width='30' height='35' rx='10' fill='__C__'/><rect x='130' y='130' width='30' height='35' rx='10' fill='__C__'/>`;
  }
  if (c.includes("mỏ lết")) {
    return `<rect x='40' y='80' width='80' height='40' rx='6' fill='__G__'/><rect x='110' y='90' width='50' height='20' fill='__C__'/><rect x='115' y='75' width='10' height='50' fill='__C__'/><rect x='115' y='115' width='10' height='10' fill='white'/>`;
  }
  if (c.includes("dây xích") || c.includes("xích")) {
    return `${[35, 70, 105, 140].map((x, i)=>`<ellipse cx='${x}' cy='${100 + (i % 2 === 0 ? -15 : 15)}' rx='15' ry='25' fill='none' stroke='__C__' stroke-width='6' transform='rotate(${i % 2 === 0 ? 90 : 0} ${x} ${100 + (i % 2 === 0 ? -15 : 15)})'/>`).join("")}`;
  }
  if (c.includes("dây cáp") || c.includes("cáp điện")) {
    return `<path d='M30 100 Q100 30, 170 100' stroke='__G__' stroke-width='14' fill='none'/><path d='M30 100 Q100 30, 170 100' stroke='__C__' stroke-width='10' fill='none'/><circle cx='30' cy='100' r='10' fill='__C__'/><circle cx='170' cy='100' r='10' fill='__C__'/>`;
  }
  if (c.includes("bu lông") || c.includes("vít")) {
    return `<polygon points='80,40 120,40 130,55 120,70 80,70 70,55' fill='__C__'/><rect x='90' y='70' width='20' height='100' fill='__G__'/>${Array.from({length:8}).map((_,i)=>`<line x1='90' y1='${80+i*12}' x2='110' y2='${80+i*12}' stroke='__C__' stroke-width='1' opacity='0.5'/>`).join("")}`;
  }
  if (c.includes("phớt")) {
    return `<circle cx='100' cy='100' r='75' fill='none' stroke='__G__' stroke-width='14'/><circle cx='100' cy='100' r='45' fill='none' stroke='__C__' stroke-width='4' stroke-dasharray='6 4'/>`;
  }
  if (c.includes("mỡ")) {
    return `<rect x='60' y='40' width='80' height='130' rx='10' fill='__G__'/><rect x='60' y='40' width='80' height='20' rx='6' fill='__C__'/><rect x='85' y='15' width='30' height='25' rx='4' fill='__C__'/>`;
  }
  if (c.includes("khớp nối")) {
    return `<rect x='30' y='75' width='60' height='50' fill='__C__' opacity='0.7'/><rect x='110' y='75' width='60' height='50' fill='__C__' opacity='0.7'/><rect x='90' y='85' width='20' height='30' fill='__G__'/>`;
  }
  // default — generic box / package
  return `<rect x='40' y='50' width='120' height='100' rx='8' fill='__G__'/><rect x='40' y='50' width='120' height='100' rx='8' fill='none' stroke='__C__' stroke-width='3'/><line x1='40' y1='90' x2='160' y2='90' stroke='__C__' stroke-width='2' opacity='0.4'/><circle cx='150' cy='70' r='6' fill='__C__'/>`;
}

export const CATALOG: CatalogItem[] = [
  {
    sku: "1103N0038",
    name: "Mũi Khoan Thép List 500 Nachi D3.8",
    brand: "Nachi",
    category: "Mũi khoan",
    unit: "cái",
    unitPrice: 30000,
    vatPct: 8,
    leadTimeDays: 1,
    suppliers: [
      { name: "Smart V2",      price: 30000, stock: 220, eta: 1 },
      { name: "MRO Center",    price: 31500, stock: 80,  eta: 1 },
      { name: "Đông Á Tools",  price: 29500, stock: 40,  eta: 2 },
    ],
  },
  {
    sku: "BO-8MM-001",
    name: "Mũi khoan bê tông Bosch 8mm",
    brand: "Bosch",
    category: "Mũi khoan",
    unit: "cái",
    unitPrice: 90000,
    vatPct: 8,
    leadTimeDays: 1,
    suppliers: [
      { name: "Bosch VN",   price: 90000, stock: 150, eta: 1 },
      { name: "Smart V2",   price: 92000, stock: 60,  eta: 1 },
    ],
  },
  {
    sku: "MK-10MM-002",
    name: "Mũi khoan sắt Makita 10mm",
    brand: "Makita",
    category: "Mũi khoan",
    unit: "cái",
    unitPrice: 105000,
    vatPct: 8,
    leadTimeDays: 1,
    suppliers: [
      { name: "Makita VN",  price: 105000, stock: 90, eta: 1 },
      { name: "MRO Center", price: 108000, stock: 30, eta: 2 },
    ],
  },
  {
    sku: "HD-350-003",
    name: "Đá cắt sắt Hải Dương 350mm",
    brand: "Hải Dương",
    category: "Đá cắt",
    unit: "cái",
    unitPrice: 120000,
    vatPct: 8,
    leadTimeDays: 1,
    suppliers: [
      { name: "Hải Dương",  price: 120000, stock: 200, eta: 1 },
      { name: "Smart V2",   price: 122000, stock: 80,  eta: 1 },
    ],
  },
  {
    sku: "BO-100-004",
    name: "Đá mài Bosch 100mm",
    brand: "Bosch",
    category: "Đá mài",
    unit: "cái",
    unitPrice: 135000,
    vatPct: 8,
    leadTimeDays: 1,
    suppliers: [
      { name: "Bosch VN",   price: 135000, stock: 110, eta: 1 },
      { name: "MRO Center", price: 138000, stock: 50,  eta: 1 },
    ],
  },
  {
    sku: "ST-150-005",
    name: "Kìm cắt điện Stanley 150mm",
    brand: "Stanley",
    category: "Kìm",
    unit: "cái",
    unitPrice: 210000,
    vatPct: 8,
    leadTimeDays: 1,
    suppliers: [
      { name: "Stanley VN", price: 210000, stock: 70, eta: 1 },
      { name: "Smart V2",   price: 215000, stock: 40, eta: 2 },
    ],
  },
  {
    sku: "ST-WR-200",
    name: "Mỏ lết răng Stanley 200mm",
    brand: "Stanley",
    category: "Mỏ lết",
    unit: "cái",
    unitPrice: 245000,
    vatPct: 8,
    leadTimeDays: 1,
    suppliers: [
      { name: "Stanley VN", price: 245000, stock: 60, eta: 1 },
      { name: "Smart V2",   price: 250000, stock: 20, eta: 2 },
    ],
  },
];

/** Tìm 3-5 SKU gần nhất với mô tả mơ hồ (cho luồng "Hỏi Mai ngay" của dòng unclear).
 *  Heuristic đơn giản: token-overlap; nếu không match thì sinh virtual SKUs để demo. */
export function findClosestByText(text: string, limit = 5): CatalogItem[] {
  const t = text.toLowerCase();
  const tokens = t.split(/\s+/).filter((tok) => tok.length > 1);
  const scored = CATALOG.map((c) => {
    const hay = `${c.name} ${c.brand} ${c.category} ${c.sku}`.toLowerCase();
    const score = tokens.reduce((s, tok) => s + (hay.includes(tok) ? 1 : 0), 0);
    return { item: c, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);

  if (scored.length >= 3) return scored;

  // Fallback: sinh virtual SKUs theo từ khoá để demo
  const virtuals = generateVirtualMatches(text, limit - scored.length);
  return [...scored, ...virtuals];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateVirtualMatches(text: string, n: number): CatalogItem[] {
  const brands = ["3M", "Sika", "Selleys", "Stanley", "Total"];
  const ratings = [4.6, 4.5, 4.4, 4.7, 4.3];
  return Array.from({ length: Math.max(0, n) }).map((_, i) => {
    const brand = brands[i % brands.length];
    const price = 35000 + i * 18000;
    return {
      sku: `MAI-AI-${i + 1}`,
      name: `${capitalize(text)} ${brand} (Mai gợi ý)`,
      brand,
      category: "AI gợi ý",
      unit: "cái",
      unitPrice: price,
      vatPct: 8,
      leadTimeDays: 1 + (i % 3),
      suppliers: [
        { name: "MRO Smart V2", price, stock: 80 - i * 10, eta: 1 },
        { name: "Đại lý " + brand, price: price + 2000, stock: 30, eta: 2 },
      ],
    } as CatalogItem;
  });
}

/** Tạo gợi ý sản phẩm theo specs đã nhập (cho luồng "Bổ sung thông số").
 *  Demo: sinh 3-5 mã virtual có chứa specs trong tên + brand khác nhau. */
export function findBySpecs(rawText: string, specs: Record<string, string>): CatalogItem[] {
  const specStr = Object.entries(specs)
    .filter(([, v]) => v && v.trim())
    .map(([, v]) => v)
    .join(" ");
  if (!specStr) return [];
  const brands = ["Vinasteel", "An Phú", "Total", "Stanley", "Asaki"];
  return brands.slice(0, 4).map((brand, i) => {
    const price = 25000 + i * 12000;
    return {
      sku: `SP-${brand.replace(/\s/g, "").toUpperCase().slice(0, 4)}-${i + 1}`,
      name: `${capitalize(rawText)} ${specStr} (${brand})`,
      brand,
      category: "Theo thông số",
      unit: "cái",
      unitPrice: price,
      vatPct: 8,
      leadTimeDays: 1 + (i % 2),
      suppliers: [
        { name: "MRO Smart V2", price, stock: 50 - i * 5, eta: 1 },
        { name: brand + " VN", price: price + 1500, stock: 25, eta: 2 },
      ],
    } as CatalogItem;
  });
}

/** Sản phẩm liên quan: cùng category, khác SKU. */
export function getRelatedProducts(sku: string): CatalogItem[] {
  const item = CATALOG.find((c) => c.sku === sku);
  if (!item) return [];
  return CATALOG.filter((c) => c.category === item.category && c.sku !== sku);
}

/** Sản phẩm thay thế: có thể khác brand nhưng cùng category & function.
 *  Demo: kết hợp catalog + suggestions list, ưu tiên giá khác biệt. */
export function getAlternativeProducts(sku: string): CatalogItem[] {
  const item = CATALOG.find((c) => c.sku === sku);
  if (!item) return [];
  // Catalog cùng category nhưng khác brand
  const cross = CATALOG.filter((c) => c.category === item.category && c.brand !== item.brand);
  // Cộng thêm 4 hàng "thay thế" virtual để demo
  const virtuals: CatalogItem[] = [
    {
      ...item,
      sku: item.sku + "-ALT-A",
      name: `${item.name.replace(item.brand, "Total")} (Thay thế Total)`,
      brand: "Total",
      unitPrice: Math.round(item.unitPrice * 0.7),
      suppliers: item.suppliers.map((s) => ({ ...s, price: Math.round(s.price * 0.7) })),
    },
    {
      ...item,
      sku: item.sku + "-ALT-B",
      name: `${item.name.replace(item.brand, "Asaki")} (Thay thế Asaki)`,
      brand: "Asaki",
      unitPrice: Math.round(item.unitPrice * 0.85),
      suppliers: item.suppliers.map((s) => ({ ...s, price: Math.round(s.price * 0.85) })),
    },
    {
      ...item,
      sku: item.sku + "-ALT-C",
      name: `${item.name.replace(item.brand, "Top Cement")} (Thay thế Top Cement)`,
      brand: "Top Cement",
      unitPrice: Math.round(item.unitPrice * 0.65),
      suppliers: item.suppliers.map((s) => ({ ...s, price: Math.round(s.price * 0.65) })),
    },
  ];
  return [...cross, ...virtuals];
}

/** Top 12 đề xuất khi user gõ "mỏ lết răng stanley" — minh hoạ chọn-1-trong-N. */
export const SUGGESTIONS_MOLET: CatalogItem[] = [
  { ...CATALOG[6], sku: "ST-WR-150", name: "Mỏ lết răng Stanley 150mm", unitPrice: 195000 },
  CATALOG[6],
  { ...CATALOG[6], sku: "ST-WR-250", name: "Mỏ lết răng Stanley 250mm", unitPrice: 295000 },
  { ...CATALOG[6], sku: "ST-WR-300", name: "Mỏ lết răng Stanley 300mm", unitPrice: 365000 },
  { ...CATALOG[6], sku: "ST-WR-350", name: "Mỏ lết răng Stanley 350mm", unitPrice: 425000 },
  { ...CATALOG[6], sku: "ST-WR-450", name: "Mỏ lết răng Stanley 450mm", unitPrice: 580000 },
  { ...CATALOG[6], sku: "ST-WR-600", name: "Mỏ lết răng Stanley 600mm", unitPrice: 850000 },
  { ...CATALOG[6], sku: "TT-WR-200", name: "Mỏ lết răng Total 200mm",   brand: "Total",   unitPrice: 145000 },
  { ...CATALOG[6], sku: "TT-WR-250", name: "Mỏ lết răng Total 250mm",   brand: "Total",   unitPrice: 175000 },
  { ...CATALOG[6], sku: "AS-WR-200", name: "Mỏ lết răng Asaki 200mm",   brand: "Asaki",   unitPrice: 165000 },
  { ...CATALOG[6], sku: "AS-WR-250", name: "Mỏ lết răng Asaki 250mm",   brand: "Asaki",   unitPrice: 198000 },
  { ...CATALOG[6], sku: "TC-WR-200", name: "Mỏ lết răng Top Cement 200mm", brand: "Top Cement", unitPrice: 132000 },
];
