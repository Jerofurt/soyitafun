export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Lower-case, accent-strip, replace non-alphanumerics with hyphens, collapse
 * runs and trim. Used to derive URL slugs from human names ("Maré Açu" →
 * "mare-acu"). Stable across server actions and client form auto-fill.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Normalize whatever the user pastes into the Instagram field down to a bare
 * handle. Operators paste the share link, the @-prefixed handle, or the bare
 * username — all three should land as the same canonical value in the DB so
 * that the public site can build `https://instagram.com/{handle}` without
 * branching. Returns null for empty input so the column stays nullable.
 */
export function sanitizeInstagramHandle(
  input: string | null | undefined,
): string | null {
  if (input == null) return null
  let s = input.trim()
  if (s === '') return null

  // Strip protocol + host if present (handles instagram.com, www.instagram.com,
  // m.instagram.com, with or without https://).
  s = s.replace(/^https?:\/\//i, '')
  s = s.replace(/^(?:www\.|m\.)?instagram\.com\//i, '')

  // Drop query string and fragment (?igsh=..., #foo).
  s = s.split('?')[0].split('#')[0]

  // Drop trailing slash and any trailing path segments.
  s = s.replace(/\/.*$/, '')

  // Drop a leading @ if the user pasted "@handle".
  s = s.replace(/^@+/, '')

  s = s.trim()
  return s === '' ? null : s
}
