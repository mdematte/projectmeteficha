import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Heart, Gamepad2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/casino")({
  head: () => ({
    meta: [
      { title: "Cassino Demonstrativo — METEFICHA.BET" },
      { name: "description", content: "Catalogo demonstrativo de jogos de cassino: slots, mesa e ao vivo. Conteudo ficticio para testes." },
    ],
  }),
  component: CasinoPage,
});

interface GameRow {
  id: string;
  name: string;
  slug: string;
  image_path: string | null;
  status: string;
  demo_available: boolean;
  launch_mode: string;
  game_categories: { name: string } | null;
}

function CasinoPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("games")
      .select("id,name,slug,image_path,status,demo_available,launch_mode,game_categories(name)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setGames(data as unknown as GameRow[]);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_favorites")
      .select("game_id")
      .eq("user_id", user.id)
      .then(({ data }) => setFavorites(new Set((data ?? []).map((f) => f.game_id))));
  }, [user?.id]);

  async function toggleFavorite(gameId: string) {
    if (!user) {
      toast.error("Entre na sua conta para favoritar jogos.");
      return;
    }
    const isFav = favorites.has(gameId);
    if (isFav) {
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("game_id", gameId);
      setFavorites((prev) => { const n = new Set(prev); n.delete(gameId); return n; });
    } else {
      await supabase.from("user_favorites").insert({ user_id: user.id, game_id: gameId });
      setFavorites((prev) => new Set(prev).add(gameId));
    }
  }

  async function openGame(game: GameRow) {
    if (user) {
      await supabase.from("user_recent_games").insert({ user_id: user.id, game_id: game.id });
    }
    if (game.launch_mode === "demo_screen") {
      toast.info(`"${game.name}" abriu em tela demonstrativa (sem integracao real com provedor).`);
    } else if (game.launch_mode === "unavailable") {
      toast.warning("Este jogo ainda nao esta disponivel para jogar.");
    } else {
      toast.info("Integracao com provedor externo ainda nao configurada neste ambiente.");
    }
  }

  const filtered = (games ?? []).filter((g) => g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-foreground">Catalogo de Cassino</h1>
      <p className="mt-1 text-sm text-muted-foreground">Jogos demonstrativos. Nenhuma aposta aqui envolve dinheiro real.</p>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar jogos..."
          aria-label="Buscar jogos"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Erro ao carregar jogos: {error}
        </div>
      )}

      {!games && !error && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {games && filtered.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <Gamepad2 className="h-10 w-10" aria-hidden="true" />
          <p>Nenhum jogo encontrado. O catalogo demonstrativo pode estar vazio ainda.</p>
        </div>
      )}

      {games && filtered.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((game) => (
            <div key={game.id} className="group relative overflow-hidden rounded-xl border border-border bg-card transition-transform duration-200 hover:-translate-y-1">
              <button onClick={() => openGame(game)} className="block w-full text-left">
                <div className="flex aspect-[3/4] items-center justify-center bg-muted">
                  {game.image_path ? (
                    <img src={game.image_path} alt={game.name} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  ) : (
                    <Gamepad2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-sm font-semibold text-card-foreground">{game.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{game.game_categories?.name ?? "Demo"}</p>
                </div>
              </button>
              <button
                onClick={() => toggleFavorite(game.id)}
                aria-label="Favoritar"
                className="absolute right-2 top-2 rounded-full bg-background/70 p-1.5 backdrop-blur transition-colors duration-200 hover:bg-background"
              >
                <Heart className={favorites.has(game.id) ? "h-4 w-4 fill-secondary text-secondary" : "h-4 w-4 text-foreground"} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
