import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
}

const typeStyles = {
  pix: "bg-primary/20 text-primary border-primary/30",
  boleto: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cartao: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const statusStyles = {
  pago: "bg-emerald-500/20 text-emerald-400",
  pendente: "bg-yellow-500/20 text-yellow-400",
  gerado: "bg-blue-500/20 text-blue-400",
  cancelado: "bg-red-500/20 text-red-400",
  expirado: "bg-gray-500/20 text-gray-400",
};

const statusLabels = {
  pago: "Pago",
  pendente: "Pendente",
  gerado: "Gerado",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-border">
            <TableHead className="text-muted-foreground font-medium">TIPO</TableHead>
            <TableHead className="text-muted-foreground font-medium">CLIENTE</TableHead>
            <TableHead className="text-muted-foreground font-medium">CONTATO</TableHead>
            <TableHead className="text-muted-foreground font-medium">DATA</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">VALOR</TableHead>
            <TableHead className="text-muted-foreground font-medium text-center">STATUS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="border-border hover:bg-secondary/30">
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={cn("uppercase text-xs font-semibold", typeStyles[transaction.type])}
                >
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {transaction.customer_name || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {transaction.customer_phone || transaction.customer_email || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(transaction.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {formatCurrency(parseFloat(String(transaction.amount)))}
              </TableCell>
              <TableCell className="text-center">
                <Badge className={cn("text-xs", statusStyles[transaction.status])}>
                  {statusLabels[transaction.status]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
