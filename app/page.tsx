/**
 * Page principal — renderiza o formulário de perfil.
 *
 * Este é um Server Component (sem "use client").
 * Ele apenas importa e renderiza o PerfilForm,
 * que é um Client Component com a lógica interativa.
 */

import { PerfilForm } from "@/components/perfil-form";

export default function Home() {
  return <PerfilForm />;
}
