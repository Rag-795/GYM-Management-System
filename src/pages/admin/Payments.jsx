import React, { useEffect, useMemo, useState } from 'react';
import {
  IndianRupee, Download, Filter, Calendar, ArrowUp, ArrowDown,
  Wallet, CreditCard, Banknote, Smartphone, PieChart, BarChart3
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';

import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

const modeColors = {
  UPI: '#22c55e',         // green
  Cash: '#f59e0b',        // amber
  Card: '#3b82f6',        // blue
  NetBanking: '#a855f7',  // purple
};

const modeIcon = {
  UPI: Smartphone,
  Cash: Banknote,
  Card: CreditCard,
  NetBanking: Wallet,
};

// Utility
const toISODate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
const addDays = (d, n) => toISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

function generateSamplePayments() {
  // Creates sample payments spanning current and last month
  const modes = ['UPI', 'Cash', 'Card', 'NetBanking'];
  const descriptions = [
    'Monthly Membership', 'Personal Training Session', 'Protein Supplement',
    'Day Pass', 'Yoga Class', 'HIIT Class', 'Locker Fee', 'Annual Membership'
  ];
  const today = new Date();
  const entries = [];
  let id = 1;

  // ~50 entries in last 60 days
  for (let i = 0; i < 50; i++) {
    const offset = Math.floor(Math.random() * 60); // within last 60 days
    const d = new Date();
    d.setDate(today.getDate() - offset);

    const amount = Math.floor(500 + Math.random() * 5000); // 500 - 5500
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const desc = descriptions[Math.floor(Math.random() * descriptions.length)];

    entries.push({
      payment_id: id++,
      description: desc,
      payment_date: toISODate(d),
      amount,
      payment_mode: mode
    });
  }

  // Ensure some higher revenue spikes near month starts/ends
  const ensureDates = [
    startOfMonth(today), endOfMonth(today),
    startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
    endOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1))
  ];
  ensureDates.forEach((d, idx) => {
    entries.push({
      payment_id: id++,
      description: idx % 2 ? 'Annual Membership' : 'Premium Membership',
      payment_date: toISODate(d),
      amount: 7999 + idx * 500,
      payment_mode: ['Card', 'UPI', 'NetBanking', 'Cash'][idx % 4]
    });
  });

  return entries;
}

