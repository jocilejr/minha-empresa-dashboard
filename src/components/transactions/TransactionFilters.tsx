import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DateFilter } from "@/pages/Transactions";

interface TransactionFiltersProps {
  activeFilter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
}

const filters: { id: DateFilter; label: string; icon?: boolean }[] = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "7days", label: "7 dias" },
  { id: "30days", label: "30 dias" },
  { id: "custom", label: "Personalizado", icon: true },
];

export function TransactionFilters({ activeFilter, onFilterChange }: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "transition-all",
            activeFilter === filter.id 
              ? "bg-primary text-primary-foreground" 
              : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {filter.icon && <Calendar className="h-4 w-4 mr-1.5" />}
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
