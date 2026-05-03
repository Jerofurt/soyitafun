'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const BUCKET = 'hospedagens'

function buildPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`
}

type ExistingItem = {
  id: string
  kind: 'existing'
  path: string
  status: 'done'
}

type NewItem = {
  id: string
  kind: 'new'
  file: File
  previewUrl: string
  status: 'uploading' | 'done' | 'error'
  path?: string
  error?: string
}

type Item = ExistingItem | NewItem

type Props = {
  hospedagemId: string
  initialPhotos: string[]
  onUploadingChange?: (isUploading: boolean) => void
}

export function PhotoUploader({
  hospedagemId,
  initialPhotos,
  onUploadingChange,
}: Props) {
  const [items, setItems] = useState<Item[]>(() =>
    initialPhotos.map((path) => ({
      id: crypto.randomUUID(),
      kind: 'existing' as const,
      path,
      status: 'done' as const,
    })),
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    const uploading = items.some(
      (it) => it.kind === 'new' && it.status === 'uploading',
    )
    onUploadingChange?.(uploading)
  }, [items, onUploadingChange])

  // Revoke blob URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => {
        if (it.kind === 'new') URL.revokeObjectURL(it.previewUrl)
      })
    }
  }, [])

  async function uploadOne(itemId: string, file: File) {
    const supabase = createClient()
    const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase()
    const path = `${hospedagemId}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })

    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId || it.kind !== 'new') return it
        if (error) {
          return { ...it, status: 'error', error: error.message }
        }
        return { ...it, status: 'done', path }
      }),
    )
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const additions: NewItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      kind: 'new',
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'uploading',
    }))
    setItems((prev) => [...prev, ...additions])
    additions.forEach((it) => {
      void uploadOne(it.id, it.file)
    })
  }

  function removeItem(itemId: string) {
    setItems((prev) => {
      const target = prev.find((it) => it.id === itemId)
      if (target?.kind === 'new') URL.revokeObjectURL(target.previewUrl)
      return prev.filter((it) => it.id !== itemId)
    })
  }

  function retryUpload(itemId: string) {
    const item = items.find((it) => it.id === itemId)
    if (!item || item.kind !== 'new') return
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId || it.kind !== 'new') return it
        return { ...it, status: 'uploading' as const, error: undefined }
      }),
    )
    void uploadOne(itemId, item.file)
  }

  // Hidden inputs for every persisted path (existing + successfully uploaded new)
  const persistedPaths = items
    .map((it) => {
      if (it.kind === 'existing') return it.path
      if (it.kind === 'new' && it.status === 'done' && it.path) return it.path
      return null
    })
    .filter((p): p is string => p !== null)

  return (
    <div className="space-y-4">
      {persistedPaths.map((p) => (
        <input key={p} type="hidden" name="fotos" value={p} />
      ))}

      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[11px] uppercase tracking-wider font-medium text-texto-principal bg-fondo-base hover:bg-fondo-base/60 border border-texto-secundario/25 hover:border-acento-mar/40 rounded-sm px-5 py-2.5 transition-colors duration-200"
        >
          + Adicionar fotos
        </button>
        {items.length > 0 && (
          <p className="text-xs text-texto-secundario">
            {items.length} {items.length === 1 ? 'foto' : 'fotos'}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-fondo-base/60 border border-dashed border-texto-secundario/25 rounded-sm px-8 py-12 text-center">
          <p className="text-sm text-texto-secundario leading-relaxed">
            Nenhuma foto adicionada ainda. Você pode subir várias de uma só vez,
            elas vão direto para o storage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((it) => (
            <PhotoCard
              key={it.id}
              item={it}
              onRemove={() => removeItem(it.id)}
              onRetry={() => retryUpload(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PhotoCard({
  item,
  onRemove,
  onRetry,
}: {
  item: Item
  onRemove: () => void
  onRetry: () => void
}) {
  const src =
    item.kind === 'existing' ? buildPhotoUrl(item.path) : item.previewUrl

  return (
    <div className="relative aspect-square rounded-sm overflow-hidden bg-fondo-base/60 border border-texto-secundario/15 group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="w-full h-full object-cover" />

      {item.kind === 'new' && item.status === 'uploading' && (
        <div className="absolute inset-0 bg-fondo-base/80 backdrop-blur-sm flex items-center justify-center">
          <p className="text-[11px] uppercase tracking-wider text-texto-secundario font-medium">
            Enviando…
          </p>
        </div>
      )}

      {item.kind === 'new' && item.status === 'error' && (
        <div className="absolute inset-0 bg-error/85 flex flex-col items-center justify-center gap-2 p-3">
          <p className="text-[11px] uppercase tracking-wider text-fondo-base font-medium text-center">
            Falha ao enviar
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="text-[11px] uppercase tracking-wider bg-fondo-base text-error font-medium rounded-sm px-3 py-1 hover:bg-fondo-base/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remover foto"
        className={cn(
          'absolute top-2 right-2 w-7 h-7 rounded-full bg-texto-principal/70 hover:bg-texto-principal text-fondo-base text-xs flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          'transition-opacity duration-200',
        )}
      >
        ✕
      </button>
    </div>
  )
}
