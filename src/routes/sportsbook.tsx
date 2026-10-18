import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatOdds } from "@/lib/utils";

export const Route = createFileRoute("/sportsbook")({
  head: () => ({
    meta: [
      { title: "Sportsbook Demonstrativo — METEFICHA.BET" },
      { name: "description", content: "Eventos esportivos, mercados e odds demonstrativos. Dados ficticios para testes." },
    ],
  }),
  component: SportsbookPage,
});

interface EventRow {
  id: string;
  starts_at: string;
  status: string;
  home: { name: string } | null;
  away: { name: string } | null;
  competitions: { name: string; sports: { name: string } | null } | null;
  markets: { id: string; name: string; status: string; selections: { id: string; name: string; odds: number; status: string }[] }[];
}

function SportsbookPage() {
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select(
        "id,starts_at,status,home:participants!events_home_participant_id_fkey(name),away:participants!events_away_participant_id_fkey(name),competitions(name,sports(name)),markets(id,name,status,selections(id,name,odds,status))"
      )
      .in("status", ["scheduled", "live"])
      .order("starts_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEvents(data as unknown as EventRow[]);
      });
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-foreground">Sportsbook Demonstrativo</h1>
      <p className="mt-1 text-sm text-muted-foreground">Eventos, mercados e odds ficticios. Nenhuma aposta aqui e real.</p>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Erro ao carregar eventos: {error}
        </div>
      )}

      {!events && !error && (
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {events && events.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
          <Trophy className="h-10 w-10" aria-hidden="true" />
          <p>Nenhum evento demonstrativo cadastrado ainda. O administrador pode criar eventos no painel.</p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {events.map((ev) => {
            const mainMarket = ev.markets.find((m) => m.name.toLowerCase().includes("resultado")) ?? ev.markets[0];
            return (
              <Link
                key={ev.id}
                to="/sportsbook/evento/$eventId"
                params={{ eventId: ev.id }}
                className="rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:bg-muted"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{ev.competitions?.sports?.name} • {ev.competitions?.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {new Date(ev.starts_at).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-card-foreground">
                  {ev.home?.name} <span className="text-muted-foreground">vs</span> {ev.away?.name}
                </p>
                {mainMarket && (
                  <div className="mt-3 flex gap-2">
                    {mainMarket.selections.map((sel) => (
                      <span
                        key={sel.id}
                        className={`flex-1 rounded-lg border px-2 py-2 text-center text-xs font-semibold ${sel.status === "open" ? "border-border bg-muted text-foreground" : "border-border bg-muted/40 text-muted-foreground line-through"}`}
                      >
                        {sel.name}<br />{formatOdds(sel.odds)}
                      </span>
                    ))}
                  </div>
                )}
                {ev.status === "live" && (
                  <span className="mt-2 inline-block rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">AO VIVO (DEMO)</span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
        Eventos, odds e resultados sao gerados para fins de demonstracao e nao refletem partidas reais em andamento.
      </div>
    </div>
  );
}
