'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function buildPhotoUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${base}/storage/v1/object/public/${bucket}/${path}`
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
  /**
   * Storage bucket where photos are uploaded. Default 'hospedagens' kept for
   * backwards compatibility with the original (single-domain) call site.
   */
  bucket?: string
  /**
   * Folder prefix inside the bucket. Each domain row should pass its own id
   * (or a stable pre-generated uuid for not-yet-persisted rows) so photos
   * are grouped per row and bulk-deletable.
   */
  folderPrefix: string
  initialPhotos: string[]
  onUploadingChange?: (isUploading: boolean) => void
}

export function PhotoUploader({
  bucket = 'hospedagens',
  folderPrefix,
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
    const path = `${folderPrefix}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from(bucket)
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

  function setAsMain(itemId: string) {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === itemId)
      if (idx <= 0) return prev
      const target = prev[idx]
      return [target, ...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }

  // The "principal" is the first item that will actually persist as fotos[0]
  // (existing or successfully uploaded). Uploading/error items are skipped so
  // the star always reflects what the public side will see.
  const principalId =
    items.find(
      (it) =>
        it.kind === 'existing' ||
        (it.kind === 'new' && it.status === 'done'),
    )?.id ?? null

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
              bucket={bucket}
              isPrincipal={it.id === principalId}
              onRemove={() => removeItem(it.id)}
              onRetry={() => retryUpload(it.id)}
              onSetMain={() => setAsMain(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PhotoCard({
  item,
  bucket,
  isPrincipal,
  onRemove,
  onRetry,
  onSetMain,
}: {
  item: Item
  bucket: string
  isPrincipal: boolean
  onRemove: () => void
  onRetry: () => void
  onSetMain: () => void
}) {
  const src =
    item.kind === 'existing'
      ? buildPhotoUrl(bucket, item.path)
      : item.previewUrl

  // Star is only meaningful for photos that will actually persist as fotos[i].
  const persisted =
    item.kind === 'existing' ||
    (item.kind === 'new' && item.status === 'done')

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

      {persisted && isPrincipal && (
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider font-medium bg-acento-dourado text-fondo-base rounded-sm px-1.5 py-0.5">
          Principal
        </span>
      )}

      {persisted && (
        <button
          type="button"
          onClick={isPrincipal ? undefined : onSetMain}
          aria-label={isPrincipal ? 'Foto principal' : 'Definir como foto principal'}
          aria-pressed={isPrincipal}
          disabled={isPrincipal}
          className={cn(
            'group/star absolute bottom-2 left-2 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center',
            isPrincipal ? 'cursor-default' : 'cursor-pointer',
          )}
        >
          <StarIcon filled={isPrincipal} />
        </button>
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

function StarIcon({ filled }: { filled: boolean }) {
  // Filled (principal): solid gold, no shadow. Empty: cream stroke with a soft
  // drop-shadow for legibility on any background; hovering the parent button
  // warms the stroke to gold and fades in a semi-transparent gold fill.
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-full h-full"
      style={{
        filter: filled ? undefined : 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))',
      }}
    >
      <path
        d="M12 2.6l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.7l-5.9 3.1 1.13-6.58L2.45 9.54l6.6-.96L12 2.6z"
        strokeWidth="1.6"
        strokeLinejoin="round"
        className={cn(
          'transition-colors duration-150',
          filled
            ? 'fill-acento-dourado stroke-acento-dourado'
            : 'fill-acento-dourado/0 stroke-fondo-base group-hover/star:fill-acento-dourado/55 group-hover/star:stroke-acento-dourado',
        )}
      />
    </svg>
  )
}
