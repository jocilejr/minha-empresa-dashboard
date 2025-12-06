import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TransactionTabs } from "@/components/transactions/TransactionTabs";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionStats } from "@/components/transactions/TransactionStats";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { getTransactions, Transaction, TransactionCounts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export type TransactionStatus = "approved" | "boleto" | "pending" | "failed";
export type DateFilter = "today" | "yesterday" | "7days" | "30days" | "custom";

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<TransactionStatus>("approved");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [counts, setCounts] = useState<TransactionCounts>({ approved: "0", boleto: "0", pending: "0", failed: "0", total: "0" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Map tab to status filter
  const getStatusFilter = (tab: TransactionStatus): string | undefined => {
    switch (tab) {
      case "approved": return "pago";
      case "boleto": return "gerado";
      case "pending": return "pendente";
      case "failed": return undefined; // Will filter client-side for cancelado/expirado
    }
  };

  // Get date range based on filter
  const getDateRange = (filter: DateFilter): { date_from?: string; date_to?: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case "today":
        return { date_from: today.toISOString() };
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { date_from: yesterday.toISOString(), date_to: today.toISOString() };
      case "7days":
        const week = new Date(today);
        week.setDate(week.getDate() - 7);
        return { date_from: week.toISOString() };
      case "30days":
        const month = new Date(today);
        month.setDate(month.getDate() - 30);
        return { date_from: month.toISOString() };
      default:
        return {};
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const statusFilter = getStatusFilter(activeTab);
      const dateRange = getDateRange(dateFilter);
      
      const response = await getTransactions({
        status: activeTab === "failed" ? undefined : statusFilter,
        search: searchQuery || undefined,
        ...dateRange
      });

      let filteredTransactions = response.transactions;
      
      // For failed tab, filter client-side for cancelado/expirado
      if (activeTab === "failed") {
        filteredTransactions = filteredTransactions.filter(
          t => t.status === "cancelado" || t.status === "expirado"
        );
      }

      setTransactions(filteredTransactions);
      setCounts(response.counts);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, dateFilter, searchQuery]);

  // Calculate stats from current transactions
  const stats = {
    total: transactions.length,
    totalValue: transactions.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0),
    clients: new Set(transactions.map(t => t.customer_name).filter(Boolean)).size,
    today: transactions.filter(t => {
      const today = new Date();
      const transactionDate = new Date(t.created_at);
      return transactionDate.toDateString() === today.toDateString();
    }).length,
  };

  const tabCounts = {
    approved: parseInt(counts.approved) || 0,
    boleto: parseInt(counts.boleto) || 0,
    pending: parseInt(counts.pending) || 0,
    failed: parseInt(counts.failed) || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transações</h1>
          <p className="text-muted-foreground">Gerencie todas as transações</p>
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Transações Recentes</h2>
            <span className="text-sm text-muted-foreground">
              Mostrando {transactions.length} transações
            </span>
          </div>

          {/* Date Filters */}
          <TransactionFilters 
            activeFilter={dateFilter} 
            onFilterChange={setDateFilter} 
          />

          {/* Status Tabs */}
          <TransactionTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            counts={tabCounts}
          />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, email ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          {/* Stats */}
          <TransactionStats stats={stats} />

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <TransactionTable transactions={transactions} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
