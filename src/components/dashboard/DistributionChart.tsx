import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "PIX", value: 10, color: "hsl(142, 71%, 45%)" },
  { name: "Boleto", value: 3, color: "hsl(217, 91%, 60%)" },
];

export function DistributionChart() {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="stat-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Distribuição</h3>
        <p className="text-sm text-muted-foreground">Por método de pagamento</p>
      </div>

      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">TOTAL</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{item.value}</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
