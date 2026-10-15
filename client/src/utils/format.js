export const EXAM_LABEL = {
  internal: "Internal",
  external: "External",
  retest: "Retest",
};

export function paperTitle(p) {
  const when = [p.month, p.year].filter(Boolean).join(" ");
  return `${when} ${EXAM_LABEL[p.examType] || p.examType}`;
}

export function subjectLabel(s) {
  if (!s) return "";
  return s.code ? `${s.code} ${s.name}` : s.name;
}

export function timeAgo(date) {
  const sec = Math.floor((Date.now() - new Date(date)) / 1000);
  if (sec < 60) return "just now";
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, s] of units) {
    const n = Math.floor(sec / s);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
