import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "@/pages/Transactions";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
}

const typeStyles = {
  pix: "bg-primary/20 text-primary border-primary/30",
  boleto: "bg-info/20 text-info border-info/30",
  cartao: "bg-accent/20 text-accent border-accent/30",
};

const statusStyles = {
  pago: "bg-primary/20 text-primary",
  pendente: "bg-warning/20 text-warning",
  gerado: "bg-info/20 text-info",
  falha: "bg-destructive/20 text-destructive",
  abandono: "bg-destructive/20 text-destructive",
};

const statusLabels = {
  pago: "Pago",
  pendente: "Pendente",
  gerado: "Gerado",
  falha: "Falha",
  abandono: "Abandono",
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `${diffMins}min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground font-medium">TIPO</TableHead>
          <TableHead className="text-muted-foreground font-medium">CLIENTE</TableHead>
          <TableHead className="text-muted-foreground font-medium">CONTATO</TableHead>
          <TableHead className="text-muted-foreground font-medium">DATA</TableHead>
          <TableHead className="text-muted-foreground font-medium text-right">VALOR</TableHead>
          <TableHead className="text-muted-foreground font-medium text-center">STATUS</TableHead>
          <TableHead className="text-muted-foreground font-medium text-center">AÇÕES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id} className="border-border">
            <TableCell>
              <Badge 
                variant="outline" 
                className={cn("uppercase text-xs font-semibold", typeStyles[transaction.type])}
              >
                {transaction.type}
              </Badge>
            </TableCell>
            <TableCell className="font-medium text-foreground">
              {transaction.clientName}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {transaction.contact}
            </TableCell>
            <TableCell>
              <div className="space-y-0.5">
                <p className="text-foreground text-sm">{formatRelativeTime(transaction.date)}</p>
                <p className="text-muted-foreground text-xs">{formatTime(transaction.date)}</p>
              </div>
            </TableCell>
            <TableCell className="text-right font-semibold text-foreground">
              {formatCurrency(transaction.value)}
            </TableCell>
            <TableCell className="text-center">
              <Badge className={cn("text-xs", statusStyles[transaction.status])}>
                {statusLabels[transaction.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
