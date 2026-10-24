import React, { useEffect, useState } from 'react';
import {
  FolderKanban, DollarSign, Users, Package, Sparkles, Scale, TrendingUp,
  FileText, AlertTriangle, ArrowUpRight, ArrowRight, Zap, Clock, Plus,
  Layers, Truck, ShieldCheck, Activity, ChevronRight, Globe2,
  Wrench, CircleDollarSign, BadgeCheck, Wand2, FileSignature, Cpu
} from 'lucide-react';
import { StatCard, Badge, ProgressRing, CountUp, Sparkline, Avatar } from '../components/CommonUI';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const REVENUE_DATA = [
  { month: 'Apr', revenue: 2800000, expenses: 2100000 },
  { month: 'May', revenue: 3200000, expenses: 2400000 },
  { month: 'Jun', revenue: 2900000, expenses: 2200000 },
  { month: 'Jul', revenue: 3600000, expenses: 2800000 },
  { month: 'Aug', revenue: 3100000, expenses: 2350000 },
  { month: 'Sep', revenue: 3800000, expenses: 2900000 },
  { month: 'Oct', revenue: 4200000, expenses: 3100000 },
  { month: 'Nov', revenue: 3700000, expenses: 2800000 },
  { month: 'Dec', revenue: 4500000, expenses: 3400000 },
  { month: 'Jan', revenue: 3900000, expenses: 2950000 },
  { month: 'Feb', revenue: 4100000, expenses: 3050000 },
  { month: 'Mar', revenue: 4400000, expenses: 3200000 },
];

const SPARKS = {
  revenue: [32, 38, 34, 45, 41, 52, 48, 61, 58, 66],
  expense: [28, 30, 26, 34, 31, 30, 36, 33, 38, 35],
  projects: [3, 4, 4, 5, 4, 6, 5, 7, 6, 6],
  clients: [10, 11, 11, 12, 13, 13, 14, 15, 15, 16],
  quotes: [4, 6, 5, 7, 6, 8, 7, 9, 8, 10],
  stock: [6, 5, 7, 4, 5, 3, 4, 2, 3, 4],
};

const fmtLKR = (n) => 'LKR ' + Number(n).toLocaleString('en-LK', { maximumFractionDigits: 0 });
const compact = (n) => {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n;
};

/* ── Custom chart tooltip ───────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(7,15,28,0.94)', border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: 13, padding: '10px 13px', backdropFilter: 'blur(18px)',
      boxShadow: '0 24px 50px -20px rgba(0,0,0,0.9)', minWidth: 150,
    }}>
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(200,222,255,0.55)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#eaf2ff', marginTop: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: p.color || p.fill, boxShadow: `0 0 8px ${p.color || p.fill}` }} />
          <span style={{ color: 'rgba(220,235,255,0.65)' }}>{p.name}</span>
          <span style={{ marginLeft: 'auto', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{fmtLKR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Section wrapper ────────────────────────────────────── */
const Panel = ({ children, className = '', style }) => (
  <div className={`card ${className}`} style={{ padding: 18, ...style }}>{children}</div>
);

