"use client";
import * as React from "react";

/**
 * Pseudo VietQR — vẽ ma trận pixel ngẫu nhiên trông giống QR code thật.
 * Trong production, sinh QR thật bằng `qrcode` package từ chuỗi VietQR.
 */
export function FakeQR({ size = 220, seed = "MECSU-9988" }: { size?: number; seed?: string }) {
  const grid = 31;
  const cells = React.useMemo(() => {
    const seedNum = Array.from(seed).reduce((s, c) => s + c.charCodeAt(0), 0);
    const rng = mulberry32(seedNum);
    const arr: boolean[][] = [];
    for (let r = 0; r < grid; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < grid; c++) row.push(rng() < 0.5);
      arr.push(row);
    }
    // 3 finder patterns at corners
    const drawFinder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++) {
          const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          arr[r0 + r][c0 + c] = onBorder || inner;
        }
    };
    drawFinder(0, 0);
    drawFinder(0, grid - 7);
    drawFinder(grid - 7, 0);
    return arr;
  }, [seed]);

  const cell = size / grid;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${grid} ${grid}`} className="rounded-lg bg-white p-0">
      <rect width={grid} height={grid} fill="white" />
      {cells.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0a0a0a" /> : null,
        ),
      )}
      {/* MECSU logo overlay */}
      <rect x={grid / 2 - 3} y={grid / 2 - 3} width={6} height={6} fill="white" />
      <text
        x={grid / 2}
        y={grid / 2 + 1.4}
        fontSize="3"
        fontWeight="bold"
        fill="#1e2b5c"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui"
      >
        M
      </text>
    </svg>
  );
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
