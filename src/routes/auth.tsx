import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — METEFICHA.BET" },
      { name: "description", content: "Entre ou cadastre-se no ambiente demonstrativo do METEFICHA.BET." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Conta demonstrativa criada! Verifique seu e-mail se a confirmacao estiver ativa.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message ?? "Nao foi possivel concluir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 glow-border sm:p-8">
        <h1 className="text-xl font-black text-foreground">
          {mode === "login" ? "Entrar" : "Criar conta"} <span className="text-gradient-neon">METEFICHA.BET</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Acesso ao ambiente demonstrativo. Saldo e dados ficticios.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="text-xs font-medium text-muted-foreground">Nome</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">E-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">Senha</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <button type="submit" disabled={loading} className="mt-2 rounded-full gradient-neon px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100">
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 w-full text-center text-xs font-medium text-accent hover:underline">
          {mode === "login" ? "Nao tem conta? Cadastre-se" : "Ja tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
