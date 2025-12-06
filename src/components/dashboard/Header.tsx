import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const periodFilters = ["Hoje", "Ontem", "7 dias", "30 dias", "Personalizado"];

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Dashboard", subtitle = "Visão geral do seu negócio" }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Status indicators */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Extensão</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-sm text-muted-foreground">2 novas</span>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-info flex items-center justify-center text-foreground font-semibold">
            {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.name || user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.roles?.[0] || 'Usuário'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PeriodFilter() {
  const [activePeriod, setActivePeriod] = useState("Hoje");

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground mr-2">Filtrando por período</span>
      <div className="flex flex-wrap gap-1 bg-secondary/50 p-1 rounded-lg">
        {periodFilters.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-all",
              activePeriod === period
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {period === "Personalizado" && <Calendar className="w-4 h-4 inline mr-1" />}
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}
