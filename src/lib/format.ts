// src/lib/format.ts

export function formatIDR(amount: number): string {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0);
  } catch {
    return `Rp${Math.round(amount || 0).toLocaleString('id-ID')}`;
  }
}

export function formatIDDate(dateISO?: string | null): string {
  if (!dateISO) return '-';
  try {
    const d = new Date(dateISO);
    return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'short', day: '2-digit' }).format(d);
  } catch {
    return String(dateISO);
  }
}

