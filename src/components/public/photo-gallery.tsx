'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  /**
   * Already-built absolute photo URLs. The server component must map
   * Storage paths through buildPhotoUrl before passing — Next.js bans
   * passing functions across the RSC boundary into a client component.
   */
  photos: string[]
  alt: string
}

export function PhotoGallery({ photos, alt }: Props) {
  // Truncate silently to 5 visible (1 hero + up to 4 thumbs).
  const visible = photos.slice(0, 5)
  const [active, setActive] = useState(0)

  if (visible.length === 0) {
    return (
      <div className="aspect-[16/10] bg-fondo-card border border-texto-secundario/15 rounded-md flex items-center justify-center text-texto-secundario/60 text-sm uppercase tracking-wider">
        sem foto
      </div>
    )
  }

  const thumbs = visible.filter((_, i) => i !== active)

  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] rounded-md overflow-hidden bg-fondo-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visible[active]}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      {thumbs.length > 0 && (
        <div
          className={cn(
            'grid gap-3',
            thumbs.length === 1 && 'grid-cols-1',
            thumbs.length === 2 && 'grid-cols-2',
            thumbs.length === 3 && 'grid-cols-3',
            thumbs.length === 4 && 'grid-cols-4',
          )}
        >
          {visible.map((p, i) =>
            i === active ? null : (
              <button
                key={p}
                type="button"
                onClick={() => setActive(i)}
                className="aspect-[4/3] rounded-sm overflow-hidden bg-fondo-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento-mar focus-visible:ring-offset-2 focus-visible:ring-offset-fondo-base transition-opacity hover:opacity-85"
                aria-label={`Foto ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
