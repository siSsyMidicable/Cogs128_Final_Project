export function formatDate(d: any) { return String(d); }
export function formatDateTime(d: any) { return String(d); }
export function formatInvoiceItems(items: any[]) { return items || []; }
export function formatStripSuffix(s: string) { return s; }
export function formatEllipses(s: string, n = 10) { return s?.length > n ? s.slice(0, n) + '...' : s; }
export function formatSentenceCase(s: string) { return s; }
