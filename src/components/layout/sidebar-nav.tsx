import { Link, useLocation } from "@tanstack/react-router";
import { Gamepad2, LayoutDashboard, Trophy, Heart, Clock, Shield, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const items = [
  { to: "/", label: "Início", icon: LayoutDashboard },
  { to: "/casino", label: "Cassino", icon: Gamepad2 },
  { to: "/sportsbook", label: "Esportes", icon: Trophy },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/historico", label: "Histórico", icon: Clock },
  { to: "/carteira", label: "Carteira Demo", icon: Wallet },
];

export function SidebarNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  return (
    <aside className="hidden lg:flex lg:w-60 shrink-0 flex-col gap-1 border-r border-border bg-surface px-3 py-4">
      {items.map((item) => {
        const active = location.pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              active
                ? "bg-primary/15 text-accent glow-border"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          to="/admin"
          className="mt-4 flex items-center gap-3 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2.5 text-sm font-semibold text-secondary transition-colors duration-200 hover:bg-secondary/20"
        >
          <Shield className="h-4.5 w-4.5" aria-hidden="true" />
          Painel Admin
        </Link>
      )}
    </aside>
  );
}
