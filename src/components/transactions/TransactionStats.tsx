import { CheckCircle2, DollarSign, Users, Clock } from "lucide-react";

interface TransactionStatsProps {
  stats: {
    total: number;
    totalValue: number;
    clients: number;
    today: number;
  };
}

export function TransactionStats({ stats }: TransactionStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statItems = [
    {
      icon: CheckCircle2,
      label: "Total",
      value: stats.total.toString(),
      color: "text-primary",
    },
    {
      icon: DollarSign,
      label: "Valor Total",
      value: formatCurrency(stats.totalValue),
      color: "text-primary",
    },
    {
      icon: Users,
      label: "Clientes",
      value: stats.clients.toString(),
      color: "text-muted-foreground",
    },
    {
      icon: Clock,
      label: "Hoje",
      value: stats.today.toString(),
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-8 py-4 px-2 border-y border-border">
      {statItems.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-secondary ${item.color}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold text-foreground">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
