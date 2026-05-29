/** Prefix an internal path with the Astro `base` (e.g. /gradient-lectures). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
