export function formatWIB(iso?: string, pattern?: Intl.DateTimeFormatOptions) {
  if (!iso) return "-";
  const opt: Intl.DateTimeFormatOptions =
    pattern || {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
  return new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", ...opt });
}
