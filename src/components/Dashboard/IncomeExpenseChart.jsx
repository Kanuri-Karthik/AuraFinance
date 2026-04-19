import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinance } from '../../context/FinanceContext';

const CustomTooltip = ({ active, payload, label }) => {
  const { formatCurrency } = useFinance();
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-borderLight p-3 rounded-xl shadow-xl">
        <p className="text-textMain font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-textMuted text-sm capitalize">{entry.name}:</span>
            <span className="text-textMain font-bold text-sm ml-auto">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const IncomeExpenseChart = ({ transactions = [], timeRange = '30' }) => {
  const { currencySymbol } = useFinance();

  const chartData = useMemo(() => {
     let dataMap = {};
     
     transactions.forEach(t => {
         const d = new Date(t.date);
         let key;
         if (timeRange === '7' || timeRange === '30') {
             key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         } else {
             key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
         }
         
         if (!dataMap[key]) dataMap[key] = { day: key, income: 0, expenses: 0, timestamp: d.getTime() };
         if (t.type === 'income') dataMap[key].income += Math.abs(t.amount);
         if (t.type === 'expense') dataMap[key].expenses += Math.abs(t.amount);
     });
     
     let arr = Object.values(dataMap);
     if (arr.length === 0) {
        return [{ day: 'No Data', income: 0, expenses: 0 }];
     }
     
     arr.sort((a,b) => a.timestamp - b.timestamp);
     return arr;
  }, [transactions, timeRange]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgb(var(--color-text-muted))', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgb(var(--color-text-muted))', fontSize: 12 }}
            tickFormatter={(value) => `${currencySymbol}${value / 1000}k`}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border)', opacity: 0.4 }} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: 'rgb(var(--color-text-muted))' }}
            iconType="circle"
          />
          <Bar 
            dataKey="income" 
            name="Income"
            fill="rgb(var(--color-accent))" 
            radius={[4, 4, 0, 0]} 
            animationDuration={1500}
          />
          <Bar 
            dataKey="expenses" 
            name="Expenses"
            fill="rgb(var(--color-danger))" 
            radius={[4, 4, 0, 0]} 
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
