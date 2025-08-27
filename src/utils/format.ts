export function formatCompliance(pass: number, total: number) {
  if (!total) return "-";
  const pct = Math.round((pass / total) * 100);
  return `${pct}%(${pass}/${total})`;
}
