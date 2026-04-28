"use client";
/**
 * ============================================================
 * ETAPA 3 — FORMULÁRIO REACT (FRONTEND)
 * ============================================================
 *
 * "use client" → Esta diretiva diz ao Next.js que este componente
 * roda no browser do usuário (client-side).
 *
 * Por que precisamos disso?
 * - useState e useActionState são hooks do React
 * - Hooks só funcionam em Client Components
 * - Server Components (sem "use client") são renderizados no servidor
 *   e não têm estado interativo
 */

import { useActionState } from "react";
import { salvarPerfilAction, type PerfilState } from "@/app/actions/salvar-perfil";

// ============================================================
// ESTADO INICIAL
// ============================================================
// O useActionState precisa de um estado inicial para começar.
// Definimos antes do componente para não ser recriado a cada render.
const estadoInicial: PerfilState = {
  sucesso: false,
};

// ============================================================
// COMPONENTE DE CAMPO REUTILIZÁVEL
// ============================================================
// Um mini-componente para evitar repetir o mesmo JSX para cada campo.
// Isso é uma boa prática: DRY (Don't Repeat Yourself).

interface CampoFormularioProps {
  id: string;
  label: string;
  tipo?: string;
  placeholder?: string;
  opcional?: boolean;
  erros?: string[];
  multiline?: boolean;
  maxLength?: number;
}

function CampoFormulario({
  id,
  label,
  tipo = "text",
  placeholder,
  opcional = false,
  erros,
  multiline = false,
  maxLength,
}: CampoFormularioProps) {
  const temErro = erros && erros.length > 0;

  // Classes CSS do input — muda a borda quando há erro
  const classeInput = [
    "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors",
    "focus:ring-2 focus:ring-offset-1",
    temErro
      ? "border-red-400 focus:ring-red-300 bg-red-50"
      : "border-zinc-300 focus:ring-blue-300 bg-white",
  ].join(" ");

  return (
    <div className="flex flex-col gap-1">
      {/* Label com indicador de campo opcional */}
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
        {opcional && (
          <span className="ml-1 text-xs text-zinc-400">(opcional)</span>
        )}
      </label>

      {/* Input ou Textarea, dependendo da prop multiline */}
      {multiline ? (
        <textarea
          id={id}
          name={id}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={classeInput}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={tipo}
          placeholder={placeholder}
          className={classeInput}
        />
      )}

      {/* Mensagem de erro — aparece apenas se houver erro */}
      {temErro && (
        <p className="text-xs text-red-600" role="alert">
          {/* role="alert" é importante para acessibilidade (leitores de tela) */}
          {erros[0]}
        </p>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL DO FORMULÁRIO
// ============================================================

export function PerfilForm() {
  /**
   * useActionState é o hook do React 19 / Next.js para integrar
   * formulários com Server Actions.
   *
   * Recebe: (serverAction, estadoInicial)
   * Retorna: [estadoAtual, formAction, isPending]
   *
   * - estadoAtual: o objeto retornado pela Server Action
   * - formAction: função que chamamos no action do <form>
   * - isPending: true enquanto a requisição está em andamento
   */
  const [estado, formAction, isPending] = useActionState(
    salvarPerfilAction,
    estadoInicial
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">
            Cadastro de Perfil
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Preencha seus dados. Campos marcados como opcional podem ser
            deixados em branco.
          </p>
        </div>

        {/*
         * action={formAction} → ao submeter, chama a Server Action
         * O Next.js cuida de tudo: serializar os dados, fazer a requisição,
         * atualizar o estado — sem precisar de fetch() manual.
         */}
        <form action={formAction} className="flex flex-col gap-5">
          {/* ── Nome ─────────────────────────────────────── */}
          <CampoFormulario
            id="nome"
            label="Nome completo"
            placeholder="Ex: Gabriel Felicidade"
            erros={estado.erros?.nome}
          />

          {/* ── E-mail ───────────────────────────────────── */}
          <CampoFormulario
            id="email"
            label="E-mail"
            tipo="email"
            placeholder="voce@exemplo.com"
            opcional
            erros={estado.erros?.email}
          />

          {/* ── Bio ──────────────────────────────────────── */}
          <CampoFormulario
            id="bio"
            label="Bio"
            placeholder="Conte um pouco sobre você (máx. 200 caracteres)"
            opcional
            multiline
            maxLength={200}
            erros={estado.erros?.bio}
          />

          {/* ── Site ─────────────────────────────────────── */}
          <CampoFormulario
            id="site"
            label="Site pessoal"
            tipo="url"
            placeholder="https://meusite.com"
            opcional
            erros={estado.erros?.site}
          />

          {/* ── Mensagem global de erro do servidor ──────── */}
          {!estado.sucesso && estado.mensagem && (
            <div
              className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {estado.mensagem}
            </div>
          )}

          {/* ── Mensagem de SUCESSO ───────────────────────── */}
          {estado.sucesso && estado.mensagem && (
            <div
              className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"
              role="status"
            >
              ✅ {estado.mensagem}
            </div>
          )}

          {/* ── Botão de envio ───────────────────────────── */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* Muda o texto enquanto a requisição está em andamento */}
            {isPending ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}
