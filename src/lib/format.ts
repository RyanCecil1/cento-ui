export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCredits(value: number) {
  return `${formatNumber(value)} credits`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Send immediately";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatShortDateTime(value: string | null | undefined) {
  if (!value) return "Now";

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCurrencyGhs(value: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(value);
}
