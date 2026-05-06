'use client'

import {
  useActionState,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import {
  createHospedagem,
  deleteHospedagem,
  updateHospedagem,
  type ActionState,
} from '../actions'
import { Card, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn, slugify } from '@/lib/utils'
import { PhotoUploader } from '@/components/uploaders/photo-uploader'

const COMODIDADES = [
  'wifi',
  'ar condicionado',
  'ventilador',
  'piscina',
  'churrasqueira',
  'estacionamento',
  'cozinha',
  'lavanderia',
  'TV',
  'vista mar',
  'vista verde',
  'pé na areia',
  'pet friendly',
  'café da manhã',
] as const

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

export type HospedagemInitial = {
  id: string
  slug: string
  nome: string
  zona: string
  descricao: string | null
  fotos: string[] | null
  capacidade: number | null
  quartos: number | null
  banheiros: number | null
  comodidades: string[] | null
  preco_diaria_baixa: number | null
  preco_diaria_alta: number | null
  whatsapp: string | null
  email: string | null
  endereco: string | null
  lat: number | null
  lng: number | null
  instagram: string | null
  plano: string
  status: string
  data_inicio: string | null
  data_vencimento: string | null
  destaque: boolean
}

type Props =
  | { mode: 'create'; initial?: undefined; saved?: boolean }
  | { mode: 'edit'; initial: HospedagemInitial; saved?: boolean }

export function HospedagemForm(props: Props) {
  const { mode, saved } = props
  const initial = props.mode === 'edit' ? props.initial : undefined

  // Stable id for the photo folder prefix. In create mode we pre-generate so
  // photos can be uploaded before the row exists; in edit we reuse the row id.
  const [hospedagemId] = useState(() => initial?.id ?? crypto.randomUUID())

  const action =
    mode === 'create'
      ? createHospedagem
      : updateHospedagem.bind(null, hospedagemId)

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    { error: null },
  )

  // Controlled state for fields that drive auto-generation
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [plano, setPlano] = useState(initial?.plano ?? 'mensal')
  const [dataInicio, setDataInicio] = useState(initial?.data_inicio ?? '')
  const [dataVencimento, setDataVencimento] = useState(
    initial?.data_vencimento ?? '',
  )
  const [vencimentoTouched, setVencimentoTouched] = useState(mode === 'edit')

  // Photo uploader signals when an upload is in flight; we block submit until done.
  const [photosUploading, setPhotosUploading] = useState(false)

  // Slug auto-gen from nome (create mode only, until user edits slug manually)
  useEffect(() => {
    if (mode === 'create' && !slugTouched) {
      setSlug(slugify(nome))
    }
  }, [nome, slugTouched, mode])

  // data_vencimento auto-calc from plano + data_inicio (until user edits manually)
  useEffect(() => {
    if (!vencimentoTouched && dataInicio) {
      const days = plano === 'anual' ? 365 : 30
      setDataVencimento(addDays(dataInicio, days))
    }
  }, [plano, dataInicio, vencimentoTouched])

  // URL preview — host resolved client-side
  const [host, setHost] = useState('soyitafun.com')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.host)
    }
  }, [])

  const initialComodidades = initial?.comodidades ?? []

  return (
    <>
      <form action={formAction} className="space-y-8">
        {state.error && <ErrorBanner message={state.error} />}
        {saved && !state.error && <SavedBanner />}

        <Card>
          <CardBody className="p-12 space-y-12">
            <Section title="Informações básicas">
              <Field label="Nome" htmlFor="nome">
                <Input
                  id="nome"
                  name="nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Pousada Mata Atlântica"
                />
              </Field>

              <Field
                label="Slug"
                htmlFor="slug"
                hint={
                  <>
                    URL pública:{' '}
                    <span className="font-mono text-texto-principal">
                      {host}/hospedagens/{slug || '...'}
                    </span>
                  </>
                }
              >
                <Input
                  id="slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value)
                    setSlugTouched(true)
                  }}
                  placeholder="pousada-mata-atlantica"
                />
              </Field>

              <Field label="Descrição" htmlFor="descricao">
                <textarea
                  id="descricao"
                  name="descricao"
                  rows={5}
                  defaultValue={initial?.descricao ?? ''}
                  placeholder="Conte um pouco sobre a hospedagem, o entorno, o que torna especial..."
                  className={cn(
                    'w-full bg-fondo-base border border-texto-secundario/20 rounded-sm',
                    'px-4 py-3 text-sm text-texto-principal',
                    'placeholder:text-texto-secundario/50',
                    'transition-colors duration-200 resize-y',
                    'focus:outline-none focus:border-acento-mar focus:ring-1 focus:ring-acento-mar',
                  )}
                />
              </Field>
            </Section>

            <Section title="Localização">
              <Field label="Zona" htmlFor="zona">
                <Select
                  id="zona"
                  name="zona"
                  required
                  defaultValue={initial?.zona ?? ''}
                >
                  <option value="" disabled>
                    Selecione…
                  </option>
                  <option value="vila">Vila</option>
                  <option value="condominio">Condomínio</option>
                </Select>
              </Field>

              <Field label="Endereço" htmlFor="endereco">
                <Input
                  id="endereco"
                  name="endereco"
                  defaultValue={initial?.endereco ?? ''}
                  placeholder="Rua, número, referência"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitude" htmlFor="lat">
                  <Input
                    id="lat"
                    name="lat"
                    type="number"
                    step="0.000001"
                    defaultValue={initial?.lat ?? ''}
                    placeholder="-23.4286"
                  />
                </Field>
                <Field label="Longitude" htmlFor="lng">
                  <Input
                    id="lng"
                    name="lng"
                    type="number"
                    step="0.000001"
                    defaultValue={initial?.lng ?? ''}
                    placeholder="-45.0532"
                  />
                </Field>
              </div>

              <p className="text-xs text-texto-secundario leading-relaxed">
                💡 Pegue as coordenadas: abra o Google Maps, clique com o botão
                direito no local exato e copie os números que aparecem no topo
                do menu.
              </p>
            </Section>

            <Section title="Características">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Capacidade" htmlFor="capacidade">
                  <Input
                    id="capacidade"
                    name="capacidade"
                    type="number"
                    min="1"
                    required
                    defaultValue={initial?.capacidade ?? ''}
                    placeholder="6"
                  />
                </Field>
                <Field label="Quartos" htmlFor="quartos">
                  <Input
                    id="quartos"
                    name="quartos"
                    type="number"
                    min="0"
                    defaultValue={initial?.quartos ?? ''}
                    placeholder="3"
                  />
                </Field>
                <Field label="Banheiros" htmlFor="banheiros">
                  <Input
                    id="banheiros"
                    name="banheiros"
                    type="number"
                    min="0"
                    defaultValue={initial?.banheiros ?? ''}
                    placeholder="2"
                  />
                </Field>
              </div>

              <div>
                <Label>Comodidades</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMODIDADES.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-2.5 text-sm text-texto-principal cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        name="comodidades"
                        value={c}
                        defaultChecked={initialComodidades.includes(c)}
                        className="w-4 h-4 rounded-sm border border-texto-secundario/30 text-acento-mar focus:ring-acento-mar/30 focus:ring-1 cursor-pointer"
                      />
                      <span className="group-hover:text-acento-mar transition-colors duration-200">
                        {c}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Preços">
              <p className="text-xs text-texto-secundario -mt-2 leading-relaxed">
                Diárias em reais (R$). Deixe em branco se preferir tratar
                diretamente.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Baixa temporada" htmlFor="preco_diaria_baixa">
                  <Input
                    id="preco_diaria_baixa"
                    name="preco_diaria_baixa"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={initial?.preco_diaria_baixa ?? ''}
                    placeholder="350.00"
                  />
                </Field>
                <Field label="Alta temporada" htmlFor="preco_diaria_alta">
                  <Input
                    id="preco_diaria_alta"
                    name="preco_diaria_alta"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={initial?.preco_diaria_alta ?? ''}
                    placeholder="550.00"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Contato">
              <Field label="WhatsApp" htmlFor="whatsapp">
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  defaultValue={initial?.whatsapp ?? ''}
                  placeholder="5512999999999"
                />
              </Field>
              <Field
                label="Instagram"
                htmlFor="instagram"
                hint="Sem @, apenas o nome de usuário"
              >
                <Input
                  id="instagram"
                  name="instagram"
                  defaultValue={initial?.instagram ?? ''}
                  placeholder="pousadanome"
                />
              </Field>
              <Field label="E-mail" htmlFor="email">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={initial?.email ?? ''}
                  placeholder="contato@pousada.com"
                />
              </Field>
            </Section>

            <Section title="Fotos">
              <PhotoUploader
                bucket="hospedagens"
                folderPrefix={hospedagemId}
                initialPhotos={initial?.fotos ?? []}
                onUploadingChange={setPhotosUploading}
              />
            </Section>

            <Section title="Plano e vigência">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Plano" htmlFor="plano">
                  <Select
                    id="plano"
                    name="plano"
                    value={plano}
                    onChange={(e) => setPlano(e.target.value)}
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </Select>
                </Field>
                <Field label="Status" htmlFor="status">
                  <Select
                    id="status"
                    name="status"
                    defaultValue={initial?.status ?? 'pendente'}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="ativo">Ativo</option>
                    <option value="pausado">Pausado</option>
                    <option value="vencido">Vencido</option>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Data de início" htmlFor="data_inicio">
                  <Input
                    id="data_inicio"
                    name="data_inicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </Field>
                <Field
                  label="Data de vencimento"
                  htmlFor="data_vencimento"
                  hint={
                    !vencimentoTouched && dataInicio
                      ? `Calculado automaticamente (+${plano === 'anual' ? '365' : '30'} dias)`
                      : undefined
                  }
                >
                  <Input
                    id="data_vencimento"
                    name="data_vencimento"
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => {
                      setDataVencimento(e.target.value)
                      setVencimentoTouched(true)
                    }}
                  />
                </Field>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  name="destaque"
                  defaultChecked={initial?.destaque ?? false}
                  className="mt-0.5 w-4 h-4 rounded-sm border border-texto-secundario/30 text-acento-mar focus:ring-acento-mar/30 focus:ring-1 cursor-pointer"
                />
                <div>
                  <p className="text-sm text-texto-principal font-medium">
                    Destacar na home
                  </p>
                  <p className="text-xs text-texto-secundario mt-0.5">
                    Aparece em posição de destaque no portal público.
                  </p>
                </div>
              </label>
            </Section>
          </CardBody>
        </Card>

        {mode === 'create' && (
          <input type="hidden" name="id" value={hospedagemId} />
        )}

        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/hospedagens"
            className="text-[11px] uppercase tracking-wider text-texto-secundario hover:text-texto-principal transition-colors duration-200"
          >
            ← Cancelar
          </Link>
          <Button
            type="submit"
            size="lg"
            disabled={isPending || photosUploading}
          >
            {photosUploading
              ? 'Aguardando uploads…'
              : isPending
                ? 'Salvando…'
                : mode === 'create'
                  ? 'Criar hospedagem'
                  : 'Salvar alterações'}
          </Button>
        </div>
      </form>

      {mode === 'edit' && initial?.id && <DangerZone id={initial.id} />}
    </>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-5">
      <h2 className="text-xl text-texto-principal">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && (
        <p className="text-xs text-texto-secundario mt-2 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-error/10 border border-error/20 rounded-sm px-6 py-4">
      <p className="text-sm font-medium text-error">
        Não foi possível salvar
      </p>
      <p className="text-sm text-error/80 mt-1">{message}</p>
    </div>
  )
}

function SavedBanner() {
  return (
    <div className="bg-success/10 border border-success/20 rounded-sm px-6 py-4">
      <p className="text-sm font-medium text-success">
        Alterações salvas com sucesso.
      </p>
    </div>
  )
}

function DangerZone({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteHospedagem(id)
      // server action redirects on success
    })
  }

  return (
    <div className="mt-16 pt-8 border-t border-error/20">
      <p className="text-[11px] uppercase tracking-wider text-error font-medium">
        Zona de perigo
      </p>
      <p className="text-sm text-texto-secundario mt-2 mb-6 max-w-md leading-relaxed">
        Excluir esta hospedagem é permanente. As fotos no Storage também serão
        removidas.
      </p>

      {!confirming ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setConfirming(true)}
          className="border-error/30 text-error hover:border-error/60 hover:bg-error/5"
        >
          Excluir hospedagem
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-texto-principal">Tem certeza?</p>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? 'Excluindo…' : 'Sim, excluir'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirming(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
