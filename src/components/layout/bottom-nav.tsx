import { Link, useLocation } from "@tanstack/react-router";
import { Gamepad2, LayoutDashboard, Trophy, Clock, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Início", icon: LayoutDashboard },
  { to: "/casino", label: "Cassino", icon: Gamepad2 },
  { to: "/sportsbook", label: "Esportes", icon: Trophy },
  { to: "/historico", label: "Histórico", icon: Clock },
  { to: "/carteira", label: "Carteira", icon: Wallet },
];

export function BottomNav() {
  const location = useLocation();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-surface/95 px-1 py-1.5 backdrop-blur lg:hidden"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      {items.map((item) => {
        const active = location.pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[11px] font-medium transition-colors duration-200",
              active ? "text-accent" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
