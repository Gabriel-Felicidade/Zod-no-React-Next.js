/**
 * ============================================================
 * ETAPA 1 — CRIAÇÃO DE SCHEMAS COM ZOD
 * ============================================================
 *
 * O Zod permite criar "schemas" — contratos que definem como
 * os dados devem ser. Se os dados chegarem errados, o Zod
 * retorna mensagens de erro detalhadas.
 *
 * Por que usar Zod?
 * - TypeScript só valida em tempo de compilação (build)
 * - Zod valida em tempo de execução (runtime), protegendo
 *   contra dados vindos de formulários, APIs, etc.
 */

/**
 * ============================================================
 * COMPATIBILIDADE: Este projeto usa Zod v3 (^3.x)
 * - z.url()        → NÃO existe no v3. Use z.string().url()
 * - z.toUpperCase()→ NÃO existe no v3. Use .transform(s => s.toUpperCase())
 * - z.infer        → funciona igual no v3 e v4
 * ============================================================
 */
import { z } from "zod";

// ============================================================
// 1. SCHEMA DE PERFIL
// ============================================================

/**
 * z.object() cria um schema para objetos (dados com múltiplos campos).
 * Cada campo recebe suas regras de validação em cadeia (.min, .max, etc.)
 */
export const perfilSchema = z.object({
  // ─── nome ────────────────────────────────────────────────
  // .min(3) → mínimo de 3 caracteres
  // A mensagem é o texto que o usuário verá se errar
  nome: z
    .string({ required_error: "O nome é obrigatório." })
    .min(3, "O nome precisa ter pelo menos 3 caracteres.")
    .max(100, "O nome pode ter no máximo 100 caracteres.")
    .trim(), // remove espaços extras do início/fim

  // ─── email ───────────────────────────────────────────────
  // .optional() → o campo não é obrigatório.
  // Se for enviado, precisa ser um e-mail válido.
  // z.string().email().optional() significa: string OU undefined
  email: z
    .string()
    .email("Informe um e-mail válido, ex: voce@email.com.")
    .optional(),

  // ─── bio ─────────────────────────────────────────────────
  // .max(200) → limita a 200 caracteres
  // Também é opcional (o usuário pode não preencher)
  bio: z
    .string()
    .max(200, "A bio pode ter no máximo 200 caracteres.")
    .optional(),

  // ─── site ────────────────────────────────────────────────
  // No Zod v3, a URL se valida com z.string().url()
  // z.url() não existe no v3 — é exclusivo do v4
  // .optional() → não é obrigatório
  site: z
    .string()
    .url("Informe uma URL válida, ex: https://meusite.com.")
    .optional(),
});

/**
 * z.infer<typeof perfilSchema> gera o TIPO TypeScript automaticamente
 * a partir do schema. Não precisamos escrever o tipo manualmente!
 *
 * Resultado:
 * type PerfilInput = {
 *   nome: string;
 *   email?: string;
 *   bio?: string;
 *   site?: string;
 * }
 */
export type PerfilInput = z.infer<typeof perfilSchema>;

// ============================================================
// 2. SCHEMA DE ENDEREÇO
// ============================================================

/**
 * Para validar o CEP brasileiro, usamos .regex()
 * que aceita uma expressão regular (padrão de texto).
 *
 * O padrão /^\d{5}-\d{3}$/ significa:
 *   ^        → início da string
 *   \d{5}    → exatamente 5 dígitos (0-9)
 *   -        → o hífen literal
 *   \d{3}    → exatamente 3 dígitos
 *   $        → fim da string
 *
 * Aceita: "01310-100" ✅
 * Rejeita: "01310100", "abc-def", "1234-56" ❌
 */
