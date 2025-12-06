import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TransactionTabs } from "@/components/transactions/TransactionTabs";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionStats } from "@/components/transactions/TransactionStats";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export type TransactionStatus = "approved" | "boleto" | "pending" | "failed";
export type DateFilter = "today" | "yesterday" | "7days" | "30days" | "custom";

export interface Transaction {
  id: string;
  type: "pix" | "boleto" | "cartao";
  clientName: string;
  contact: string;
  date: Date;
  value: number;
  status: "pago" | "pendente" | "gerado" | "falha" | "abandono";
}

// Mock data for demonstration
const mockTransactions: Transaction[] = [
  { id: "1", type: "pix", clientName: "LEONILDA MARCHAUCOSKI", contact: "-", date: new Date(Date.now() - 52 * 60 * 1000), value: 10.00, status: "pago" },
  { id: "2", type: "pix", clientName: "DIVINA ASSUNCAO", contact: "-", date: new Date(Date.now() - 60 * 60 * 1000), value: 10.00, status: "pago" },
  { id: "3", type: "pix", clientName: "MARLI DEVEGILI SARDANHA", contact: "-", date: new Date(Date.now() - 65 * 60 * 1000), value: 10.00, status: "pago" },
  { id: "4", type: "pix", clientName: "APARECIDA DE FATIMA ROD...", contact: "-", date: new Date(Date.now() - 66 * 60 * 1000), value: 51.00, status: "pago" },
  { id: "5", type: "boleto", clientName: "MARLENE ZANATTA", contact: "-", date: new Date(Date.now() - 67 * 60 * 1000), value: 10.00, status: "gerado" },
  { id: "6", type: "pix", clientName: "EMILIA RUA ROLAN", contact: "-", date: new Date(Date.now() - 2 * 60 * 60 * 1000), value: 97.00, status: "pago" },
  { id: "7", type: "cartao", clientName: "LINDAURA PEREIRA OLIVEIRA", contact: "-", date: new Date(Date.now() - 3 * 60 * 60 * 1000), value: 10.00, status: "pendente" },
  { id: "8", type: "pix", clientName: "JOSE CARLOS SILVA", contact: "-", date: new Date(Date.now() - 4 * 60 * 60 * 1000), value: 25.00, status: "falha" },
];

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<TransactionStatus>("approved");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter transactions based on active tab
  const getFilteredTransactions = () => {
    let filtered = mockTransactions;

    // Filter by tab
    switch (activeTab) {
      case "approved":
        filtered = filtered.filter(t => t.status === "pago");
        break;
      case "boleto":
        filtered = filtered.filter(t => t.status === "gerado");
        break;
      case "pending":
        filtered = filtered.filter(t => t.status === "pendente");
        break;
      case "failed":
        filtered = filtered.filter(t => t.status === "falha" || t.status === "abandono");
        break;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.clientName.toLowerCase().includes(query) ||
        t.contact.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate stats
  const stats = {
    total: filteredTransactions.length,
    totalValue: filteredTransactions.reduce((sum, t) => sum + t.value, 0),
    clients: new Set(filteredTransactions.map(t => t.clientName)).size,
    today: filteredTransactions.filter(t => {
      const today = new Date();
      return t.date.toDateString() === today.toDateString();
    }).length,
  };

  // Count for badges
  const tabCounts = {
    approved: mockTransactions.filter(t => t.status === "pago").length,
    boleto: mockTransactions.filter(t => t.status === "gerado").length,
    pending: mockTransactions.filter(t => t.status === "pendente").length,
    failed: mockTransactions.filter(t => t.status === "falha" || t.status === "abandono").length,
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
              Mostrando {filteredTransactions.length} de {mockTransactions.length}
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
          <TransactionTable transactions={filteredTransactions} />
        </div>
      </div>
    </DashboardLayout>
  );
}
