import React, { useState, useMemo } from 'react';
import {
  DollarSign, Plus, Edit2, Trash2, Search, TrendingUp,
  TrendingDown, Filter, Download, BarChart2, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Modal, FormField, StatCard } from '../components/CommonUI';

const LKR = (n) => 'LKR ' + Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 });
const LKRS = (n) => Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 });

const INCOME_CATS = ['Advance Payment', 'Progress Billing', 'Final Payment', 'Retention Release', 'Service Income', 'Other Income'];
const EXPENSE_CATS = ['Material Purchase', 'Labor Payment', 'Subcontractor Payment', 'Transport & Logistics', 'Tool Purchase', 'Tool Repair', 'Overhead & Admin', 'Utilities', 'Marketing', 'Bank Charges', 'Tax Payment', 'Salary Payment', 'Other Expense'];
const SECTIONS = ['projects', 'procurement', 'payroll', 'transport', 'overhead', 'finance', 'marketing'];

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  type: 'income', section: 'projects', cat: 'Advance Payment',
  desc: '', amt: '', ref: '', notes: ''
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export const FinanceLedgerView = ({ transactions = [], setTransactions, showToast }) => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'analytics'

  const filtered = transactions.filter(t => {
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchSection = sectionFilter === 'all' || t.section === sectionFilter;
    const matchSearch = t.desc.toLowerCase().includes(search.toLowerCase()) ||
      (t.cat || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.ref || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSection && matchSearch;
  });

  // Sorted by date descending
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Running balance (latest first means balance accumulates from bottom to top)
  const ledgerWithBalance = useMemo(() => {
    const chronological = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    let balance = 0;
    const withBal = chronological.map(t => {
      balance += t.type === 'income' ? Number(t.amt) : -Number(t.amt);
      return { ...t, runningBalance: balance };
    });
    // Reverse so newest is first in display
    return withBal.reverse();
  }, [filtered]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amt), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amt), 0);
  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  // Monthly analytics data
  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), income: 0, expense: 0 };
      if (t.type === 'income') map[key].income += Number(t.amt);
      else map[key].expense += Number(t.amt);
    });
    return Object.values(map).sort((a, b) => a.year - b.year || MONTH_NAMES.indexOf(a.month) - MONTH_NAMES.indexOf(b.month)).slice(-12);
  }, [transactions]);

  // Expense by category (pie chart)
  const expenseByCat = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.cat] = (map[t.cat] || 0) + Number(t.amt);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [transactions]);

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (t) => { setEditId(t.id); setForm({ ...t }); setShowModal(true); };

  const handleSave = () => {
    if (!form.desc.trim()) return showToast('Description is required', 'error');
    if (!form.amt || Number(form.amt) <= 0) return showToast('Valid amount is required', 'error');
    if (editId) {
      setTransactions(transactions.map(t => t.id === editId ? { ...t, ...form, amt: Number(form.amt) } : t));
      showToast('Transaction updated!');
    } else {
      const newRef = `${form.type === 'income' ? 'REC' : 'EXP'}-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`;
      setTransactions([{ ...form, id: Date.now(), amt: Number(form.amt), ref: form.ref || newRef }, ...transactions]);
      showToast(`${form.type === 'income' ? 'Income' : 'Expense'} entry added!`);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    showToast('Transaction deleted', 'warning');
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-eyebrow">Finance · Double-entry ledger</div>
          <h1 className="page-title">Master Financial Ledger</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Full income & expense ledger with P&L analytics and running balance</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => showToast('Ledger exported!')} className="btn btn-primary">
            <Download size={16} /> Export
          </button>
          <button onClick={openAdd} className="btn btn-primary">
            <Plus size={18} /> Add Entry
          </button>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard icon={TrendingUp} title="Total Income (YTD)" value={LKR(totalIncome)} sub="All revenue streams" color="#10b981" />
        <StatCard icon={TrendingDown} title="Total Expenses (YTD)" value={LKR(totalExpense)} sub="All cost categories" color="#ef4444" />
        <StatCard icon={DollarSign} title="Net Profit" value={LKR(netProfit)} sub={`Margin: ${margin}%`} color={netProfit >= 0 ? '#2563eb' : '#ef4444'} />
        <div style={{ background: 'linear-gradient(135deg, #061120, #0b1a2e)', borderRadius: 14, padding: '16px 18px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Profit Margin</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: margin >= 20 ? '#6ee7b7' : margin >= 10 ? '#fde68a' : '#fca5a5', marginTop: 4 }}>{margin}%</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginTop: 6 }}>
            <div style={{ height: 6, borderRadius: 99, width: `${Math.min(100, Math.max(0, Number(margin)))}%`, background: margin >= 20 ? '#10b981' : margin >= 10 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
      </div>

      {/* Tab Switch */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--input-bg)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[{ id: 'ledger', label: '📋 Ledger Register' }, { id: 'analytics', label: '📊 P&L Analytics' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: activeTab === t.id ? '#fff' : 'transparent', fontWeight: activeTab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer', color: activeTab === t.id ? '#2563eb' : '#475569', boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'ledger' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input placeholder="Search description, category, reference..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </div>
            {['all', 'income', 'expense'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid', borderColor: typeFilter === t ? (t === 'income' ? 'rgba(52,211,153,0.5)' : t === 'expense' ? 'rgba(251,113,133,0.5)' : 'rgba(94,234,212,0.45)') : 'var(--card-border)', background: typeFilter === t ? (t === 'income' ? 'rgba(52,211,153,0.18)' : t === 'expense' ? 'rgba(251,113,133,0.18)' : 'rgba(56,189,248,0.16)') : 'transparent', color: typeFilter === t ? '#ffffff' : 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                {t === 'all' ? `All (${transactions.length})` : `${t} (${transactions.filter(tx => tx.type === t).length})`}
              </button>
            ))}
            <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12, background: 'var(--card-bg)' }}>
              <option value="all">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          {/* Ledger Table */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 800 }}>
              <thead>
                <tr style={{ background: 'var(--input-bg)', borderBottom: '2px solid var(--card-border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Section</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Reference</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Amount</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Balance</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledgerWithBalance.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No transactions found.</td></tr>
                )}
                {ledgerWithBalance.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--card-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--table-row-alt)' }}>
                    <td style={{ padding: '11px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.date}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{
                        background: t.type === 'income' ? '#dcfce7' : '#fee2e2',
                        color: t.type === 'income' ? '#166534' : '#991b1b',
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase'
                      }}>{t.type}</span>
                    </td>
                    <td style={{ padding: '11px 12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t.section}</td>
                    <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{t.cat}</td>
                    <td style={{ padding: '11px 12px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 220 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.desc}</div>
                    </td>
                    <td style={{ padding: '11px 12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11 }}>{t.ref}</td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                      {t.type === 'income' ? '+' : '-'}{LKRS(t.amt)}
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: t.runningBalance >= 0 ? '#2563eb' : '#ef4444', fontSize: 11 }}>
                      {LKRS(Math.abs(t.runningBalance))}{t.runningBalance < 0 ? ' ▼' : ''}
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                        <button onClick={() => openEdit(t)} style={{ border: 'none', background: 'var(--input-bg)', borderRadius: 7, padding: 6, cursor: 'pointer', display: 'flex' }}><Edit2 size={13} color="#475569" /></button>
                        <button onClick={() => handleDelete(t.id)} style={{ border: 'none', background: 'var(--color-danger-bg)', borderRadius: 7, padding: 6, cursor: 'pointer', display: 'flex' }}><Trash2 size={13} color="#ef4444" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--card-border)', background: 'var(--input-bg)' }}>
                  <td colSpan={6} style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>TOTALS ({filtered.length} entries)</td>
                  <td colSpan={3} style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: 800, fontFamily: 'monospace', fontSize: 13 }}>+{LKRS(filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amt), 0))}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>|</span>
                    <span style={{ color: 'var(--color-danger)', fontWeight: 800, fontFamily: 'monospace', fontSize: 13 }}>-{LKRS(filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amt), 0))}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* P&L Summary Banner */}
          <div style={{ background: 'linear-gradient(135deg, #061120, #0b1a2e)', borderRadius: 14, padding: 24, color: '#fff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Profit & Loss Summary (Year to Date)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { label: 'Gross Income', value: LKR(totalIncome), color: '#6ee7b7' },
                { label: 'Total Expenses', value: LKR(totalExpense), color: '#fca5a5' },
                { label: 'Net Profit', value: LKR(netProfit), color: netProfit >= 0 ? '#93c5fd' : '#fca5a5' },
                { label: 'Profit Margin', value: `${margin}%`, color: Number(margin) >= 20 ? '#6ee7b7' : Number(margin) >= 10 ? '#fde68a' : '#fca5a5' },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            {/* Monthly Revenue vs Expenses Bar Chart */}
            <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1px solid var(--card-border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Monthly Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => (v / 1e6).toFixed(1) + 'M'} />
                  <Tooltip formatter={v => LKR(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Breakdown Pie Chart */}
            <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: 20, border: '1px solid var(--card-border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Expense Breakdown by Category</h3>
              {expenseByCat.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No expense data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={expenseByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.length > 12 ? name.substring(0, 12) + '..' : name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {expenseByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => LKR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Income by Category</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Category</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Amount</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Entries</th>
                  <th style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const incomeMap = {};
                  transactions.filter(t => t.type === 'income').forEach(t => {
                    if (!incomeMap[t.cat]) incomeMap[t.cat] = { amt: 0, count: 0 };
                    incomeMap[t.cat].amt += Number(t.amt);
                    incomeMap[t.cat].count++;
                  });
                  return Object.entries(incomeMap).sort((a, b) => b[1].amt - a[1].amt).map(([cat, d], idx) => (
                    <tr key={cat} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{cat}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: 'var(--color-success)', fontFamily: 'monospace' }}>{LKR(d.amt)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px', color: 'var(--text-muted)' }}>{d.count}</td>
                      <td style={{ textAlign: 'right', padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <div style={{ width: 60, height: 6, background: 'var(--input-bg)', borderRadius: 99 }}>
                            <div style={{ height: 6, background: 'var(--btn-primary)', borderRadius: 99, width: `${totalIncome ? (d.amt / totalIncome * 100) : 0}%` }} />
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{totalIncome ? (d.amt / totalIncome * 100).toFixed(1) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Transaction' : 'Add Financial Entry'} onClose={() => setShowModal(false)} w={580}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="Date">
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Transaction Type">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, cat: e.target.value === 'income' ? 'Advance Payment' : 'Material Purchase' })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </FormField>
            <FormField label="Section">
              <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {SECTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </FormField>
            <FormField label="Category">
              <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {(form.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Amount (LKR)" req>
              <input type="number" value={form.amt} onChange={e => setForm({ ...form, amt: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="250000" />
            </FormField>
            <FormField label="Reference Number">
              <input value={form.ref || ''} onChange={e => setForm({ ...form, ref: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="REC-2025-001" />
            </FormField>
          </div>
          <FormField label="Description" req>
            <input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="Arpico Advance Payment - QT-2025-001" />
          </FormField>
          <FormField label="Notes">
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12, resize: 'vertical' }} />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: form.type === 'income' ? '#10b981' : '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {editId ? 'Save Changes' : `Add ${form.type === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
