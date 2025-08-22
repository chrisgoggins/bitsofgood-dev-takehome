export function formatDate(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

export function formatCamelCase(string: string) {
  const spacedString = string.replace(/([A-Z])/g, ' $1');
  const result = spacedString.charAt(0).toUpperCase() + spacedString.slice(1);
  return result.trim();
}