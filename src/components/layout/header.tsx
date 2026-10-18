import { Link } from "@tanstack/react-router";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, isAdmin, signOut, loading } = useAuth();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur sm:px-6">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-lg font-black tracking-tight text-gradient-neon sm:text-xl">METEFICHA</span>
        <span className="text-lg font-black tracking-tight text-foreground sm:text-xl">.BET</span>
      </Link>

      <div className="hidden flex-1 items-center justify-center px-6 md:flex">
        <input
          type="search"
          placeholder="Buscar jogos, esportes, eventos..."
          aria-label="Buscar"
          className="w-full max-w-md rounded-full border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-2">
        {loading ? (
          <div className="h-9 w-20 animate-pulse rounded-full bg-muted" />
        ) : user ? (
          <>
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden rounded-full border border-secondary/40 px-3 py-1.5 text-xs font-semibold text-secondary sm:inline-block"
              >
                Painel
              </Link>
            )}
            <Link
              to="/perfil"
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors duration-200"
            >
              <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Perfil</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-200"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground gradient-neon transition-transform duration-200 hover:scale-105"
            )}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
