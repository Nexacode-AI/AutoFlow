/** RM 1,234.56 */
export const fmtMoney = (n: number) =>
  `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** 1,234 */
export const fmtInt = (n: number) => n.toLocaleString('en-MY');

/** 03 Feb 2026 */
export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** 14:23 */
export const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** "2 hours ago" */
export const fmtRelative = (d: Date) => {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} d ago`;
  return fmtDate(d);
};

/** plate display: "WXY 1234" */
export const fmtPlate = (p: string) => p.toUpperCase();
