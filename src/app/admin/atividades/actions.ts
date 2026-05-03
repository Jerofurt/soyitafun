'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Flips atividades.ativo for a single row. Used by the inline toggle in the
 * listing — UX optimistic-flips on the client, then revalidates after the
 * server-side update lands.
 *
 * Full create/update/delete actions live in the same file once Sprint 3 step
 * (e) ships.
 */
export async function toggleAtivo(id: string): Promise<void> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('atividades')
    .select('ativo')
    .eq('id', id)
    .single<{ ativo: boolean }>()

  if (!existing) return

  await supabase
    .from('atividades')
    .update({ ativo: !existing.ativo })
    .eq('id', id)

  revalidatePath('/admin/atividades')
}
