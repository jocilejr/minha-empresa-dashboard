import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Header, PeriodFilter } from "@/components/dashboard/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DistributionChart } from "@/components/dashboard/DistributionChart";
import { QrCode, FileText, CreditCard, DollarSign, Percent, Wallet } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <Header />
      <PeriodFilter />

      {/* Stats Grid - First Row (Generated) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard
          title="PIX Gerado"
          value="5"
          subtitle="No período"
          icon={QrCode}
          variant="pix"
        />
        <StatCard
          title="Boleto Gerado"
          value="3"
          subtitle="No período"
          icon={FileText}
          variant="boleto"
        />
        <StatCard
          title="Cartão Gerado"
          value="0"
          subtitle="No período"
          icon={CreditCard}
          variant="cartao"
        />
      </div>

      {/* Stats Grid - Second Row (Paid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard
          title="PIX Pago"
          value="5"
          subtitle="No período"
          icon={QrCode}
          variant="pix"
        />
        <StatCard
          title="Boleto Pago"
          value="0"
          subtitle="0.0% taxa de conversão"
          icon={FileText}
          variant="boleto"
        />
        <StatCard
          title="Cartão Pago"
          value="0"
          subtitle="No período"
          icon={CreditCard}
          variant="cartao"
        />
      </div>

      {/* Financial Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Faturamento"
          value="R$ 178,00"
          subtitle="Pedidos pagos"
          icon={DollarSign}
          variant="revenue"
        />
        <StatCard
          title="Imposto (3.99%)"
          value="-R$ 7,10"
          subtitle="Dedução fiscal"
          icon={Percent}
          variant="tax"
        />
        <StatCard
          title="Líquido"
          value="R$ 170,90"
          subtitle="Após impostos"
          icon={Wallet}
          variant="net"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart />
        <DistributionChart />
      </div>
    </DashboardLayout>
  );
};

export default Index;
