import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: "default" | "pix" | "boleto" | "cartao" | "revenue" | "tax" | "net";
  className?: string;
}

const variantStyles = {
  default: "text-muted-foreground bg-secondary",
  pix: "text-chart-pix bg-chart-pix/10",
  boleto: "text-chart-boleto bg-chart-boleto/10",
  cartao: "text-accent bg-accent/10",
  revenue: "text-info bg-info/10",
  tax: "text-warning bg-warning/10",
  net: "text-primary bg-primary/10",
};

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default", className }: StatCardProps) {
  return (
    <div className={cn("stat-card group", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className={cn(
          "p-3 rounded-lg transition-transform group-hover:scale-110",
          variantStyles[variant]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
