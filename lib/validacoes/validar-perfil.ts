/**
 * ============================================================
 * ETAPA 2 — VALIDAÇÃO SEGURA COM safeParse
 * ============================================================
 *
 * Por que safeParse e não parse?
 *
 * .parse()     → lança uma EXCEÇÃO se os dados forem inválidos.
 *                Precisa de try/catch. Se esquecer, o app quebra.
 *
 * .safeParse() → NUNCA lança exceção. Retorna um objeto com:
 *                { success: true, data: ... }   → dados válidos
 *                { success: false, error: ... } → erros detalhados
 *
 * Em aplicações reais (Nubank, VTEX), sempre se usa safeParse
 * para não deixar o app quebrar por dados de usuário.
 */

import { perfilSchema, type PerfilInput } from "../schemas/schema";

// ============================================================
// TIPO DE RETORNO DA FUNÇÃO
// ============================================================
// Usamos um "union type" (|) para dizer que a função pode
// retornar uma de duas formas possíveis.

type ResultadoValidacao =
  | {
      // Caso de SUCESSO: temos os dados tipados e prontos para usar
      sucesso: true;
      dados: PerfilInput;
      mensagem: string;
    }
  | {
      // Caso de ERRO: temos os erros organizados por campo
      sucesso: false;
      erros: Record<string, string[] | undefined>;
      mensagem: string;
    };

// ============================================================
// FUNÇÃO PRINCIPAL DE VALIDAÇÃO
// ============================================================

/**
 * Valida os dados de um formulário de perfil.
 *
 * @param dadosDoFormulario - Objeto com os dados brutos do formulário
 * @returns ResultadoValidacao - Sucesso com dados ou falha com erros por campo
 */
export function validarPerfil(dadosDoFormulario: unknown): ResultadoValidacao {
  // safeParse retorna { success, data } ou { success, error }
  // O tipo "unknown" é intencional: não confiamos nos dados de entrada
  const resultado = perfilSchema.safeParse(dadosDoFormulario);

  if (!resultado.success) {
    /**
     * .flatten() transforma o erro do Zod em um formato fácil de usar:
     *
     * Antes do flatten (formato raw do Zod):
     * { issues: [{ path: ["email"], message: "E-mail inválido" }] }
     *
     * Depois do flatten:
     * { fieldErrors: { email: ["E-mail inválido"] } }
     *
     * O formato { campo: ["mensagem1", "mensagem2"] } é perfeito
     * para exibir erros abaixo de cada campo no formulário.
     */
    const errosOrganizados = resultado.error.flatten().fieldErrors;

    return {
      sucesso: false,
      erros: errosOrganizados,
      mensagem: "Por favor, corrija os erros no formulário.",
    };
  }

  // Se chegou aqui, os dados são válidos!
  // resultado.data já é tipado como PerfilInput (TypeScript sabe o tipo)
  return {
    sucesso: true,
    dados: resultado.data,
    mensagem: "Usuário criado com sucesso!",
  };
}

// ============================================================
// SIMULAÇÃO DOS 3 CENÁRIOS OBRIGATÓRIOS
// ============================================================

function simularCenarios() {
  console.log("=".repeat(60));
  console.log("SIMULAÇÃO DE VALIDAÇÃO COM safeParse");
  console.log("=".repeat(60));

  // ── CENÁRIO 1: Dados VÁLIDOS ──────────────────────────────
  console.log("\n📋 CENÁRIO 1 — Dados completamente válidos");
  console.log("-".repeat(40));

  const dadosValidos = {
    nome: "Gabriel Felicidade",
    email: "gabriel@exemplo.com",
    bio: "Desenvolvedor Front-end apaixonado por TypeScript e boas práticas.",
    site: "https://gabriel.dev",
  };

  const resultado1 = validarPerfil(dadosValidos);

  if (resultado1.sucesso) {
    // ✅ Sucesso → dados tipados e prontos para salvar no banco
    console.log("✅", resultado1.mensagem);
    console.log("Dados tipados:", resultado1.dados);
  }
  // Saída esperada:
  // ✅ Usuário criado com sucesso!
  // Dados tipados: { nome: "Gabriel Felicidade", email: "gabriel@exemplo.com", ... }

  // ── CENÁRIO 2: UM campo inválido ─────────────────────────
  console.log("\n📋 CENÁRIO 2 — Um campo inválido (email ruim)");
  console.log("-".repeat(40));

  const dadosComEmailErrado = {
    nome: "Gabriel Felicidade",
    email: "isso-não-é-email", // ❌ formato inválido
    bio: "Bio normal aqui.",
  };

  const resultado2 = validarPerfil(dadosComEmailErrado);

  if (!resultado2.sucesso) {
    // ❌ Falha → mostramos os erros por campo
    console.log("❌", resultado2.mensagem);
    console.log("Erros por campo:", resultado2.erros);
  }
  // Saída esperada:
  // ❌ Por favor, corrija os erros no formulário.
  // Erros por campo: { email: ["Informe um e-mail válido, ex: voce@email.com."] }

  // ── CENÁRIO 3: MÚLTIPLOS erros ───────────────────────────
  console.log("\n📋 CENÁRIO 3 — Múltiplos erros simultâneos");
  console.log("-".repeat(40));

  const dadosMuitoErrados = {
    nome: "GF", // ❌ menos de 3 caracteres
    email: "nao-é-email", // ❌ formato inválido
    bio: "A".repeat(201), // ❌ passou do limite de 200 chars
    site: "sem-https.com", // ❌ não é uma URL válida
  };

  const resultado3 = validarPerfil(dadosMuitoErrados);

  if (!resultado3.sucesso) {
    console.log("❌", resultado3.mensagem);
    console.log("\nErros detalhados por campo:");

    // Percorremos os erros e exibimos campo por campo
    // (simulando o que o frontend faria para exibir em tela)
    for (const [campo, mensagens] of Object.entries(resultado3.erros)) {
      if (mensagens && mensagens.length > 0) {
        console.log(`  campo "${campo}":`, mensagens[0]);
      }
    }
  }
  // Saída esperada:
  // ❌ Por favor, corrija os erros no formulário.
  // Erros detalhados por campo:
  //   campo "nome": O nome precisa ter pelo menos 3 caracteres.
  //   campo "email": Informe um e-mail válido, ex: voce@email.com.
  //   campo "bio": A bio pode ter no máximo 200 caracteres.
  //   campo "site": Informe uma URL válida, ex: https://meusite.com.
}

if (process.env.RUN_SCHEMA_TESTS === "true") {
  simularCenarios();
}

