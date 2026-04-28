"use server";
/**
 * ============================================================
 * ETAPA 3 — SERVER ACTION COM NEXT.JS
 * ============================================================
 *
 * "use server" → Esta diretiva diz ao Next.js que esta função
 * roda APENAS no servidor (nunca no browser do usuário).
 *
 * Vantagens de validar no servidor:
 * - Segurança: o código de validação não fica exposto ao usuário
 * - Confiabilidade: mesmo que o usuário burle o frontend, o
 *   backend rejeita os dados inválidos
 * - Padrão de mercado: empresas como Nubank sempre validam
 *   tanto no front (UX) quanto no back (segurança)
 */

import { perfilSchema } from "@/lib/schemas/schema";

// ============================================================
// TIPOS
// ============================================================

/**
 * Este tipo define o "estado" que a Server Action retorna.
 * O useActionState no frontend vai ler este estado para saber
 * o que mostrar ao usuário.
 */
export type PerfilState = {
  sucesso: boolean;
  mensagem?: string;
  // Erros organizados por campo: { nome: ["msg"], email: ["msg"] }
  erros?: Record<string, string[] | undefined>;
};

// ============================================================
// SERVER ACTION
// ============================================================

/**
 * salvarPerfilAction — Função que roda no servidor ao submeter o formulário.
 *
 * @param _estadoAnterior - Estado anterior (exigido pelo useActionState, ignoramos aqui)
 * @param formData - Dados crus vindos do <form> HTML
 * @returns PerfilState - Sucesso ou erros por campo
 */
export async function salvarPerfilAction(
  _estadoAnterior: PerfilState,
  formData: FormData
): Promise<PerfilState> {
  /**
   * Object.fromEntries(formData) converte o FormData em um objeto JS simples.
   *
   * FormData (formato bruto):
   *   FormData { nome: "Gabriel", email: "g@email.com" }
   *
   * Depois do Object.fromEntries():
   *   { nome: "Gabriel", email: "g@email.com" }
   *
   * Isso é necessário porque o Zod trabalha com objetos, não com FormData.
   */
  const dadosBrutos = Object.fromEntries(formData);

  /**
   * Convertemos strings vazias para undefined antes de validar.
   * Isso é necessário porque campos opcionais no HTML sempre enviam
   * uma string vazia "" quando não preenchidos, mas o Zod espera
   * undefined para campos marcados como .optional()
   */
  const dadosNormalizados = {
    ...dadosBrutos,
    email: dadosBrutos.email || undefined,
    bio: dadosBrutos.bio || undefined,
    site: dadosBrutos.site || undefined,
  };

  // Valida os dados com o schema de perfil
  const resultado = perfilSchema.safeParse(dadosNormalizados);

  // ── Caso de ERRO ──────────────────────────────────────────
  if (!resultado.success) {
    return {
      sucesso: false,
      mensagem: "Por favor, corrija os erros abaixo.",
      erros: resultado.error.flatten().fieldErrors,
    };
  }

  // ── Caso de SUCESSO ───────────────────────────────────────
  // Aqui você salvaria no banco de dados (Prisma, Drizzle, etc.)
  // Por enquanto, simulamos com um console.log
  console.log("✅ Perfil salvo com sucesso:", resultado.data);

  // Simula um delay de banco de dados (remova em produção)
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    sucesso: true,
    mensagem: `Perfil de "${resultado.data.nome}" salvo com sucesso! 🎉`,
  };
}
