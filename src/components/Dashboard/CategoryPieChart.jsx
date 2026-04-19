import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinance } from '../../context/FinanceContext';

const data = [
  { name: 'Housing', value: 1200, color: 'rgb(var(--color-primary))' },
  { name: 'Food', value: 800, color: 'rgb(var(--color-secondary))' },
  { name: 'Transport', value: 400, color: 'rgb(var(--color-accent))' },
  { name: 'Entertainment', value: 300, color: 'rgb(var(--color-danger))' },
  { name: 'Utilities', value: 500, color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload }) => {
  const { formatCurrency } = useFinance();
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-borderLight p-3 rounded-xl shadow-xl flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
        <div>
          <p className="text-textMuted text-xs">{payload[0].name}</p>
          <p className="text-textMain font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const CategoryPieChart = () => {
  return (
    <div className="w-full h-full min-h-[250px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
            animationBegin={200}
            label={renderCustomizedLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--color-surface)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
             layout="vertical" 
             verticalAlign="middle" 
             align="right"
             iconType="circle"
             wrapperStyle={{ fontSize: '12px', color: 'rgb(var(--color-text-muted))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
