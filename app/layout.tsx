import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zod + Next.js | Validação de Formulários",
  description:
    "Projeto didático demonstrando validação de dados com Zod, safeParse e Server Actions no Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
