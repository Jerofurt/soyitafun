import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = 'https://soyitafun.netlify.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [
    { data: hospedagens },
    { data: atividades },
    { data: comercios },
    { data: servicos },
  ] = await Promise.all([
    supabase
      .from('hospedagens')
      .select('slug, created_at')
      .eq('status', 'ativo'),
    supabase
      .from('atividades')
      .select('slug, created_at')
      .eq('status', 'ativo'),
    supabase
      .from('comercios')
      .select('slug, created_at')
      .eq('status', 'ativo'),
    supabase
      .from('servicos')
      .select('slug, created_at')
      .eq('status', 'ativo'),
  ])

  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/hospedagens`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/atividades`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/comercios`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/servicos`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const hospedagemEntries: MetadataRoute.Sitemap = (hospedagens ?? []).map(
    (h: { slug: string; created_at: string | null }) => ({
      url: `${SITE_URL}/hospedagens/${h.slug}`,
      lastModified: h.created_at ? new Date(h.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  )

  const atividadeEntries: MetadataRoute.Sitemap = (atividades ?? []).map(
    (a: { slug: string; created_at: string | null }) => ({
      url: `${SITE_URL}/atividades/${a.slug}`,
      lastModified: a.created_at ? new Date(a.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  )

  const comercioEntries: MetadataRoute.Sitemap = (comercios ?? []).map(
    (c: { slug: string; created_at: string | null }) => ({
      url: `${SITE_URL}/comercios/${c.slug}`,
      lastModified: c.created_at ? new Date(c.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  )

  const servicoEntries: MetadataRoute.Sitemap = (servicos ?? []).map(
    (s: { slug: string; created_at: string | null }) => ({
      url: `${SITE_URL}/servicos/${s.slug}`,
      lastModified: s.created_at ? new Date(s.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  )

  return [
    ...staticEntries,
    ...hospedagemEntries,
    ...atividadeEntries,
    ...comercioEntries,
    ...servicoEntries,
  ]
}