export const enderecoSchema = z.object({
  // ─── rua ─────────────────────────────────────────────────
  rua: z
    .string({ required_error: "A rua é obrigatória." })
    .min(3, "Informe o nome da rua com pelo menos 3 caracteres.")
    .trim(),

  // ─── número ──────────────────────────────────────────────
  // Pode ser "123", "S/N", "Apto 4B" — usamos string mesmo
  numero: z
    .string({ required_error: "O número é obrigatório." })
    .min(1, "Informe o número do endereço."),

  // ─── cidade ──────────────────────────────────────────────
  cidade: z
    .string({ required_error: "A cidade é obrigatória." })
    .min(2, "O nome da cidade deve ter pelo menos 2 caracteres.")
    .trim(),

  // ─── estado ──────────────────────────────────────────────
  // .length(2) → exatamente 2 caracteres (sigla do estado: SP, RJ...)
  estado: z
    .string({ required_error: "O estado é obrigatório." })
    .length(2, "Use a sigla do estado com 2 letras, ex: SP.")
    // No Zod v3 não há .toUpperCase() — usamos .transform() para normalizar
    .transform((val) => val.toUpperCase()),

  // ─── cep ─────────────────────────────────────────────────
  // .regex() valida o formato exato do CEP brasileiro
  cep: z
    .string({ required_error: "O CEP é obrigatório." })
    .regex(/^\d{5}-\d{3}$/, "Informe o CEP no formato 00000-000."),
});

export type EnderecoInput = z.infer<typeof enderecoSchema>;

// ============================================================
// 3. TESTES COM console.log
// ============================================================
// Estes testes demonstram como o Zod valida os dados.
// Em produção, você removeria esses logs.
// Execute com: npx tsx lib/schemas/schema.ts

function rodarTestes() {
  console.log("=".repeat(50));
  console.log("TESTES DO SCHEMA DE PERFIL");
  console.log("=".repeat(50));

  // ── Teste 1: Dados válidos ────────────────────────────────
  const perfilValido = {
    nome: "Gabriel Felicidade",
    email: "gabriel@exemplo.com",
    bio: "Desenvolvedor apaixonado por TypeScript.",
    site: "https://gabriel.dev",
  };

  const resultadoValido = perfilSchema.safeParse(perfilValido);
  console.log("\n✅ Perfil VÁLIDO:");
  console.log(resultadoValido);
  // Resultado esperado: { success: true, data: { nome: "Gabriel Felicidade", ... } }

  // ── Teste 2: Dados inválidos ──────────────────────────────
  const perfilInvalido = {
    nome: "Gá", // muito curto (menos de 3 chars)
    email: "isso-nao-é-email", // formato inválido
    bio: "A".repeat(201), // passou do limite de 200 chars
    site: "sem-https.com", // não é URL válida
  };

  const resultadoInvalido = perfilSchema.safeParse(perfilInvalido);
  console.log("\n❌ Perfil INVÁLIDO:");
  console.log(JSON.stringify(resultadoInvalido, null, 2));
  // Resultado esperado: { success: false, error: { issues: [...] } }

  console.log("\n" + "=".repeat(50));
  console.log("TESTES DO SCHEMA DE ENDEREÇO");
  console.log("=".repeat(50));

  // ── Teste 3: Endereço válido ──────────────────────────────
  const enderecoValido = {
    rua: "Av. Paulista",
    numero: "1000",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100",
  };

  const resultadoEndValido = enderecoSchema.safeParse(enderecoValido);
  console.log("\n✅ Endereço VÁLIDO:");
  console.log(resultadoEndValido);
  // Resultado esperado: { success: true, data: { rua: "Av. Paulista", ... } }

  // ── Teste 4: CEP inválido ─────────────────────────────────
  const enderecoComCepErrado = {
    rua: "Rua das Flores",
    numero: "42",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    cep: "20040000", // falta o hífen! Formato errado
  };

  const resultadoEndInvalido = enderecoSchema.safeParse(enderecoComCepErrado);
  console.log("\n❌ Endereço com CEP INVÁLIDO:");
  console.log(JSON.stringify(resultadoEndInvalido, null, 2));
  // Resultado esperado: { success: false, error: { issues: [{ message: "Informe o CEP no formato 00000-000." }] } }
}

// Chama os testes apenas quando este arquivo for executado diretamente
// com: npx tsx lib/schemas/schema.ts
// NÃO executa quando importado pelo Next.js ou outro módulo
if (process.env.RUN_SCHEMA_TESTS === "true") {
  rodarTestes();
}
