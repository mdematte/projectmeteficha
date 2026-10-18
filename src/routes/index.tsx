import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Trophy, Sparkles, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-casino-sportsbook.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "METEFICHA.BET — Entre no jogo. Explore outro nivel." },
      { name: "description", content: "Lobby demonstrativo de cassino e sportsbook. Jogos, eventos e odds ficticios para testes." },
    ],
  }),
  component: Home,
});

const categories = [
  { name: "Slots", icon: Gamepad2 },
  { name: "Ao Vivo", icon: Sparkles },
  { name: "Futebol", icon: Trophy },
  { name: "Em Alta", icon: TrendingUp },
];

function Home() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl glow-border">
        <img
          src={heroImage}
          alt="Lobby cyberpunk do METEFICHA.BET combinando elementos de cassino e sportsbook em neon azul e roxo"
          className="h-56 w-full object-cover sm:h-72 lg:h-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
            Entre no jogo. <span className="text-gradient-neon">Explore outro nivel.</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            Cassino e sportsbook 100% demonstrativos. Saldo, odds e resultados ficticios, feitos para testar a experiencia.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/casino" className="rounded-full gradient-neon px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-105">
              Explorar cassino
            </Link>
            <Link to="/sportsbook" className="rounded-full border border-border bg-surface/80 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted">
              Ver eventos esportivos
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Categorias</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-5 transition-colors duration-200 hover:bg-muted">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <span className="text-sm font-medium text-card-foreground">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
        Ambiente demonstrativo: todo conteudo exibido (jogos, eventos, odds e saldo) e ficticio e nao envolve dinheiro real.
      </section>
    </div>
  );
}
