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
