export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function statusBadgeClass(status: string | null | undefined): string {
  if (!status) return "badge";
  const lower = status.toLowerCase();
  if (lower === "open" || lower === "converted") return "badge badge-open";
  if (lower === "investigating" || lower === "under_review")
    return "badge badge-investigating";
  if (lower === "closed" || lower === "cold" || lower === "rejected")
    return "badge badge-closed";
  return "badge";
}

export function severityBadgeClass(severity: string | null | undefined): string {
  if (!severity) return "badge";
  return `badge badge-${severity}`;
}
