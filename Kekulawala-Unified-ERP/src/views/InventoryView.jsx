import React, { useState, useMemo } from 'react';
import {
  Package, Plus, AlertTriangle, CheckCircle2, TrendingUp,
  TrendingDown, BarChart2, DollarSign, Layers, ArrowUpRight,
  Search, Filter, RefreshCw, Edit2, Trash2, ArrowDown
} from 'lucide-react';
import { Badge, FormField, Modal, StatCard, EmptyState, PageHeader } from '../components/CommonUI';

const GRADES = [
  "Sheets", "Paint", "Steel", "Lights", "Electrical",
  "Electronics & Circuits", "Spare Parts", "Timber",
  "Oil & Lubricants", "General", "BMS", "Miscellaneous"
];

const GRADE_COLORS = {
  "Sheets":               { bg: 'rgba(56,189,248,0.14)',  color: '#7dd3fc' },
  "Paint":                { bg: 'rgba(196,181,253,0.14)', color: '#c4b5fd' },
  "Steel":                { bg: 'rgba(148,163,184,0.14)', color: '#cbd5e1' },
  "Lights":               { bg: 'rgba(251,191,36,0.14)',  color: '#fbbf24' },
  "Electrical":           { bg: 'rgba(251,113,133,0.14)', color: '#fb7185' },
  "Electronics & Circuits":{ bg: 'rgba(34,211,238,0.14)', color: '#22d3ee' },
  "Spare Parts":          { bg: 'rgba(250,204,21,0.14)',  color: '#facc15' },
  "Timber":               { bg: 'rgba(74,222,128,0.14)',  color: '#4ade80' },
  "Oil & Lubricants":     { bg: 'rgba(251,146,60,0.14)',  color: '#fb923c' },
  "General":              { bg: 'rgba(129,140,248,0.14)', color: '#a5b4fc' },
  "BMS":                  { bg: 'rgba(45,212,191,0.14)',  color: '#2dd4bf' },
  "Miscellaneous":        { bg: 'rgba(156,163,175,0.14)', color: '#cbd5e1' },
};

const LKR = (n) => 'LKR ' + Number(n).toLocaleString('en-LK', { minimumFractionDigits: 0 });

/* ─── Mini Horizontal Bar ─────────────────────────────────── */
const MiniBar = ({ value, max, color }) => (
  <div style={{ height: 6, background: 'var(--table-border)', borderRadius: 99, overflow: 'hidden', width: '100%' }}>
    <div style={{
      height: '100%', borderRadius: 99,
      width: `${Math.min(100, (value / (max || 1)) * 100)}%`,
      background: color,
      transition: 'width 0.4s ease',
    }} />
  </div>
);

