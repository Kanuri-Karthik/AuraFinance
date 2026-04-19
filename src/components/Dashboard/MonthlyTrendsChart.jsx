import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance } from '../../context/FinanceContext';

const CustomTooltip = ({ active, payload, label }) => {
  const { formatCurrency } = useFinance();
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-borderLight p-3 rounded-xl shadow-xl">
        <p className="text-textMuted text-xs mb-1">{label} Balance</p>
        <p className="text-textMain font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const MonthlyTrendsChart = ({ transactions = [], timeRange = '30' }) => {
  const { currencySymbol, accounts } = useFinance();

  const chartData = useMemo(() => {
    // Current total balance is our anchor point
    const currentBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Sort transactions reverse-chronologically (newest first)
    const sortedTxs = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date));

    let dataPoints = [];
    let runningBalance = currentBalance;
    
    // Create an initial data point for right now
    const now = new Date();
    dataPoints.push({
        month: timeRange === '7' || timeRange === '30' ? 'Today' : now.toLocaleDateString('en-US', { month: 'short' }),
        balance: runningBalance,
        timestamp: now.getTime()
    });

    // Walk backwards and compute balance before each transaction occurred
    sortedTxs.forEach(t => {
        if (t.isTransfer) return;
        const d = new Date(t.date);
        
        // Reverse the effect of the transaction to see what balance was before it
        if (t.type === 'income') {
            runningBalance -= Math.abs(t.amount);
        } else if (t.type === 'expense') {
            runningBalance += Math.abs(t.amount);
        }

        let key;
        if (timeRange === '7' || timeRange === '30') {
            key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
            key = d.toLocaleDateString('en-US', { month: 'short' });
        }

        dataPoints.push({
            month: key,
            balance: runningBalance,
            timestamp: d.getTime()
        });
    });

    if (dataPoints.length === 1) {
       // if no transactions, just draw a flat line by adding a past marker
       const past = new Date();
       past.setDate(past.getDate() - 30);
       dataPoints.push({
           month: 'Previous',
           balance: currentBalance,
           timestamp: past.getTime()
       });
    }

    // Since we walked backwards, reverse to draw left-to-right (past to present)
    dataPoints.reverse();

    // Deduplicate consecutive identical keys by keeping the latest balance of that key
    let uniqueData = [];
    let seenKeys = new Set();
    // iterate from right to left (newest to oldest) so we keep the final balance of the period
    for (let i = dataPoints.length - 1; i >= 0; i--) {
        if (!seenKeys.has(dataPoints[i].month)) {
            uniqueData.unshift(dataPoints[i]);
            seenKeys.add(dataPoints[i].month);
        }
    }

    return uniqueData;
  }, [accounts, transactions, timeRange]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(var(--color-primary))" />
              <stop offset="100%" stopColor="rgb(var(--color-secondary))" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis 
            dataKey="month" 
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 2, strokeDasharray: '5 5' }} />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="url(#colorBalance)" 
            strokeWidth={4}
            dot={{ r: 4, fill: 'rgb(var(--color-surface))', strokeWidth: 2, stroke: 'rgb(var(--color-primary))' }}
            activeDot={{ r: 6, fill: 'rgb(var(--color-primary))', strokeWidth: 0, filter: 'url(#glow)' }}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendsChart;
