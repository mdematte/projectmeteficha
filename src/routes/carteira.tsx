import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatVirtualAmount } from "@/lib/utils";

export const Route = createFileRoute("/carteira")({
  head: () => ({
    meta: [
      { title: "Carteira Demonstrativa — METEFICHA.BET" },
      { name: "description", content: "Saldo e historico de transacoes virtuais. Nenhum valor real." },
    ],
  }),
  component: WalletPage,
});

interface TxRow { id: string; amount_cents: number; type: string; reference_type: string | null; created_at: string }

function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [txs, setTxs] = useState<TxRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("demo_wallets").select("balance_cents").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      setBalance(data?.balance_cents ?? 0);
    });
    supabase
      .from("demo_wallet_transactions")
      .select("id,amount_cents,type,reference_type,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setTxs(data ?? []));
  }, [user?.id]);

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <Wallet className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Entre na sua conta para ver a carteira demonstrativa.</p>
        <Link to="/auth" className="rounded-full gradient-neon px-5 py-2 text-sm font-semibold text-primary-foreground">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-foreground">Carteira Demonstrativa</h1>
      <p className="mt-1 text-sm text-muted-foreground">Unidades virtuais, sem valor financeiro real.</p>

      <div className="mt-5 rounded-2xl glow-border bg-card p-6">
        <p className="text-xs font-medium text-muted-foreground">Saldo virtual</p>
        {balance === null ? (
          <div className="mt-2 h-9 w-40 animate-pulse rounded bg-muted" />
        ) : (
          <p className="mt-1 text-3xl font-black text-gradient-neon">{formatVirtualAmount(balance)} FC</p>
        )}
        <p className="mt-2 text-[11px] text-warning">FC = Ficha demonstrativa. Nao pode ser convertida em dinheiro real.</p>
      </div>

      <h2 className="mt-8 text-lg font-bold text-foreground">Historico de transacoes</h2>
      {!txs && (
        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}
        </div>
      )}
      {txs && txs.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Nenhuma transacao ainda.</p>}
      {txs && txs.length > 0 && (
        <div className="mt-3 flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {txs.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                {tx.type === "credit" ? (
                  <ArrowUpRight className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-destructive" aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm font-medium text-card-foreground">{tx.reference_type ?? tx.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString("pt-BR")}</p>
                </div>
              </div>
              <span className={tx.type === "credit" ? "text-sm font-semibold text-success" : "text-sm font-semibold text-destructive"}>
                {tx.type === "credit" ? "+" : "-"}{formatVirtualAmount(Math.abs(tx.amount_cents))} FC
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