const Payments = () => {
  const [payments, setPayments] = useState(() => generateSamplePayments());
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('last30'); // last7, last30, thisMonth, lastMonth, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // NOTE: When backend is ready (Flask + Postgres), replace with:
  // useEffect(() => {
  //   api.get('/payments', { params: { startDate, endDate } })
  //     .then(res => setPayments(res.data))
  //     .catch(() => {});
  // }, [startDate, endDate]);

  const today = new Date();
  const computedRanges = useMemo(() => {
    const sThis = toISODate(startOfMonth(today));
    const eThis = toISODate(endOfMonth(today));
    const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const sLast = toISODate(startOfMonth(lastMonthDate));
    const eLast = toISODate(endOfMonth(lastMonthDate));
    const s7 = addDays(today, -6);
    const s30 = addDays(today, -29);
    const eNow = toISODate(today);
    return { sThis, eThis, sLast, eLast, s7, s30, eNow };
  }, [today]);

  const effectiveRange = useMemo(() => {
    switch (range) {
      case 'last7': return { start: computedRanges.s7, end: computedRanges.eNow };
      case 'last30': return { start: computedRanges.s30, end: computedRanges.eNow };
      case 'thisMonth': return { start: computedRanges.sThis, end: computedRanges.eThis };
      case 'lastMonth': return { start: computedRanges.sLast, end: computedRanges.eLast };
      case 'custom':
        return startDate && endDate ? { start: startDate, end: endDate } : { start: computedRanges.s30, end: computedRanges.eNow };
      default:
        return { start: computedRanges.s30, end: computedRanges.eNow };
    }
  }, [range, startDate, endDate, computedRanges]);

  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => {
        return p.payment_date >= effectiveRange.start && p.payment_date <= effectiveRange.end;
      })
      .filter(p => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          p.description.toLowerCase().includes(q) ||
          p.payment_mode.toLowerCase().includes(q) ||
          String(p.payment_id).includes(q)
        );
      })
      .sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1));
  }, [payments, effectiveRange, search]);

  // Stats: This month, Last month, MoM
  const lastMonthRevenue = useMemo(() => {
    return payments
      .filter(p => p.payment_date >= computedRanges.sLast && p.payment_date <= computedRanges.eLast)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, computedRanges]);

  const thisMonthRevenue = useMemo(() => {
    return payments
      .filter(p => p.payment_date >= computedRanges.sThis && p.payment_date <= computedRanges.eThis)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, computedRanges]);

  const prevToLastMonthRevenue = useMemo(() => {
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const sPrev = toISODate(startOfMonth(prevMonthDate));
    const ePrev = toISODate(endOfMonth(prevMonthDate));
    return payments
      .filter(p => p.payment_date >= sPrev && p.payment_date <= ePrev)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, today]);

  const momChange = useMemo(() => {
    if (prevToLastMonthRevenue === 0) return null;
    const diff = lastMonthRevenue - prevToLastMonthRevenue;
    return (diff / prevToLastMonthRevenue) * 100;
  }, [lastMonthRevenue, prevToLastMonthRevenue]);

  // Mode breakdown (for current filtered range)
  const modeTotals = useMemo(() => {
    const totals = {};
    filteredPayments.forEach(p => {
      totals[p.payment_mode] = (totals[p.payment_mode] || 0) + p.amount;
    });
    return totals;
  }, [filteredPayments]);

  const totalRevenueInRange = useMemo(
    () => filteredPayments.reduce((sum, p) => sum + p.amount, 0),
    [filteredPayments]
  );
  const transactionCount = filteredPayments.length;
  const avgTicket = transactionCount ? totalRevenueInRange / transactionCount : 0;

  // Daily revenue for line chart (show last 30 days for consistency)
  const lineChartData = useMemo(() => {
    const labels = [];
    const dataMap = {};
    const baseStart = addDays(today, -29);
    for (let i = 0; i < 30; i++) {
      const d = new Date(baseStart);
      d.setDate(new Date(baseStart).getDate() + i);
      const iso = toISODate(d);
      labels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
      dataMap[iso] = 0;
    }
    payments.forEach(p => {
      if (p.payment_date in dataMap) {
        dataMap[p.payment_date] += p.amount;
      }
    });
    const values = Object.keys(dataMap).sort().map(k => dataMap[k]);
    return {
      labels,
      datasets: [
        {
          label: 'Revenue (INR)',
          data: values,
          borderColor: '#facc15',
          backgroundColor: 'rgba(250, 204, 21, 0.12)',
          fill: true,
          tension: 0.35
        }
      ]
    };
  }, [payments, today]);

  const doughnutData = useMemo(() => {
    const labels = Object.keys(modeTotals);
    const data = labels.map(l => modeTotals[l]);
    const colors = labels.map(l => modeColors[l] || '#9ca3af');
    return {
      labels,
      datasets: [
        {
          label: 'Revenue by Mode',
          data,
          backgroundColor: colors,
          borderWidth: 0
        }
      ]
    };
  }, [modeTotals]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#e5e7eb' } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label ? ctx.dataset.label + ': ' : ''}${inr.format(ctx.parsed.y || ctx.parsed)}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: { color: '#9ca3af', callback: (val) => inr.format(val).replace('₹', '₹ ') }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  const exportCSV = () => {
    const header = ['payment_id', 'description', 'payment_date', 'amount(INR)', 'payment_mode'];
    const rows = filteredPayments.map(p => [
      p.payment_id,
      `"${p.description.replace(/"/g, '""')}"`,
      p.payment_date,
      p.amount,
      p.payment_mode
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${effectiveRange.start}_to_${effectiveRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const RangeButton = ({ id, label }) => (
    <button
      onClick={() => setRange(id)}
      className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
        range === id
          ? 'bg-yellow-400 text-black'
          : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Payments & Revenue Analytics</h1>
          <p className="text-gray-400">Track gym revenue trends and payment analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Download} onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      <Alert
        type="info"
        message="Showing demo data. Hook this page to your Flask API to load real payments from PostgreSQL."
      />

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <RangeButton id="last7" label="Last 7 days" />
            <RangeButton id="last30" label="Last 30 days" />
            <RangeButton id="thisMonth" label="This Month" />
            <RangeButton id="lastMonth" label="Last Month" />
            <RangeButton id="custom" label="Custom" />
          </div>

          <div className="flex items-center gap-3">
            {range === 'custom' && (
              <>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                />
              </>
            )}

            <div className="w-64">
              <Input
                label=""
                name="search"
                placeholder="Search description, mode or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Filter}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-6 w-6 text-yellow-400" />
              <span className="text-gray-400 text-sm">Revenue (Selected)</span>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{inr.format(totalRevenueInRange)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {effectiveRange.start} → {effectiveRange.end}
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-yellow-400" />
              <span className="text-gray-400 text-sm">Last Month Revenue</span>
            </div>
            {momChange !== null && (
              <span className={`inline-flex items-center text-sm font-semibold ${
                momChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {momChange >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                {Math.abs(momChange).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-3xl font-extrabold text-white">{inr.format(lastMonthRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">vs previous month</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-6 w-6 text-yellow-400" />
            <span className="text-gray-400 text-sm">Avg Ticket</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{inr.format(avgTicket || 0)}</p>
          <p className="text-xs text-gray-500 mt-1">{transactionCount} transactions</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <PieChart className="h-6 w-6 text-yellow-400" />
            <span className="text-gray-400 text-sm">This Month (So far)</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{inr.format(thisMonthRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Calendar month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Daily Revenue (Last 30 Days)</h3>
          <div className="h-72">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">Revenue by Payment Mode</h3>
          <div className="h-72">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e5e7eb' }}}}} />
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(modeTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([mode, amt]) => {
                const Icon = modeIcon[mode] || Wallet;
                return (
                  <div key={mode} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" style={{ color: modeColors[mode] || '#9ca3af' }} />
                      <span className="text-white">{mode}</span>
                    </div>
                    <span className="font-semibold" style={{ color: modeColors[mode] || '#e5e7eb' }}>
                      {inr.format(amt)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Recent Payments</h3>
          <span className="text-sm text-gray-400">
            Showing {filteredPayments.slice(0, 10).length} of {filteredPayments.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr className="text-left text-gray-400 text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.slice(0, 10).map((p) => (
                <tr key={p.payment_id} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-gray-300">{p.payment_id}</td>
                  <td className="p-4 text-gray-300">{p.payment_date}</td>
                  <td className="p-4 text-white">{p.description}</td>
                  <td className="p-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: (modeColors[p.payment_mode] || '#9ca3af') + '33',
                        color: modeColors[p.payment_mode] || '#9ca3af'
                      }}
                    >
                      {p.payment_mode}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-white">{inr.format(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Range: {effectiveRange.start} → {effectiveRange.end}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back to top
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;