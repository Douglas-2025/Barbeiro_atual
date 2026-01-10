import Link from "next/link"
import Image from "next/image"

// Página inicial (landing page) do sistema
// Por que: Primeira impressão do usuário, apresenta funcionalidades e direciona para agendamento
export default function Home() {
  return (

    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      
      {/* HERO / APRESENTAÇÃO DO SISTEMA */}
      {/* Por que: Seção principal que comunica valor do produto e chama para ação */}
      <section className="max-w-4xl mx-auto text-center">
        <img src="/logo.png" alt="Barbeiro Atual" className="w-55 h-29 mx-auto " />
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
          Barbeiro Atual
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Sistema moderno de agendamentos e gestão para barbearias.
        </p>

        {/* BOTÕES DE AÇÃO */}
        {/* Por que: CTAs (Call to Action) direcionam usuário para ação principal (agendar) */}
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <Link
            href="/agendamento"
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition font-medium shadow-lg hover:shadow-xl"
          >
            Agendar horário
          </Link>

          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-card border border-border hover:bg-accent transition"
          >
            Área do Barbeiro
          </Link>
        </div>
      </section>

      {/* CARDS DE FUNCIONALIDADES / PORTFÓLIO */}
      {/* Por que: Mostra principais features do sistema de forma visual e atrativa */}
      <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        {[
          { title: "Agenda Inteligente", tech: "Next.js + Prisma", img: "/proj1.png" },
          { title: "Gestão Financeira", tech: "Stripe", img: "/proj2.png" },
          { title: "Clientes & Histórico", tech: "PostgreSQL", img: "/proj3.png" },
        ].map((p) => (
          <div
            key={p.title}
            className="group overflow-hidden rounded-xl bg-card border border-border hover:border-primary transition cursor-pointer shadow-lg hover:shadow-xl"
          >
            <Image
              src={p.img}
              alt={p.title}
              width={400}
              height={220}
              className="object-cover w-full h-48"
            />
            <div className="p-4">
              <h3 className="font-semibold text-card-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.tech}</p>
            </div>
          </div>
        ))}
      </section>

      {/* RODAPÉ */}
      {/* Por que: Informações adicionais e data de atualização para transparência */}
      <footer className="mt-24 mb-12 text-center text-muted-foreground text-sm">
        Sistema em desenvolvimento • Última atualização{" "}
        {new Date().toLocaleDateString("pt-BR")}
      </footer>
    </main>
  )
}
