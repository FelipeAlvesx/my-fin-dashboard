"use client";

import { useActionState, useRef, useState } from "react";
import {
  logout,
  updateEmail,
  updatePassword,
  type UpdateProfileState,
} from "@/app/actions/auth";

const initialState: UpdateProfileState = { error: null };

// ─── Ícones ──────────────────────────────────────────────────────────────────

function IconMail({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconPhoto({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-2xl md:p-6", className].join(" ")}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#4de08f]/25 bg-[#0a1f15] text-[#7cffb2]">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-[#b8eed0]/70">{description}</p>
      </div>
    </div>
  );
}

function FeedbackMessage({ error, success, successMsg }: { error: string | null; success?: boolean; successMsg: string }) {
  if (!error && !success) return null;
  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2.5 text-sm text-red-300">
        {error}
      </p>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#4de08f]/30 bg-[#0a1f15] px-4 py-2.5 text-sm text-[#7cffb2]">
      <IconCheck className="h-4 w-4 shrink-0" />
      {successMsg}
    </div>
  );
}

// ─── Photo section ────────────────────────────────────────────────────────────

function PhotoSection() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setDone(false);
  }

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    // Simulação — integração real requer Supabase Storage configurado
    await new Promise((r) => setTimeout(r, 1200));
    setUploading(false);
    setDone(true);
  }

  return (
    <SectionCard>
      <SectionHeader
        icon={<IconPhoto className="h-4 w-4" />}
        title="Foto de perfil"
        description="Personalize sua identidade no dashboard"
      />

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* Avatar preview */}
        <div
          className="relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#4de08f]/30 bg-[#0a1f15] transition hover:border-[#4de08f]/60"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-[#7cffb2]/50">
              <IconPhoto className="h-8 w-8" />
              <span className="text-[10px]">Escolher</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-xs text-[#b8eed0]/70">
            Clique no avatar ou no botão abaixo para selecionar uma imagem (JPG, PNG, WebP · máx. 2 MB).
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl border border-[#4de08f]/30 bg-[#0a1f15] px-4 py-2 text-xs font-medium text-[#9ef6c8] transition hover:border-[#4de08f]/60 hover:text-white"
            >
              Selecionar imagem
            </button>

            {preview && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-xl border border-[#4de08f]/40 bg-[linear-gradient(135deg,rgba(14,40,26,0.95),rgba(10,28,18,0.9))] px-4 py-2 text-xs font-semibold text-[#9ef6c8] shadow-[0_4px_20px_-4px_rgba(77,224,143,0.35)] transition hover:border-[#4de08f]/70 hover:text-white disabled:opacity-50"
              >
                {uploading ? "Salvando…" : "Salvar foto"}
              </button>
            )}
          </div>

          {done && (
            <div className="flex items-center gap-2 text-xs text-[#7cffb2]">
              <IconCheck className="h-3.5 w-3.5" /> Foto atualizada!
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Email section ────────────────────────────────────────────────────────────

function EmailSection() {
  const [state, formAction, isPending] = useActionState(updateEmail, initialState);

  return (
    <SectionCard>
      <SectionHeader
        icon={<IconMail className="h-4 w-4" />}
        title="Alterar e-mail"
        description="O link de confirmação será enviado para o novo endereço"
      />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email-new" className="text-xs font-medium uppercase tracking-[0.18em] text-[#9ef2c6]">
            Novo e-mail
          </label>
          <input
            id="email-new"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            placeholder="novo@email.com"
            className="w-full rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 text-sm text-white placeholder-[#7ca98a]/60 outline-none transition duration-200 focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25 disabled:opacity-50"
          />
        </div>

        <FeedbackMessage
          error={state.error}
          success={state.success}
          successMsg="E-mail atualizado! Verifique sua caixa de entrada para confirmar."
        />

        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-2xl border border-[#4de08f]/40 bg-[linear-gradient(135deg,rgba(14,40,26,0.95),rgba(10,28,18,0.9))] px-5 py-2.5 text-sm font-semibold text-[#9ef6c8] shadow-[0_8px_32px_-8px_rgba(77,224,143,0.35)] transition hover:border-[#4de08f]/70 hover:text-white disabled:opacity-50"
        >
          {isPending ? "Salvando…" : "Salvar e-mail"}
        </button>
      </form>
    </SectionCard>
  );
}

// ─── Password section ─────────────────────────────────────────────────────────

function PasswordSection() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState);

  return (
    <SectionCard>
      <SectionHeader
        icon={<IconLock className="h-4 w-4" />}
        title="Alterar senha"
        description="Use no mínimo 8 caracteres"
      />

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password-new" className="text-xs font-medium uppercase tracking-[0.18em] text-[#9ef2c6]">
            Nova senha
          </label>
          <input
            id="password-new"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 text-sm text-white placeholder-[#7ca98a]/60 outline-none transition duration-200 focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password-confirm" className="text-xs font-medium uppercase tracking-[0.18em] text-[#9ef2c6]">
            Confirmar nova senha
          </label>
          <input
            id="password-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-[#7cebaf]/30 bg-[#0a1f15] px-4 py-3 text-sm text-white placeholder-[#7ca98a]/60 outline-none transition duration-200 focus:border-[#9cf7c8] focus:ring-2 focus:ring-[#65f09c]/25 disabled:opacity-50"
          />
        </div>

        <FeedbackMessage
          error={state.error}
          success={state.success}
          successMsg="Senha alterada com sucesso!"
        />

        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-2xl border border-[#4de08f]/40 bg-[linear-gradient(135deg,rgba(14,40,26,0.95),rgba(10,28,18,0.9))] px-5 py-2.5 text-sm font-semibold text-[#9ef6c8] shadow-[0_8px_32px_-8px_rgba(77,224,143,0.35)] transition hover:border-[#4de08f]/70 hover:text-white disabled:opacity-50"
        >
          {isPending ? "Salvando…" : "Salvar senha"}
        </button>
      </form>
    </SectionCard>
  );
}

// ─── Logout section ───────────────────────────────────────────────────────────

function LogoutSection() {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await logout();
  }

  return (
    <SectionCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Sair da conta</h2>
          <p className="mt-0.5 text-xs text-[#b8eed0]/70">Encerra sua sessão neste dispositivo</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={pending}
          className="flex items-center gap-2 self-start rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:border-red-500/60 hover:text-red-300 disabled:opacity-50 sm:self-auto"
        >
          <IconLogout className="h-4 w-4" />
          {pending ? "Saindo…" : "Sair"}
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContaPage() {
  return (
    <div className="relative min-h-full text-[#edfff4]">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#4cf58f]/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#1f9358]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8 md:px-8 md:py-10">
        {/* Page header */}
        <div className="mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9ef6c8]">
            Configurações
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
            Minha conta
          </h1>
          <p className="mt-1 text-sm text-[#cefae2]/70">
            Gerencie suas informações e preferências
          </p>
        </div>

        <PhotoSection />
        <EmailSection />
        <PasswordSection />
        <LogoutSection />
      </div>
    </div>
  );
}
