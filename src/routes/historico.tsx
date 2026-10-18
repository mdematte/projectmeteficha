import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatVirtualAmount, formatOdds } from "@/lib/utils";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [{ title: "Historico de Bilhetes — METEFICHA.BET" }, { name: "description", content: "Historico de bilhetes demonstrativos do sportsbook." }],
  }),
  component: HistoryPage,
});

interface TicketRow {
  id: string;
  stake_cents: number;
  potential_payout_cents: number;
  total_odds: number;
  status: string;
  created_at: string;
  demo_ticket_selections: { event_name: string; selection_name: string; odds_accepted: number }[];
}

const statusLabel: Record<string, string> = { pending: "Em aberto", won: "Ganho (demo)", lost: "Perdido (demo)", void: "Anulado", cancelled: "Cancelado" };

function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("demo_tickets")
      .select("id,stake_cents,potential_payout_cents,total_odds,status,created_at,demo_ticket_selections(event_name,selection_name,odds_accepted)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setTickets(data as unknown as TicketRow[]));
  }, [user?.id]);

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <Clock className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Entre para ver seu historico de bilhetes.</p>
        <Link to="/auth" className="rounded-full gradient-neon px-5 py-2 text-sm font-semibold text-primary-foreground">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-foreground">Historico de Bilhetes (Demo)</h1>
      {!tickets && <div className="mt-6 flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>}
      {tickets && tickets.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Nenhum bilhete demonstrativo registrado ainda.</p>}
      {tickets && tickets.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(t.created_at).toLocaleString("pt-BR")}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">{statusLabel[t.status] ?? t.status}</span>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {t.demo_ticket_selections.map((sel, i) => (
                  <p key={i} className="text-sm text-card-foreground">{sel.event_name} — <span className="font-medium">{sel.selection_name}</span> @ {formatOdds(sel.odds_accepted)}</p>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Stake: {formatVirtualAmount(t.stake_cents)} FC • Odd total {formatOdds(t.total_odds)}</span>
                <span className="font-semibold text-accent">Retorno pot.: {formatVirtualAmount(t.potential_payout_cents)} FC</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
