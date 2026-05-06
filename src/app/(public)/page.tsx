// Stub — replaced in commit 2 (home pública). The shell (header + footer) is
// already wired via (public)/layout.tsx so we can verify it renders.
export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 md:px-8 py-32 text-center">
      <p className="text-[11px] uppercase tracking-[0.25em] text-acento-dourado font-medium">
        Portal de Itamambuca
      </p>
      <h1 className="text-5xl md:text-6xl text-texto-principal mt-5">
        soyitafun
      </h1>
      <p className="text-base text-texto-secundario mt-6 leading-relaxed">
        110 praias, mata atlântica e cachoeiras escondidas no litoral norte de
        São Paulo.
      </p>
    </div>
  )
}
