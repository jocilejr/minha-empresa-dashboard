import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const data = [
  { name: "Seg", boleto: 400, pix: 800, cartao: 200 },
  { name: "Ter", boleto: 300, pix: 600, cartao: 300 },
  { name: "Qua", boleto: 500, pix: 900, cartao: 250 },
  { name: "Qui", boleto: 280, pix: 700, cartao: 400 },
  { name: "Sex", boleto: 590, pix: 1100, cartao: 350 },
  { name: "Sáb", boleto: 350, pix: 500, cartao: 200 },
  { name: "Dom", boleto: 200, pix: 300, cartao: 150 },
];

const periods = ["3D", "7D", "15D", "1M", "6M"];

export function RevenueChart() {
  const [activePeriod, setActivePeriod] = useState("7D");

  return (
    <div className="stat-card col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">Faturamento</h3>
            <span className="flex items-center gap-1 text-xs text-primary">
              <TrendingUp className="w-3 h-3" />
              +2992.4%
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">R$ 5.459,07</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-chart-boleto" />
              <span className="text-xs text-muted-foreground">Boleto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-chart-pix" />
              <span className="text-xs text-muted-foreground">PIX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-chart-cartao" />
              <span className="text-xs text-muted-foreground">Cartão</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all",
                activePeriod === period
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPix" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBoleto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCartao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 60%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 60%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 18%)" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(210, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(210, 15%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(210, 18%, 10%)",
                border: "1px solid hsl(210, 18%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 20%, 98%)",
              }}
            />
            <Area type="monotone" dataKey="pix" stroke="hsl(142, 71%, 45%)" fillOpacity={1} fill="url(#colorPix)" strokeWidth={2} />
            <Area type="monotone" dataKey="boleto" stroke="hsl(217, 91%, 60%)" fillOpacity={1} fill="url(#colorBoleto)" strokeWidth={2} />
            <Area type="monotone" dataKey="cartao" stroke="hsl(38, 60%, 55%)" fillOpacity={1} fill="url(#colorCartao)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
