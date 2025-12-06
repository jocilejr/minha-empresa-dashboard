import { cn } from "@/lib/utils";
import type { TransactionStatus } from "@/pages/Transactions";

interface TransactionTabsProps {
  activeTab: TransactionStatus;
  onTabChange: (tab: TransactionStatus) => void;
  counts: Record<TransactionStatus, number>;
}

const tabs: { id: TransactionStatus; label: string }[] = [
  { id: "approved", label: "Aprovados" },
  { id: "boleto", label: "Boletos Ger." },
  { id: "pending", label: "PIX/Cartão Pend." },
  { id: "failed", label: "Abandono/Falha" },
];

export function TransactionTabs({ activeTab, onTabChange, counts }: TransactionTabsProps) {
  return (
    <div className="flex bg-secondary rounded-lg p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id];
        const showBadge = count > 0 && !isActive && (tab.id === "pending" || tab.id === "failed");

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200",
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {showBadge && (
              <span className={cn(
                "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium rounded-full",
                tab.id === "pending" ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
