import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Users, Gamepad2, Trophy, PauseCircle, PlayCircle, ScrollText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo — METEFICHA.BET" },
      { name: "description", content: "Gestao do ambiente demonstrativo: usuarios, catalogo, eventos, simulador e auditoria." },
    ],
  }),
  component: AdminPage,
});

interface AuditRow { id: string; action: string; entity_type: string; created_at: string }

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [paused, setPaused] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);
  const [logs, setLogs] = useState<AuditRow[] | null>(null);
  const [counts, setCounts] = useState<{ users: number; games: number; events: number } | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("automation_state").select("is_paused").maybeSingle().then(({ data }) => setPaused(data?.is_paused ?? false));
    supabase.from("audit_logs").select("id,action,entity_type,created_at").order("created_at", { ascending: false }).limit(10).then(({ data }) => setLogs(data ?? []));
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("games").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
    ]).then(([u, g, e]) => {
      setCounts({ users: u.count ?? 0, games: g.count ?? 0, events: e.count ?? 0 });
    });
  }, [isAdmin]);

  async function toggleAutomation() {
    if (paused === null) return;
    setToggling(true);
    const { error } = await supabase.rpc("toggle_automation_pause", { _paused: !paused });
    setToggling(false);
    if (error) {
      toast.error("Nao foi possivel alterar a automacao: " + error.message);
      return;
    }
    setPaused(!paused);
    toast.success(!paused ? "Automacao pausada globalmente." : "Automacao retomada.");
  }

  if (loading) {
    return <div className="px-4 py-10"><div className="h-40 animate-pulse rounded-xl bg-muted" /></div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <Shield className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Acesso restrito a administradores do ambiente demonstrativo.</p>
        <Link to="/" className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted">Voltar ao inicio</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-secondary" aria-hidden="true" />
        <h1 className="text-2xl font-black text-foreground">Painel Administrativo</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Gestao do ambiente demonstrativo. Nenhuma acao aqui movimenta dinheiro real.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-4 w-4" aria-hidden="true" />Usuarios</div>
          <p className="mt-1 text-2xl font-black text-foreground">{counts ? counts.users : "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gamepad2 className="h-4 w-4" aria-hidden="true" />Jogos no catalogo</div>
          <p className="mt-1 text-2xl font-black text-foreground">{counts ? counts.games : "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trophy className="h-4 w-4" aria-hidden="true" />Eventos demonstrativos</div>
          <p className="mt-1 text-2xl font-black text-foreground">{counts ? counts.events : "—"}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-warning">Indicadores demonstrativos — nao refletem operacao real.</p>

      <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-card-foreground">Pausa global do simulador</p>
          <p className="text-xs text-muted-foreground">Interrompe novas execucoes automaticas de cenarios. Edicao manual continua disponivel.</p>
          <p className="mt-1 text-xs font-semibold" style={{ color: paused ? "hsl(var(--destructive))" : "hsl(var(--success))" }}>
            Estado atual: {paused === null ? "carregando..." : paused ? "PAUSADO" : "EM EXECUCAO"}
          </p>
        </div>
        <button
          onClick={toggleAutomation}
          disabled={paused === null || toggling}
          className="flex items-center gap-2 rounded-full gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-105 disabled:opacity-60"
        >
          {paused ? <PlayCircle className="h-4 w-4" aria-hidden="true" /> : <PauseCircle className="h-4 w-4" aria-hidden="true" />}
          {toggling ? "Aplicando..." : paused ? "Retomar automacao" : "Pausar automacao"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Usuarios e papeis", icon: Users, desc: "Visualizar usuarios e atribuir papel admin/user." },
          { label: "Jogos e provedores", icon: Gamepad2, desc: "CRUD de catalogo de cassino demonstrativo." },
          { label: "Esportes e eventos", icon: Trophy, desc: "Eventos, mercados, selecoes e odds demonstrativas." },
          { label: "Banners", icon: ImageIcon, desc: "Banners do lobby e home." },
          { label: "Logs de auditoria", icon: ScrollText, desc: "Historico de acoes administrativas sensiveis." },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-accent" aria-hidden="true" /><p className="text-sm font-semibold text-card-foreground">{card.label}</p></div>
              <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">Gerenciamento via tabelas do banco com RLS restrita a admin (has_role).</p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 text-lg font-bold text-foreground">Auditoria recente</h2>
      {!logs && <div className="mt-3 h-24 animate-pulse rounded-xl bg-muted" />}
      {logs && logs.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Nenhum registro de auditoria ainda.</p>}
      {logs && logs.length > 0 && (
        <div className="mt-3 flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-card-foreground">{log.action} • {log.entity_type}</span>
              <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
