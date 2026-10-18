import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [{ title: "Favoritos — METEFICHA.BET" }, { name: "description", content: "Seus jogos favoritos no ambiente demonstrativo." }],
  }),
  component: FavoritesPage,
});

interface FavRow { game_id: string; games: { name: string; image_path: string | null; slug: string } | null }

function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [favs, setFavs] = useState<FavRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_favorites").select("game_id,games(name,image_path,slug)").eq("user_id", user.id).then(({ data }) => setFavs(data as unknown as FavRow[]));
  }, [user?.id]);

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <Heart className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Entre para ver seus favoritos.</p>
        <Link to="/auth" className="rounded-full gradient-neon px-5 py-2 text-sm font-semibold text-primary-foreground">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-foreground">Favoritos</h1>
      {!favs && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />)}
        </div>
      )}
      {favs && favs.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Voce ainda nao favoritou nenhum jogo.</p>}
      {favs && favs.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {favs.map((f) => (
            <div key={f.game_id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex aspect-[3/4] items-center justify-center bg-muted">
                {f.games?.image_path && <img src={f.games.image_path} alt={f.games?.name ?? ""} className="h-full w-full object-cover" />}
              </div>
              <p className="p-2.5 truncate text-sm font-semibold text-card-foreground">{f.games?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
