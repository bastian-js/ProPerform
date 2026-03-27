export function parseDecimal(value: string): number | null {
  if (!value) return null;

  const normalized = value.replace(',', '.').trim();
  const num = Number(normalized);

  if (!Number.isFinite(num)) return null;
  if (num <= 0) return null;

  return num;
}
