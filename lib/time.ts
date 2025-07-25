export function formatTime(epochMs: number) {
  const d = new Date(epochMs);
  // Slack-like short time
  const hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const h12 = ((hh + 11) % 12) + 1;
  const ampm = hh >= 12 ? "PM" : "AM";
  return `${h12}:${mm} ${ampm}`;
}
