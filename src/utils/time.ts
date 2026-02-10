export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "hetki sitten";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min sitten`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h sitten`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "eilen";

  return `${days} pv sitten`;
}