const PanelHead = ({ icon: Icon, title, sub, action }) => (
  <div className="panel-head">
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      {Icon && (
        <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(56,189,248,0.10)', border: '1px solid rgba(94,234,212,0.16)', color: 'var(--text-accent)' }}>
          <Icon size={15} />
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div className="card-title" style={{ fontSize: 13.5 }}>{title}</div>
        {sub && <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
    {action}
  </div>
);

/* ═══════════════════════════════════════════════════════ */
export const DashboardView = ({
  projects = [],
  clients = [],
  materials = [],
  quotations = [],
  employees = [],
  transactions = [],
  dailyTip = '',
  nav,
}) => {
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const lowStock = materials.filter(m => m.qty <= m.reorder);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
  const revenue = totalIncome || 6750000;
  const expense = totalExpense || 3020000;
  const netProfit = revenue - expense;
  const margin = revenue ? Math.round((netProfit / revenue) * 100) : 0;
  const pipelineValue = projects.reduce((s, p) => s + (Number(p.quoted) || 0), 0);
  const stockValue = materials.reduce((s, m) => s + (Number(m.qty) || 0) * (Number(m.rate) || 0), 0);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (Number(p.progress) || 0), 0) / projects.length)
    : 0;

  const greeting = clock.getHours() < 12 ? 'Good morning' : clock.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const go = (page) => nav && nav(page);

  const budgetData = projects.slice(0, 6).map(p => ({
    name: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name,
    budget: Number(p.budget) || 0,
    actual: Number(p.actual) || 0,
  }));

  const activity = [
    ...quotations.slice(0, 2).map((q, i) => ({
      icon: FileText, tone: '#38bdf8',
      title: `Quotation ${q.code || q.id} · ${q.clientName || 'Client'}`,
      meta: `LKR ${Number(q.total || 0).toLocaleString('en-LK')} · ${q.status || 'draft'}`,
    })),
    ...(transactions.slice(0, 2).map((t, i) => ({
      icon: t.type === 'income' ? TrendingUp : CircleDollarSign,
      tone: t.type === 'income' ? '#34d399' : '#fb7185',
      title: `${t.desc || t.category || 'Ledger entry'}`,
      meta: `${t.type === 'income' ? '+' : '−'} ${fmtLKR(t.amt)} · ${t.date || 'today'}`,
    }))),
    ...(employees.slice(0, 1).map(e => ({
      icon: BadgeCheck, tone: '#c4b5fd',
      title: `${e.name || 'Team member'} · ${e.role || 'Staff'}`,
      meta: e.type === 'subcontractor' ? 'Subcontractor pool' : 'Active on payroll',
    }))),
  ].slice(0, 5);

  return (
    <div className="page" style={{ gap: 16 }}>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-ring" />
        <div className="hero-orb" />
        <div className="hero-inner">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 11px 4px 5px', borderRadius: 99, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
            <span className="live-dot" />
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(224,242,255,0.86)' }}>
              Live operations · {clock.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h1 className="hero-title">
            {greeting}, Admin.<br />
            <span style={{ background: 'linear-gradient(100deg,#5eead4 0%,#7dd3fc 40%,#a7f3d0 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your enterprise is in motion.
            </span>
          </h1>

          <p className="hero-sub">
            {ongoingProjects.length} live work orders, {quotations.length} quotations in the pipeline and
            {' '}{lowStock.length} stock signals need attention. Everything below is synced in real time.
          </p>

          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 18 }}>
            <button className="btn btn-primary" onClick={() => go('quotations')}>
              <Plus size={14} /> New quotation
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => go('ai_estimator')}
              style={{ background: 'rgba(255,255,255,0.09)', borderColor: 'rgba(255,255,255,0.18)', color: '#ffffff' }}
            >
              <Sparkles size={14} /> Ask Gemini
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => go('document_studio')}
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.16)', color: 'rgba(235,245,255,0.85)' }}
            >
              <FileSignature size={14} /> Draft a letter
            </button>
          </div>

          <div className="hero-stats">
            {[
              { k: 'Revenue YTD', v: fmtLKR(revenue), c: '#5eead4' },
              { k: 'Net margin', v: `${margin}%`, c: '#7dd3fc' },
              { k: 'Pipeline', v: fmtLKR(pipelineValue), c: '#a7f3d0' },
              { k: 'Fleet & assets', v: `${materials.length + employees.length} tracked`, c: '#c4b5fd' },
            ].map(s => (
              <div className="hero-stat" key={s.k}>
                <div className="k">{s.k}</div>
                <div className="v" style={{ color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ KPI GRID ══════════════════════════════════════ */}
      <div className="kpi-grid">
        <StatCard icon={FolderKanban} title="Active projects" value={ongoingProjects.length} sub={`${projects.length} total · ${avgProgress}% avg progress`} color="#38bdf8" spark={SPARKS.projects} trend={12} index={0} onClick={() => go('projects')} />
        <StatCard icon={TrendingUp} title="Revenue (YTD)" value={fmtLKR(revenue)} sub="Net income stream" color="#34d399" spark={SPARKS.revenue} trend={8.4} index={1} onClick={() => go('finance')} />
        <StatCard icon={CircleDollarSign} title="Operating expenses" value={fmtLKR(expense)} sub={`Margin ${margin}% · healthy`} color="#fb7185" spark={SPARKS.expense} trend={-3.1} index={2} onClick={() => go('finance')} />
        <StatCard icon={FileText} title="Quotations issued" value={quotations.length} sub="Studio pipeline" color="#c4b5fd" spark={SPARKS.quotes} trend={5.2} index={3} onClick={() => go('quotations')} />
        <StatCard icon={Users} title="Client base" value={clients.length} sub="CRM accounts" color="#22d3ee" spark={SPARKS.clients} trend={4.7} index={4} onClick={() => go('clients')} />
        <StatCard icon={Package} title="Low stock signals" value={lowStock.length} sub={lowStock.length ? 'Reorder recommended' : 'Stock healthy'} color={lowStock.length ? '#fbbf24' : '#34d399'} spark={SPARKS.stock} index={5} onClick={() => go('inventory')} />
      </div>

      {/* ══ MAIN GRID ═════════════════════════════════════ */}
      <div className="dash-grid">

        {/* LEFT COLUMN ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Financial pulse */}
          <Panel>
            <PanelHead
              icon={Activity}
              title="Financial pulse"
              sub="Revenue vs operating cost · rolling 12 months"
              action={
                <div className="segmented hide-mobile">
                  <button className="active">12M</button>
                  <button>Quarter</button>
                  <button>MTD</button>
                </div>
              }
            />
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 6 }}>
              <div>
                <div className="card-label" style={{ fontSize: 8.5 }}>Revenue</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="metric" style={{ fontSize: 26 }}><CountUp value={revenue} format={(v) => compact(v)} prefix="LKR " /></span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-success)', background: 'var(--color-success-bg)', padding: '1px 6px', borderRadius: 99 }}>+8.4%</span>
                </div>
              </div>
              <div>
                <div className="card-label" style={{ fontSize: 8.5 }}>Expenses</div>
                <div className="metric" style={{ fontSize: 26 }}>{fmtLKR(expense)}</div>
              </div>
              <div>
                <div className="card-label" style={{ fontSize: 8.5 }}>Net profit</div>
                <div className="metric" style={{ fontSize: 26, color: 'var(--color-success)' }}>{fmtLKR(netProfit)}</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={228}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.42} />
                    <stop offset="55%" stopColor="#2563eb" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="strokeRevenue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#5eead4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={6} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={compact} width={52} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="url(#strokeRevenue)" strokeWidth={2.4} fill="url(#gradRevenue)" activeDot={{ r: 4, strokeWidth: 2, stroke: '#04070f' }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#fb7185" strokeWidth={1.8} strokeDasharray="4 4" fill="url(#gradExpense)" activeDot={{ r: 3.5, strokeWidth: 2, stroke: '#04070f' }} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          {/* Project portfolio + budget */}
          <Panel>
            <PanelHead
              icon={Layers}
              title="Project portfolio"
              sub="Budget discipline across live work orders"
              action={
                <button className="btn btn-secondary btn-sm" onClick={() => go('projects')}>
                  All projects <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <ProgressRing value={avgProgress} label={`${avgProgress}%`} sublabel="complete" size={96} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <ResponsiveContainer width="100%" height={budgetData.length ? 152 : 60}>
                  <BarChart data={budgetData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barGap={3}>
                    <CartesianGrid strokeDasharray="4 6" horizontal={false} />
                    <XAxis type="number" tickFormatter={compact} axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" width={104} axisLine={false} tickLine={false} tick={{ fontSize: 9.5 }} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(56,189,248,0.05)' }} />
                    <Bar dataKey="budget" name="Budget" fill="#2563eb" radius={[0, 5, 5, 0]} barSize={8} />
                    <Bar dataKey="actual" name="Actual" fill="#34d399" radius={[0, 5, 5, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ marginTop: 10, borderTop: '1px solid var(--table-border)' }}>
              {projects.slice(0, 4).map(p => (
                <div key={p.id} className="list-row" style={{ cursor: 'pointer' }} onClick={() => go('projects')}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(94,234,212,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-accent)' }}>
                    <FolderKanban size={13} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 650, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      <Badge status={p.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 5 }}>
                      <div className="progress-track" style={{ flex: 1, maxWidth: 220 }}>
                        <div className="progress-fill" style={{ width: `${p.progress || 0}%` }} />
                      </div>
                      <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.progress || 0}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }} className="hide-mobile">
                    <div style={{ fontSize: 11.5, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{fmtLKR(p.budget || 0)}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>deadline {p.deadline || '—'}</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </Panel>

          {/* Creative studio showcase */}
          <Panel>
            <PanelHead
              icon={Wand2}
              title="Creative & print studio"
              sub="Since 1982 · digital print, laser cutting & signage"
              action={<span className="pill pill-accent"><Globe2 size={10} /> Kurunegala</span>}
            />
            <div className="split-2">
              <div className="media-card" onClick={() => go('document_studio')}>
                <img src="/brand/promo-banner.jpg" alt="Kekulawala print & signboard studio" />
                <div className="media-veil" />
                <div className="media-body">
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5eead4' }}>Hoarding · Name boards</div>
                  <div style={{ fontSize: 14, fontWeight: 750, color: '#fff', marginTop: 2, fontFamily: 'var(--font-display)' }}>Signage & flex printing</div>
                </div>
              </div>
              <div className="media-card" onClick={() => go('ai_estimator')}>
                <img src="/brand/promo-digital.jpg" alt="Digital printing and laser cutting" />
                <div className="media-veil" />
                <div className="media-body">
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7dd3fc' }}>6ft · 10ft · Laser</div>
                  <div style={{ fontSize: 14, fontWeight: 750, color: '#fff', marginTop: 2, fontFamily: 'var(--font-display)' }}>Digital print & engraving</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Quotations', icon: FileText, page: 'quotations' },
                { label: 'AI BOQ', icon: Sparkles, page: 'ai_estimator' },
                { label: 'Letters & MOUs', icon: FileSignature, page: 'document_studio' },
                { label: 'Purchase orders', icon: Package, page: 'orders' },
                { label: 'Fleet', icon: Truck, page: 'transport' },
              ].map(l => (
                <button key={l.page} className="filter-chip" onClick={() => go(l.page)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <l.icon size={12} /> {l.label}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Gemini insights */}
          <div className="card glow-frame" style={{ padding: 18, position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, rgba(56,189,248,0.13), rgba(16,185,129,0.08) 55%, rgba(10,17,32,0.6))' }}>
            <div style={{ position: 'absolute', right: -40, top: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.4), transparent 70%)', filter: 'blur(30px)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg,#22d3ee,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -8px rgba(34,211,238,0.9)' }}>
                  <Sparkles size={15} color="#fff" />
                </div>
                <div>
                  <div className="card-title" style={{ fontSize: 13 }}>Gemini copilot</div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>Operational intelligence · live</div>
                </div>
                <span className="pill" style={{ marginLeft: 'auto', fontSize: 8, padding: '2px 7px' }}>2.5 FLASH</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {[
                  { tone: '#7dd3fc', tag: 'Schedule risk', text: 'Material buffers for LED modules are healthy — Arpico Kurunegala stays on track for the April hand-over.' },
                  { tone: '#6ee7b7', tag: 'Procurement', text: 'ACP 4mm hit reorder threshold. Raise PO to Lanwa Panels to protect the next 3 signage jobs.' },
                  { tone: '#c4b5fd', tag: 'Compliance', text: 'EPF/ETF remittance window opens this week; 2 subcontractor SLAs need DLP verification.' },
                ].map((ins, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, padding: '10px 11px', borderRadius: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ width: 3, borderRadius: 99, background: ins.tone, boxShadow: `0 0 10px ${ins.tone}`, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: ins.tone }}>{ins.tag}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 3 }}>{ins.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 12 }} onClick={() => go('ai_estimator')}>
                <Zap size={12} /> Run deep analysis
              </button>
            </div>
          </div>

          {/* Legal tip */}
          <div className="card hover-lift" style={{ padding: 18, cursor: 'pointer' }} onClick={() => go('legal_advisor')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251,191,36,0.2)' }}>
                <Scale size={14} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Sri Lanka legal pulse</div>
              <ShieldCheck size={13} color="var(--color-success)" style={{ marginLeft: 'auto' }} />
            </div>
            <div style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {dailyTip || 'Ensure overtime for non-manual employees is calculated at 1.5× the hourly rate under the Shop & Office Employees Act.'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 10.5, fontWeight: 700, color: 'var(--text-accent)' }}>
              Open legal hub <ArrowUpRight size={12} />
            </div>
          </div>

          {/* Stock alerts */}
          <Panel>
            <PanelHead
              icon={AlertTriangle}
              title="Stock signals"
              sub={`${lowStock.length} items at or below reorder`}
              action={
                <button className="btn btn-ghost btn-sm" onClick={() => go('inventory')} style={{ padding: '4px 8px' }}>
                  <ArrowUpRight size={13} />
                </button>
              }
            />
            {lowStock.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {lowStock.slice(0, 4).map(m => {
                  const pct = Math.min(100, Math.round((m.qty / (m.reorder || 1)) * 60));
                  return (
                    <div key={m.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{m.qty}/{m.reorder}</span>
                      </div>
                      <div className="progress-track" style={{ height: 5 }}>
                        <div style={{ height: '100%', width: `${Math.max(pct, 6)}%`, borderRadius: 99, background: 'linear-gradient(90deg,#fbbf24,#fb7185)', boxShadow: '0 0 10px rgba(251,191,36,0.5)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: 'var(--color-success)', fontSize: 11.5, fontWeight: 600 }}>
                <BadgeCheck size={18} /> All materials are above reorder thresholds.
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <div style={{ flex: 1, padding: '10px 12px', borderRadius: 13, background: 'rgba(255,255,255,0.035)', border: '1px solid var(--card-border)' }}>
                <div className="card-label" style={{ fontSize: 8 }}>Stock value</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', marginTop: 2 }}>{fmtLKR(stockValue)}</div>
              </div>
              <div style={{ flex: 1, padding: '10px 12px', borderRadius: 13, background: 'rgba(255,255,255,0.035)', border: '1px solid var(--card-border)' }}>
                <div className="card-label" style={{ fontSize: 8 }}>SKUs</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', marginTop: 2 }}>{materials.length}</div>
              </div>
            </div>
          </Panel>

          {/* Activity */}
          <Panel>
            <PanelHead icon={Clock} title="Live activity" sub="Latest movements across the workspace" />
            <div>
              {activity.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="list-row">
                    <div style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${a.tone}18`, color: a.tone, border: `1px solid ${a.tone}28` }}>
                      <Icon size={13} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{a.meta}</div>
                    </div>
                  </div>
                );
              })}
              {!activity.length && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', padding: '10px 4px' }}>No recent activity yet.</div>}
            </div>
          </Panel>

          {/* Team */}
          <Panel>
            <PanelHead icon={Users} title="People on deck" sub={`${employees.length} in the workforce pool`} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {employees.slice(0, 4).map((e, i) => (
                <div key={e.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={e.name || 'Team'} size={32} tone={i} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 650, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{e.role || e.type || 'Staff'}</div>
                  </div>
                  <Badge status={e.type === 'subcontractor' ? 'subcontractor' : 'employee'} />
                </div>
              ))}
              {!employees.length && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>No workforce records yet.</div>}
            </div>
          </Panel>
        </div>
      </div>

      {/* ══ FOOTER SIGNATURE ══════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '4px 4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}>
            <img src="/brand/app-icon.jpg" alt="Kekulawala" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Kekulawala Advertising · Negombo Road, Makuladuwa, Kurunegala · <span style={{ fontFamily: 'var(--font-mono)' }}>071 71 94 371</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9.5, color: 'var(--text-muted)' }}>
          <span className="live-dot" style={{ width: 5, height: 5 }} />
          Firebase realtime · encrypted
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
