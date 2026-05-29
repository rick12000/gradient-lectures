/** Prefix an internal path with the Astro `base` (e.g. /gradient-lectures). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseWithSlash}${normalizedPath}`;
}