/* ─── Stock Health Ring (SVG donut) ──────────────────────── */
const DonutRing = ({ healthy, low, total }) => {
  const r = 32, circ = 2 * Math.PI * r;
  const healthyPct = total ? (healthy / total) : 0;
  const lowPct     = total ? (low / total)     : 0;
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={44} cy={44} r={r} fill="none" stroke="var(--table-border)" strokeWidth={9} />
      <circle cx={44} cy={44} r={r} fill="none" stroke="var(--color-success)" strokeWidth={9}
        strokeDasharray={`${healthyPct * circ} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
      />
      <circle cx={44} cy={44} r={r} fill="none" stroke="var(--color-danger)" strokeWidth={9}
        strokeDasharray={`${lowPct * circ} ${circ}`}
        strokeDashoffset={circ * 0.25 - healthyPct * circ}
        strokeLinecap="round"
      />
      <text x={44} y={40} textAnchor="middle" fontSize={14} fontWeight={800} fill="var(--text-primary)">{total}</text>
      <text x={44} y={53} textAnchor="middle" fontSize={9} fill="var(--text-secondary)">items</text>
    </svg>
  );
};

/* ─── Inventory Dashboard Banner ─────────────────────────── */
const InventoryDashboard = ({ materials }) => {
  const totalItems    = materials.length;
  const lowStock      = materials.filter(m => m.qty <= m.reorder).length;
  const healthyStock  = totalItems - lowStock;
  const totalValue    = materials.reduce((s, m) => s + (m.qty * m.rate), 0);
  const gradeGroups   = GRADES.map(g => ({
    grade: g,
    count: materials.filter(m => m.grade === g).length,
    value: materials.filter(m => m.grade === g).reduce((s, m) => s + m.qty * m.rate, 0),
    low:   materials.filter(m => m.grade === g && m.qty <= m.reorder).length,
  })).filter(g => g.count > 0);

  const maxValue = Math.max(...gradeGroups.map(g => g.value), 1);
  const alertItems = materials.filter(m => m.qty <= m.reorder).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        <StatCard
          icon={Package}
          title="Total SKUs"
          value={totalItems}
          sub={`${GRADES.filter(g => materials.some(m => m.grade === g)).length} active categories`}
          color="var(--text-accent)"
        />
        <StatCard
          icon={DollarSign}
          title="Stock Value"
          value={LKR(totalValue)}
          sub="Total inventory worth"
          color="var(--color-success)"
        />
        <StatCard
          icon={CheckCircle2}
          title="Healthy Stock"
          value={healthyStock}
          sub={`${totalItems ? Math.round(healthyStock/totalItems*100) : 0}% above reorder level`}
          color="var(--color-success)"
        />
        <StatCard
          icon={AlertTriangle}
          title="Low / Reorder"
          value={lowStock}
          sub={lowStock > 0 ? 'Immediate restocking needed' : 'All levels healthy'}
          color={lowStock > 0 ? 'var(--color-danger)' : 'var(--color-success)'}
        />
      </div>

      {/* Middle Row: Donut + Grade Breakdown + Alert Items */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
        {/* Donut Chart */}
        <div className="card" style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Stock Health</div>
          <DonutRing healthy={healthyStock} low={lowStock} total={totalItems} />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--color-success)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Healthy ({healthyStock})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--color-danger)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Low ({lowStock})</span>
            </div>
          </div>
        </div>

        {/* Grade Value Breakdown Bars */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Value by Category
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 154 }}>
            {gradeGroups.sort((a, b) => b.value - a.value).map(g => {
              const gc = GRADE_COLORS[g.grade] || { color: 'var(--text-accent)', bg: 'var(--sidebar-active-bg)' };
              return (
                <div key={g.grade} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, width: 80, flexShrink: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.grade}
                  </div>
                  <div style={{ flex: 1 }}>
                    <MiniBar value={g.value} max={maxValue} color={gc.color} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: gc.color, width: 90, textAlign: 'right', flexShrink: 0 }}>
                    {LKR(g.value)}
                  </div>
                  {g.low > 0 && (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertTriangle size={10} color="var(--color-danger)" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card" style={{ padding: '14px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={12} /> Reorder Alerts
          </div>
          {alertItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={28} color="var(--color-success)" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>All levels healthy!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alertItems.map(m => (
                <div key={m.id} style={{
                  padding: '8px 10px', borderRadius: 9,
                  background: 'var(--color-danger-bg)',
                  border: '1px solid rgba(244,63,94,0.15)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{m.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--color-danger)', fontWeight: 600 }}>
                      {m.qty} {m.uom} left
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      min {m.reorder}
                    </span>
                  </div>
                  <MiniBar value={m.qty} max={m.reorder * 3} color="var(--color-danger)" />
                </div>
              ))}
              {lowStock > 3 && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 2 }}>
                  +{lowStock - 3} more items need reorder
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main InventoryView ──────────────────────────────────── */
export const InventoryView = ({ materials = [], setMaterials, showToast }) => {
  const [activeGrade, setActiveGrade]     = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [showAddModal, setShowAddModal]   = useState(false);
  const [sortBy, setSortBy]               = useState('name');
  const [sortDir, setSortDir]             = useState('asc');

  const [form, setForm] = useState({
    name: '', grade: 'Sheets', qty: 50, uom: 'sheets', rate: 5000, reorder: 15, location: 'Main Store Yard'
  });

  const filtered = useMemo(() => {
    let list = activeGrade === 'all' ? materials : materials.filter(m => m.grade === activeGrade);
    if (searchQuery) list = list.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.code?.toLowerCase().includes(searchQuery.toLowerCase()));
    list = [...list].sort((a, b) => {
      const va = a[sortBy] ?? ''; const vb = b[sortBy] ?? '';
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [materials, activeGrade, searchQuery, sortBy, sortDir]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleAdd = () => {
    if (!form.name) return showToast('Material name required', 'error');
    const newM = {
      id: Date.now(),
      code: `MAT-${String(materials.length + 1).padStart(3, '0')}`,
      name: form.name, grade: form.grade,
      qty: Number(form.qty), uom: form.uom,
      reorder: Number(form.reorder), rate: Number(form.rate),
      lastRate: Number(form.rate), avgRate: Number(form.rate),
      supplier: 'Default Vendor', location: form.location,
      batchNo: `BT-2025-${String(materials.length + 1).padStart(3, '0')}`
    };
    setMaterials([newM, ...materials]);
    setShowAddModal(false);
    setForm({ name: '', grade: 'Sheets', qty: 50, uom: 'sheets', rate: 5000, reorder: 15, location: 'Main Store Yard' });
    showToast(`"${newM.name}" added to inventory!`);
  };

  const SortIcon = ({ col }) => sortBy === col
    ? <ArrowDown size={11} style={{ transform: sortDir === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
    : null;

  return (
    <div className="page">

      <PageHeader
        eyebrow="Supply chain · 12-grade inventory"
        icon={Package}
        title="Material"
        highlight="Intelligence"
        subtitle="Every sheet, light and steel profile — graded, valued and watched for reorder thresholds in real time."
        actions={
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add material
          </button>
        }
      />

      {/* ── Dashboard Infographic ────────────────────────── */}
      <InventoryDashboard materials={materials} />

      {/* ── Section Divider ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Stock Register
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--card-border)' }} />
      </div>

      {/* ── Table Controls ────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search material or code…"
            className="erp-input"
            style={{ paddingLeft: 32, fontSize: 12 }}
          />
        </div>

        {/* Grade Filter Chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 2, paddingBottom: 2 }}>
          <button onClick={() => setActiveGrade('all')} className={`filter-chip ${activeGrade === 'all' ? 'active' : ''}`}>
            All ({materials.length})
          </button>
          {GRADES.filter(g => materials.some(m => m.grade === g)).map(g => {
            const cnt = materials.filter(m => m.grade === g).length;
            const low = materials.filter(m => m.grade === g && m.qty <= m.reorder).length;
            return (
              <button key={g} onClick={() => setActiveGrade(g)} className={`filter-chip ${activeGrade === g ? 'active' : ''}`}>
                {g} ({cnt}){low > 0 ? ' ⚠' : ''}
              </button>
            );
          })}
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ flexShrink: 0 }}>
          <Plus size={15} /> Add Material
        </button>
      </div>

      {/* ── Materials Table ───────────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                {[
                  { key: 'code',     label: 'Code' },
                  { key: 'name',     label: 'Material Name' },
                  { key: 'grade',    label: 'Grade' },
                  { key: 'qty',      label: 'Qty' },
                  { key: 'rate',     label: 'Unit Rate' },
                  { key: 'location', label: 'Location' },
                  { key: 'status',   label: 'Status' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== 'status' && handleSort(col.key)}
                    style={{
                      cursor: col.key !== 'status' ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.label} <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                  No materials found
                </td></tr>
              ) : filtered.map(m => {
                const isLow = m.qty <= m.reorder;
                const gc = GRADE_COLORS[m.grade] || { color: 'var(--text-accent)', bg: 'var(--sidebar-active-bg)' };
                const stockPct = Math.min(100, m.reorder > 0 ? (m.qty / (m.reorder * 3)) * 100 : 100);
                return (
                  <tr key={m.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-accent)', fontFamily: 'monospace', fontSize: 11 }}>
                        {m.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.batchNo}</div>
                    </td>
                    <td>
                      <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: gc.bg, color: gc.color }}>
                        {m.grade}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 90 }}>
                        <span style={{ fontWeight: 800, color: isLow ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                          {m.qty} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>{m.uom}</span>
                        </span>
                        <MiniBar value={stockPct} max={100} color={isLow ? 'var(--color-danger)' : 'var(--color-success)'} />
                        <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>min {m.reorder} {m.uom}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{LKR(m.rate)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        Value: {LKR(m.qty * m.rate)}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{m.location}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isLow ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          <AlertTriangle size={10} /> Reorder
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                          <CheckCircle2 size={10} /> Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--table-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {materials.length} items
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>
            Total Value: {LKR(filtered.reduce((s, m) => s + m.qty * m.rate, 0))}
          </span>
        </div>
      </div>

      {/* ── Add Material Modal ────────────────────────────── */}
      {showAddModal && (
        <Modal title="➕ Add Material Stock" onClose={() => setShowAddModal(false)} w={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormField label="Material Name" req>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="erp-input" placeholder="e.g. Aluminum Composite Panel 4mm" />
            </FormField>
            <FormField label="Grade Category">
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="erp-select">
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <FormField label="Quantity">
                <input type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} className="erp-input" />
              </FormField>
              <FormField label="UOM">
                <input value={form.uom} onChange={e => setForm({ ...form, uom: e.target.value })} className="erp-input" placeholder="sheets / pcs / kg" />
              </FormField>
              <FormField label="Reorder Level">
                <input type="number" value={form.reorder} onChange={e => setForm({ ...form, reorder: e.target.value })} className="erp-input" />
              </FormField>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FormField label="Unit Rate (LKR)">
                <input type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} className="erp-input" />
              </FormField>
              <FormField label="Store Location">
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="erp-input" placeholder="Main Store Yard" />
              </FormField>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleAdd} className="btn btn-primary">
                <Plus size={15} /> Add to Inventory
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
