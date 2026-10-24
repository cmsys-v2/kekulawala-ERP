import React, { useState } from 'react';
import {
  Wrench, Plus, Edit2, Trash2, Search, AlertTriangle,
  CheckCircle2, Package, TrendingDown, Calendar
} from 'lucide-react';
import { Modal, FormField, StatCard } from '../components/CommonUI';

const LKR = (n) => 'LKR ' + Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 });

const CATEGORIES = ['Power Tools', 'Hand Tools', 'Welding Equipment', 'Lifting Equipment', 'Electrical Equipment', 'Measurement & Testing', 'Safety Equipment', 'Vehicles', 'Machinery', 'Other'];
const CONDITIONS = ['new', 'good', 'fair', 'needs_service', 'damaged'];
const CONDITION_COLORS = {
  new: ['var(--color-success-bg)', 'var(--color-success)'],
  good: ['var(--color-info-bg)', 'var(--accent-sky)'],
  fair: ['var(--color-warning-bg)', 'var(--color-warning)'],
  needs_service: ['var(--color-danger-bg)', 'var(--color-danger)'],
  damaged: ['var(--input-bg)', 'var(--text-muted)'],
};

const EMPTY_FORM = {
  name: '', category: 'Power Tools', qty: 1, available: 1,
  condition: 'good', purchaseRate: '', purchaseDate: '',
  depRate: 20, location: 'Workshop', lastService: '', assignedProject: '', serialNo: ''
};

