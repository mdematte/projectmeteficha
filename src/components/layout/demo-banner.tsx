import { ShieldAlert } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-warning/15 border-b border-warning/30 px-4 py-2 text-center text-xs text-warning sm:text-sm">
      <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        <strong className="font-semibold">Ambiente demonstrativo:</strong> saldo, odds, eventos e resultados sao ficticios. Nenhuma operacao financeira real e realizada.
      </span>
    </div>
  );
}
