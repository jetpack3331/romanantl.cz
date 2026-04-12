export function placeholdUrl(w: number, h: number, text: string): string {
  return `https://placehold.co/${w}x${h}/D4C8BC/B89868?text=${encodeURIComponent(text)}`;
}