const calcDepreciation = (purchaseRate, purchaseDate, depRate) => {
  if (!purchaseDate || !purchaseRate) return purchaseRate || 0;
  const years = (new Date() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
  const remaining = Math.max(0, Number(purchaseRate) * Math.pow(1 - (Number(depRate) / 100), years));
  return Math.round(remaining);
};

export const ToolsView = ({ tools = [], setTools, projects = [], showToast }) => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = tools.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (t) => { setEditId(t.id); setForm({ ...t }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) return showToast('Tool name is required', 'error');
    const currentValue = calcDepreciation(form.purchaseRate, form.purchaseDate, form.depRate);
    if (editId) {
      setTools(tools.map(t => t.id === editId ? { ...t, ...form, qty: Number(form.qty), available: Number(form.available), purchaseRate: Number(form.purchaseRate), depRate: Number(form.depRate), currentValue } : t));
      showToast(`Tool "${form.name}" updated!`);
    } else {
      const newT = {
        ...form, id: Date.now(),
        code: `TL-${String(tools.length + 1).padStart(3, '0')}`,
        qty: Number(form.qty), available: Number(form.available),
        purchaseRate: Number(form.purchaseRate), depRate: Number(form.depRate), currentValue
      };
      setTools([newT, ...tools]);
      showToast(`Tool "${form.name}" added to inventory!`);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => { setTools(tools.filter(t => t.id !== id)); showToast(`"${name}" removed`, 'warning'); };

  const totalBookValue = tools.reduce((s, t) => s + (calcDepreciation(t.purchaseRate, t.purchaseDate, t.depRate) * (t.qty || 1)), 0);
  const lowAvail = tools.filter(t => (t.available || 0) < (t.qty || 1)).length;
  const needsService = tools.filter(t => t.condition === 'needs_service' || t.condition === 'damaged').length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-eyebrow">Supply chain · Asset pool</div>
          <h1 className="page-title">Tools</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Tool registry, depreciation tracking & project assignment</div>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Plus size={18} /> Add Tool
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard icon={Package} title="Total Tool Lines" value={tools.length} sub="In registry" color="#2563eb" />
        <StatCard icon={TrendingDown} title="Total Book Value" value={LKR(totalBookValue)} sub="Depreciated value" color="#8b5cf6" />
        <StatCard icon={AlertTriangle} title="Low Availability" value={lowAvail} sub="Partially assigned out" color="#f59e0b" />
        <StatCard icon={Wrench} title="Needs Service" value={needsService} sub="Requires maintenance" color="#ef4444" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search tools..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12, background: 'var(--card-bg)' }}>
          <option value="all">All Categories ({tools.length})</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c} ({tools.filter(t => t.category === c).length})</option>)}
        </select>
      </div>

      {/* Tools Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
          <thead>
            <tr style={{ background: 'var(--input-bg)', borderBottom: '2px solid var(--card-border)' }}>
              {['Code', 'Tool Name', 'Category', 'Qty / Available', 'Purchase Rate', 'Book Value', 'Depreciation', 'Condition', 'Location', 'Project', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: h === 'Purchase Rate' || h === 'Book Value' ? 'right' : 'left', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No tools found.</td></tr>
            )}
            {filtered.map((t, idx) => {
              const currentValue = calcDepreciation(t.purchaseRate, t.purchaseDate, t.depRate);
              const [condBg, condColor] = CONDITION_COLORS[t.condition] || ['var(--input-bg)', 'var(--text-muted)'];
              const depPct = t.purchaseRate ? Math.round((1 - currentValue / Number(t.purchaseRate)) * 100) : 0;
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--card-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--table-row-alt)' }}>
                  <td style={{ padding: '11px 12px', fontWeight: 700, color: 'var(--accent-sky)' }}>{t.code}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                    {t.serialNo && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>S/N: {t.serialNo}</div>}
                  </td>
                  <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{t.category}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700 }}>{t.available || 0}</span>
                      <span style={{ color: 'var(--text-muted)' }}>/ {t.qty || 1}</span>
                      {(t.available || 0) < (t.qty || 1) && <AlertTriangle size={13} color="#f59e0b" />}
                    </div>
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{LKR(t.purchaseRate)}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-purple)', fontFamily: 'monospace' }}>{LKR(currentValue)}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--input-bg)', borderRadius: 99, minWidth: 50 }}>
                        <div style={{ height: 6, background: depPct > 70 ? '#ef4444' : depPct > 40 ? '#f59e0b' : '#10b981', borderRadius: 99, width: `${Math.min(100, depPct)}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{depPct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 12px' }}>
                    <span style={{ background: condBg, color: condColor, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>{t.condition?.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{t.location}</td>
                  <td style={{ padding: '11px 12px', color: 'var(--text-muted)', fontSize: 11 }}>{t.assignedProject || '—'}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => openEdit(t)} style={{ border: 'none', background: 'var(--input-bg)', borderRadius: 7, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Edit2 size={13} color="#475569" /></button>
                      <button onClick={() => handleDelete(t.id, t.name)} style={{ border: 'none', background: 'var(--color-danger-bg)', borderRadius: 7, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} color="#ef4444" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Tool' : 'Add Tool'} onClose={() => setShowModal(false)} w={620}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="Tool Name" req>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Category">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Total Qty">
              <input type="number" min={1} value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Available Qty">
              <input type="number" min={0} value={form.available} onChange={e => setForm({ ...form, available: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Purchase Rate (LKR)">
              <input type="number" value={form.purchaseRate} onChange={e => setForm({ ...form, purchaseRate: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Purchase Date">
              <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Depreciation Rate % (Annual)">
              <input type="number" min={0} max={100} value={form.depRate} onChange={e => setForm({ ...form, depRate: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Condition">
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Storage Location">
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="Workshop / Site A" />
            </FormField>
            <FormField label="Last Service Date">
              <input type="date" value={form.lastService || ''} onChange={e => setForm({ ...form, lastService: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Serial Number">
              <input value={form.serialNo || ''} onChange={e => setForm({ ...form, serialNo: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Assigned to Project">
              <select value={form.assignedProject || ''} onChange={e => setForm({ ...form, assignedProject: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                <option value="">— Unassigned —</option>
                {projects.map(p => <option key={p.id} value={p.code}>{p.code} — {p.name}</option>)}
              </select>
            </FormField>
          </div>
          {form.purchaseRate && form.purchaseDate && (
            <div style={{ background: 'var(--color-info-bg)', borderRadius: 10, padding: '10px 14px', marginTop: 8, fontSize: 12, color: 'var(--color-info)', border: '1px solid rgba(56,189,248,0.2)' }}>
              📊 Estimated Current Book Value: <strong>{LKR(calcDepreciation(form.purchaseRate, form.purchaseDate, form.depRate))}</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--btn-primary)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {editId ? 'Save Changes' : 'Add Tool'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
