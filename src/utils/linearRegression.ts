export type Point = { x: number; y: number };

export function fitLeastSquares(points: Point[]) {
  const n = points.length;
  if (n === 0) return { m: 0, b: 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumXX - sumX * sumX;
  const m = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return { m, b };
}

export function predict(points: Point[], m: number, b: number) {
  return points.map(p => ({ x: p.x, y: m * p.x + b }));
}

export function mse(points: Point[], m: number, b: number) {
  if (points.length === 0) return 0;
  const s = points.reduce((sum, p) => {
    const e = p.y - (m * p.x + b);
    return sum + e * e;
  }, 0);
  return s / points.length;
}

export function r2(points: Point[], m: number, b: number) {
  if (points.length === 0) return 0;
  const meanY = points.reduce((s, p) => s + p.y, 0) / points.length;
  const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
  const ssRes = points.reduce((sum, p) => sum + Math.pow(p.y - (m * p.x + b), 2), 0);
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

export function residuals(points: Point[], m: number, b: number) {
  return points.map(p => ({ x: p.x, y: p.y, resid: p.y - (m * p.x + b) }));
}
