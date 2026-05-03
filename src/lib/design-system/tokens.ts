/**
 * Design tokens for soyitafun.
 *
 * The same values are mirrored in `src/app/globals.css` under the Tailwind v4
 * `@theme {}` block so utilities like `bg-fondo-base` and `text-acento-mar`
 * resolve to these colors. Use this file when you need a token in TypeScript
 * (e.g. status badge color maps) — for styling, prefer the Tailwind utilities.
 *
 * Aesthetic: Mata Atlântica + ocean + sand. Aman Resorts meets pousada de
 * Itamambuca. Timeless, elegant, accessible. Not tropical pastel kitsch.
 */

export const colors = {
  fondoBase: '#FAF7F2',
  fondoCard: '#F0EBE0',
  textoPrincipal: '#1A2332',
  textoSecundario: '#5C6677',
  acentoMar: '#2C5F5D',
  acentoDourado: '#C9A961',
  error: '#B33A3A',
  success: '#4A7C59',
} as const

export type ColorToken = keyof typeof colors

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
} as const

export const radius = {
  sm: 4,
  md: 6,
} as const

export const transition = {
  default: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const
