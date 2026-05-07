'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/hospedagens', label: 'Hospedagens' },
  { href: '/atividades', label: 'O que fazer' },
  { href: '/comercios', label: 'Comércios' },
  { href: '/servicos', label: 'Serviços' },
] as const

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-200',
          scrolled
            ? 'bg-fondo-base/85 backdrop-blur-md border-b border-texto-secundario/15'
            : 'bg-transparent border-b border-transparent',
        )}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl text-texto-principal tracking-tight"
            onClick={() => setMobileOpen(false)}
          >
            soyitafun
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-texto-principal/85 hover:text-acento-mar transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-texto-principal"
          >
            <span className="relative block w-5 h-3.5">
              <span
                className={cn(
                  'absolute left-0 right-0 h-px bg-current transition-all duration-200',
                  mobileOpen ? 'top-1.5 rotate-45' : 'top-0',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 right-0 top-1.5 h-px bg-current transition-opacity duration-200',
                  mobileOpen ? 'opacity-0' : 'opacity-100',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 right-0 h-px bg-current transition-all duration-200',
                  mobileOpen ? 'top-1.5 -rotate-45' : 'top-3',
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-30 bg-fondo-base transition-opacity duration-200',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="pt-20 px-8 flex flex-col gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="font-display text-3xl text-texto-principal py-4 border-b border-texto-secundario/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
