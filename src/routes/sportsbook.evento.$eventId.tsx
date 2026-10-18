import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Ticket as TicketIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatOdds, formatVirtualAmount } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/sportsbook/evento/$eventId")({
  head: () => ({
    meta: [
      { title: "Detalhes do Evento — METEFICHA.BET" },
      { name: "description", content: "Mercados e selecoes demonstrativas do evento esportivo ficticio." },
    ],
  }),
  component: EventPage,
});

interface Selection { id: string; name: string; odds: number; status: string; version: number }
interface Market { id: string; name: string; status: string; selections: Selection[] }
interface EventDetail {
  id: string;
  starts_at: string;
  status: string;
  home: { name: string } | null;
  away: { name: string } | null;
  competitions: { name: string; sports: { name: string } | null } | null;
  markets: Market[];
}

function EventPage() {
  const { eventId } = Route.useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ marketId: string; marketName: string; selection: Selection } | null>(null);
  const [stake, setStake] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [oddsChanged, setOddsChanged] = useState<number | null>(null);

  function load() {
    supabase
      .from("events")
      .select(
        "id,starts_at,status,home:participants!events_home_participant_id_fkey(name),away:participants!events_away_participant_id_fkey(name),competitions(name,sports(name)),markets(id,name,status,selections(id,name,odds,status,version))"
      )
      .eq("id", eventId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEvent(data as unknown as EventDetail);
      });
  }

  useEffect(() => { load(); }, [eventId]);

  function pick(marketId: string, marketName: string, selection: Selection) {
    if (selection.status !== "open") {
      toast.warning("Esta selecao nao esta mais disponivel (suspensa ou encerrada).");
      return;
    }
    setOddsChanged(null);
    setPicked({ marketId, marketName, selection });
  }

  async function confirm() {
    if (!user) {
      toast.error("Entre na sua conta para registrar um bilhete demonstrativo.");
      return;
    }
    if (!picked || !event) return;
    const stakeCents = Math.round(parseFloat(stake.replace(",", ".")) * 100);
    if (!stakeCents || stakeCents <= 0) {
      toast.error("Informe um valor de ficha valido.");
      return;
    }
    setSubmitting(true);
    const idemKey = crypto.randomUUID();
    const { data, error } = await supabase.rpc("place_demo_ticket", {
      _selections: [
        {
          event_id: event.id,
          market_id: picked.marketId,
          selection_id: picked.selection.id,
          expected_version: picked.selection.version,
          event_name: `${event.home?.name} vs ${event.away?.name}`,
          market_name: picked.marketName,
          selection_name: picked.selection.name,
        },
      ],
      _stake_cents: stakeCents,
      _idempotency_key: idemKey,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Nao foi possivel confirmar o bilhete: " + error.message);
      return;
    }
    const result = data as any;
    if (result?.status === "odds_changed") {
      setOddsChanged(result.new_odds ?? null);
      toast.warning("A cotacao mudou desde a sua selecao. Revise e confirme novamente.");
      load();
      return;
    }
    if (result?.status === "rejected") {
      toast.error(result?.reason ?? "Mercado suspenso ou encerrado. Operacao rejeitada pelo servidor.");
      load();
      return;
    }
    toast.success("Bilhete demonstrativo confirmado pelo servidor!");
    setPicked(null);
    load();
  }

  if (error) {
    return (
      <div className="px-4 py-10 text-center text-sm text-destructive">
        <AlertTriangle className="mx-auto h-8 w-8" aria-hidden="true" />
        <p className="mt-2">Erro ao carregar evento: {error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-4 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <Link to="/sportsbook" className="text-xs font-medium text-accent hover:underline">&larr; Voltar aos eventos</Link>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{event.competitions?.sports?.name} • {event.competitions?.name}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{new Date(event.starts_at).toLocaleString("pt-BR")}</span>
      </div>
      <h1 className="mt-1 text-2xl font-black text-foreground">{event.home?.name} <span className="text-muted-foreground">vs</span> {event.away?.name}</h1>
      {event.status !== "scheduled" && event.status !== "live" && (
        <p className="mt-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">Evento {event.status === "finished" ? "encerrado" : event.status} — novas selecoes podem estar bloqueadas.</p>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {event.markets.map((market) => (
          <div key={market.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-card-foreground">{market.name}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${market.status === "open" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                {market.status === "open" ? "Aberto" : market.status === "suspended" ? "Suspenso" : "Encerrado"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {market.selections.map((sel) => {
                const active = picked?.selection.id === sel.id;
                return (
                  <button
                    key={sel.id}
                    onClick={() => pick(market.id, market.name, sel)}
                    disabled={sel.status !== "open"}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors duration-200 ${
                      active ? "border-accent bg-accent/15 text-accent" : "border-border bg-muted text-foreground hover:bg-muted/70"
                    } ${sel.status !== "open" ? "opacity-40 line-through" : ""}`}
                  >
                    {sel.name}<br />{formatOdds(sel.odds)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
        Odds, mercados e resultados sao demonstrativos. O servidor revalida a cotacao e o estado do mercado no momento da confirmacao.
      </p>

      {picked && (
        <div className="fixed inset-x-0 bottom-16 z-30 mx-auto w-full max-w-md px-4 lg:bottom-4">
          <div className="rounded-2xl glow-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <TicketIcon className="h-4 w-4 text-accent" aria-hidden="true" />
              Boletim demonstrativo
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{picked.marketName}: <span className="font-medium text-foreground">{picked.selection.name}</span> @ {formatOdds(oddsChanged ?? picked.selection.odds)}</p>
            {oddsChanged !== null && (
              <p className="mt-1 text-xs font-semibold text-warning">A cotacao mudou para {formatOdds(oddsChanged)}. Confirme novamente se aceitar.</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <input
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                inputMode="decimal"
                aria-label="Valor da ficha virtual"
                className="w-24 rounded-lg border border-border bg-input px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">FC virtuais</span>
              <button
                onClick={confirm}
                disabled={submitting}
                className="ml-auto rounded-full gradient-neon px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform duration-200 hover:scale-105 disabled:opacity-60"
              >
                {submitting ? "Confirmando..." : "Confirmar bilhete"}
              </button>
              <button onClick={() => setPicked(null)} className="text-xs text-muted-foreground hover:underline">Cancelar</button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Retorno potencial: {formatVirtualAmount(Math.round((parseFloat(stake.replace(",", ".")) || 0) * 100 * (oddsChanged ?? picked.selection.odds)))} FC (demo)</p>
          </div>
        </div>
      )}
    </div>
  );
}
