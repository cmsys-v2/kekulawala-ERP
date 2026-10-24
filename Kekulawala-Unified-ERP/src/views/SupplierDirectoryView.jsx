import React, { useState } from 'react';
import {
  Building2, Plus, Edit2, Trash2, Search, Phone, Mail,
  MapPin, Star, MessageCircle, Filter, Globe
} from 'lucide-react';
import { Modal, FormField, StatCard, StarRating } from '../components/CommonUI';

const CATEGORIES = ['Sheets', 'Paint', 'Steel', 'Lights', 'Electrical', 'Electronics & Circuits', 'Spare Parts', 'Timber', 'Oil & Lubricants', 'General', 'BMS', 'Miscellaneous', 'Transport', 'Printing', 'Safety Equipment'];
const RELIABILITIES = ['excellent', 'good', 'average', 'poor'];

const EMPTY_FORM = {
  name: '', contact: '', phone: '', email: '',
  address: '', city: '', categories: [], rating: 4.0,
  payTerms: '30 days', reliability: 'good', whatsapp: '',
  website: '', notes: '', taxNo: ''
};

export const SupplierDirectoryView = ({ suppliers = [], setSuppliers, showToast }) => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.contact || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || (s.categories || []).includes(catFilter);
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (s) => { setEditId(s.id); setForm({ ...s, categories: s.categories || [] }); setShowModal(true); };

  const toggleCategory = (cat) => {
    const cats = form.categories.includes(cat) ? form.categories.filter(c => c !== cat) : [...form.categories, cat];
    setForm({ ...form, categories: cats });
  };

  const handleSave = () => {
    if (!form.name.trim()) return showToast('Supplier name required', 'error');
    if (editId) {
      setSuppliers(suppliers.map(s => s.id === editId ? { ...s, ...form, rating: Number(form.rating) } : s));
      showToast(`Supplier "${form.name}" updated!`);
    } else {
      setSuppliers([{ ...form, id: Date.now(), rating: Number(form.rating) }, ...suppliers]);
      showToast(`"${form.name}" added to Supplier Directory!`);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => { setSuppliers(suppliers.filter(s => s.id !== id)); showToast(`"${name}" removed`, 'warning'); };

  const avgRating = suppliers.length ? (suppliers.reduce((s, sup) => s + (sup.rating || 0), 0) / suppliers.length).toFixed(1) : '—';

  const RELIABILITY_COLORS = {
    excellent: ['var(--color-success-bg)', 'var(--color-success)'],
    good: ['var(--color-info-bg)', 'var(--accent-sky)'],
    average: ['var(--color-warning-bg)', 'var(--color-warning)'],
    poor: ['var(--color-danger-bg)', 'var(--color-danger)'],
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-eyebrow">Supply chain · Vendors</div>
          <h1 className="page-title">Supplier Directory</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Vendor management — contacts, categories, ratings & payment terms</div>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard icon={Building2} title="Total Suppliers" value={suppliers.length} sub="In directory" color="#2563eb" />
        <StatCard icon={Star} title="Avg Rating" value={avgRating} sub="Out of 5.0" color="#f59e0b" />
        <StatCard icon={Filter} title="Categories" value={new Set(suppliers.flatMap(s => s.categories || [])).size} sub="Supply categories" color="#8b5cf6" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search suppliers, city, contact..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12, background: 'var(--card-bg)' }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Supplier Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)' }}>
            No suppliers found. Add your first supplier!
          </div>
        )}
        {filtered.map(s => {
          const [relBg, relColor] = RELIABILITY_COLORS[s.reliability] || ['var(--input-bg)', 'var(--text-muted)'];
          return (
            <div key={s.id} style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb22, #7c3aed22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--accent-sky)', border: '1px solid var(--card-border)' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.city}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => openEdit(s)} style={{ border: 'none', background: 'var(--input-bg)', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}><Edit2 size={13} color="#475569" /></button>
                  <button onClick={() => handleDelete(s.id, s.name)} style={{ border: 'none', background: 'var(--color-danger-bg)', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}><Trash2 size={13} color="#ef4444" /></button>
                </div>
              </div>

              {/* Rating + Reliability */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StarRating rating={s.rating || 0} />
                <span style={{ background: relBg, color: relColor, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, textTransform: 'capitalize' }}>
                  {s.reliability || 'good'}
                </span>
              </div>

              {/* Categories */}
              {(s.categories || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {s.categories.map(c => (
                    <span key={c} style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(56,189,248,0.22)' }}>{c}</span>
                  ))}
                </div>
              )}

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} color="#2563eb" />{s.phone}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} color="#8b5cf6" />{s.email}</div>
                {s.address && <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} color="#ef4444" />{s.address}</div>}
              </div>

              {/* Payment Terms */}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--input-bg)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--card-border)' }}>
                💳 Payment Terms: <strong>{s.payTerms || 'N/A'}</strong>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                {s.whatsapp && (
                  <a href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 10px', borderRadius: 8, background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #bbf7d0' }}>
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
                <a href={`mailto:${s.email}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 10px', borderRadius: 8, background: 'var(--color-info-bg)', color: 'var(--accent-sky)', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(56,189,248,0.28)' }}>
                  <Mail size={14} /> Email
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Supplier' : 'Add New Supplier'} onClose={() => setShowModal(false)} w={640}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="Supplier / Company Name" req>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Contact Person">
              <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Phone Number">
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="011 2456789" />
            </FormField>
            <FormField label="WhatsApp Number">
              <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="+94771234567" />
            </FormField>
            <FormField label="Email Address">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="City">
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="Colombo" />
            </FormField>
            <FormField label="Payment Terms">
              <input value={form.payTerms} onChange={e => setForm({ ...form, payTerms: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="30 days credit / Cash" />
            </FormField>
            <FormField label="Reliability">
              <select value={form.reliability} onChange={e => setForm({ ...form, reliability: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {RELIABILITIES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </FormField>
            <FormField label="Rating (1-5)">
              <input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Tax / VAT Number">
              <input value={form.taxNo || ''} onChange={e => setForm({ ...form, taxNo: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
          </div>
          <FormField label="Address">
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
          </FormField>
          <FormField label="Supply Categories">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCategory(cat)} type="button"
                  style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid', borderColor: form.categories.includes(cat) ? '#2563eb' : '#e2e8f0', background: form.categories.includes(cat) ? '#2563eb' : '#fff', color: form.categories.includes(cat) ? '#fff' : '#475569', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  {cat}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Notes">
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12, resize: 'vertical' }} />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--btn-primary)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {editId ? 'Save Changes' : 'Add Supplier'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
