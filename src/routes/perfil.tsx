import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Meu Perfil — METEFICHA.BET" }, { name: "description", content: "Gerencie seu perfil demonstrativo." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      setName(data?.display_name ?? "");
      setLoaded(true);
    });
  }, [user?.id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Nao foi possivel salvar: " + error.message);
    else toast.success("Perfil atualizado.");
  }

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <UserIcon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Entre na sua conta para ver o perfil.</p>
        <Link to="/auth" className="rounded-full gradient-neon px-5 py-2 text-sm font-semibold text-primary-foreground">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-foreground">Meu Perfil</h1>
      <form onSubmit={handleSave} className="mt-6 max-w-sm rounded-2xl border border-border bg-card p-6">
        <label htmlFor="email" className="text-xs font-medium text-muted-foreground">E-mail</label>
        <input id="email" disabled value={user?.email ?? ""} className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground" />

        <label htmlFor="name" className="mt-4 block text-xs font-medium text-muted-foreground">Nome de exibicao</label>
        {!loaded ? (
          <div className="mt-1 h-10 w-full animate-pulse rounded-lg bg-muted" />
        ) : (
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        )}

        <button type="submit" disabled={saving} className="mt-5 rounded-full gradient-neon px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-105 disabled:opacity-60">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
