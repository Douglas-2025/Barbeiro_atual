import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Fontes do Google Fonts
// Por que: Tipografia moderna e legível para melhor experiência do usuário
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata da aplicação
// Por que: Melhora SEO e aparência quando compartilhado em redes sociais
export const metadata: Metadata = {
  title: "Barbeiro Atual - Sistema de Agendamento",
  description: "Sistema moderno de agendamentos e gestão para barbearias",
};

// Layout raiz da aplicação
// Por que: Define estrutura HTML base e aplica estilos globais
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
