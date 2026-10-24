import React, { useState } from 'react';
import {
  ShoppingBag, Plus, Edit2, Trash2, Search, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Send, Package, Printer, X
} from 'lucide-react';
import { Badge, Modal, FormField, StatCard } from '../components/CommonUI';

const LKR = (n) => 'LKR ' + Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 });

const PO_STATUSES = ['draft', 'sent', 'approved', 'received', 'cancelled'];
const STATUS_MAP = {
  draft: ['var(--input-bg)', 'var(--text-secondary)'],
  sent: ['var(--color-info-bg)', 'var(--accent-sky)'],
  approved: ['var(--color-warning-bg)', 'var(--color-warning)'],
  received: ['var(--color-success-bg)', 'var(--color-success)'],
  cancelled: ['var(--color-danger-bg)', 'var(--color-danger)'],
};

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  supplierId: '',
  supplierName: '',
  deliveryDate: '',
  terms: '30 days credit',
  notes: '',
  status: 'draft',
  items: [{ description: '', qty: 1, uom: 'units', unitRate: 0, total: 0 }]
};

export const PurchaseOrdersView = ({
  suppliers = [],
  materials = [],
  orders: propOrders,
  setOrders: propSetOrders,
  showToast
}) => {
  const [localOrders, setLocalOrders] = useState([]);
  const orders = propOrders || localOrders;
  const setOrders = propSetOrders || setLocalOrders;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = orders.filter(o => {
    const matchSearch = o.code.toLowerCase().includes(search.toLowerCase()) || o.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const poTotal = (po) => po.items.reduce((s, i) => s + Number(i.total || 0), 0);

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY_FORM, code: `PO-2025-${String(orders.length + 1).padStart(3, '0')}` }); setShowModal(true); };
  const openEdit = (po) => { setEditId(po.id); setForm({ ...po }); setShowModal(true); };

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    if (field === 'qty' || field === 'unitRate') {
      items[idx].total = Number(items[idx].qty || 0) * Number(items[idx].unitRate || 0);
    }
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', qty: 1, uom: 'units', unitRate: 0, total: 0 }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const handleSave = () => {
    if (!form.supplierName.trim()) return showToast('Supplier name required', 'error');
    if (form.items.every(i => !i.description)) return showToast('Add at least one item', 'error');
    if (editId) {
      setOrders(orders.map(o => o.id === editId ? { ...o, ...form } : o));
      showToast(`PO "${form.code}" updated!`);
    } else {
      setOrders([{ ...form, id: `PO-${Date.now()}` }, ...orders]);
      showToast(`Purchase Order "${form.code}" created!`);
    }
    setShowModal(false);
  };

  const updateStatus = (id, status) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    showToast(`PO status updated to "${status}"!`);
  };

  const totalValue = orders.reduce((s, o) => s + poTotal(o), 0);
  const pendingPOs = orders.filter(o => ['sent', 'approved'].includes(o.status)).length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-eyebrow">Supply chain · Procurement</div>
          <h1 className="page-title">Purchase Orders</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Create, manage and track procurement purchase orders</div>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Plus size={18} /> Create PO
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard icon={ShoppingBag} title="Total POs" value={orders.length} sub="All time" color="#2563eb" />
        <StatCard icon={Clock} title="Pending" value={pendingPOs} sub="Sent / Approved" color="#f59e0b" />
        <StatCard icon={CheckCircle2} title="Received" value={orders.filter(o => o.status === 'received').length} sub="Completed deliveries" color="#10b981" />
        <StatCard icon={Package} title="Total Value" value={LKR(totalValue)} sub="All purchase orders" color="#8b5cf6" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search by PO number or supplier..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
        </div>
        {['all', ...PO_STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid', borderColor: statusFilter === s ? 'rgba(94,234,212,0.45)' : 'var(--card-border)', background: statusFilter === s ? 'rgba(56,189,248,0.16)' : 'transparent', color: statusFilter === s ? '#ffffff' : 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
            {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* PO List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)' }}>
            No purchase orders found.
          </div>
        )}
        {filtered.map(po => {
          const total = poTotal(po);
          const isExp = expanded === po.id;
          const [sBg, sColor] = STATUS_MAP[po.status] || ['var(--input-bg)', 'var(--text-secondary)'];
          return (
            <div key={po.id} style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', flexWrap: 'wrap' }}>
                {/* PO Code */}
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontWeight: 800, color: 'var(--accent-sky)', fontSize: 14 }}>{po.code}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{po.date}</div>
                </div>
                {/* Supplier */}
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{po.supplierName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Delivery: {po.deliveryDate || 'TBD'}</div>
                </div>
                {/* Item count */}
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{po.items.length} line item{po.items.length !== 1 ? 's' : ''}</div>
                {/* Total */}
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{LKR(total)}</div>
                {/* Status */}
                <span style={{ background: sBg, color: sColor, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, textTransform: 'capitalize' }}>{po.status}</span>
                {/* Quick status actions */}
                <div style={{ display: 'flex', gap: 5 }}>
                  {po.status === 'draft' && <button onClick={() => updateStatus(po.id, 'sent')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'var(--color-info-bg)', color: 'var(--accent-sky)', cursor: 'pointer', fontWeight: 600 }}>Send ▶</button>}
                  {po.status === 'sent' && <button onClick={() => updateStatus(po.id, 'approved')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', cursor: 'pointer', fontWeight: 600 }}>Approve ✓</button>}
                  {po.status === 'approved' && <button onClick={() => updateStatus(po.id, 'received')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'var(--color-success-bg)', color: 'var(--color-success)', cursor: 'pointer', fontWeight: 600 }}>Received ✓</button>}
                  <button onClick={() => openEdit(po)} style={{ border: 'none', background: 'var(--input-bg)', borderRadius: 7, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Edit2 size={13} color="#475569" /></button>
                  <button onClick={() => setOrders(orders.filter(o => o.id !== po.id))} style={{ border: 'none', background: 'var(--color-danger-bg)', borderRadius: 7, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} color="#ef4444" /></button>
                  <button onClick={() => setExpanded(isExp ? null : po.id)} style={{ border: 'none', background: 'var(--input-bg)', borderRadius: 7, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {isExp ? <ChevronUp size={14} color="#475569" /> : <ChevronDown size={14} color="#475569" />}
                  </button>
                </div>
              </div>

              {/* Expanded Line Items */}
              {isExp && (
                <div style={{ borderTop: '1px solid var(--card-border)', padding: '14px 18px', background: 'var(--input-bg)' }}>
                  {po.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 10 }}>📝 {po.notes}</div>}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--input-bg)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>Description</th>
                        <th style={{ textAlign: 'center', padding: '8px 10px' }}>Qty</th>
                        <th style={{ textAlign: 'left', padding: '8px 10px' }}>UOM</th>
                        <th style={{ textAlign: 'right', padding: '8px 10px' }}>Unit Rate</th>
                        <th style={{ textAlign: 'right', padding: '8px 10px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {po.items.map((item, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--card-border)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600 }}>{item.description}</td>
                          <td style={{ textAlign: 'center', padding: '8px 10px' }}>{item.qty}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{item.uom}</td>
                          <td style={{ textAlign: 'right', padding: '8px 10px', fontFamily: 'monospace' }}>{LKR(item.unitRate)}</td>
                          <td style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 700, fontFamily: 'monospace' }}>{LKR(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '2px solid var(--card-border)', fontWeight: 800 }}>
                        <td colSpan={4} style={{ padding: '10px 10px', textAlign: 'right' }}>TOTAL</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--accent-sky)', fontFamily: 'monospace', fontSize: 14 }}>{LKR(total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Payment Terms: {po.terms}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create/Edit PO Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Purchase Order' : 'Create Purchase Order'} onClose={() => setShowModal(false)} w={760}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="PO Reference Code">
              <input value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="PO Date">
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Supplier Name" req>
              <input value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} list="supplier-list" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
              <datalist id="supplier-list">{suppliers.map(s => <option key={s.id} value={s.name} />)}</datalist>
            </FormField>
            <FormField label="Expected Delivery Date">
              <input type="date" value={form.deliveryDate || ''} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Payment Terms">
              <input value={form.terms || ''} onChange={e => setForm({ ...form, terms: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="30 days credit" />
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {PO_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </FormField>
          </div>

          {/* Line Items */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Line Items</span>
              <button onClick={addItem} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: 'none', background: 'var(--color-info-bg)', color: 'var(--accent-sky)', cursor: 'pointer', fontWeight: 600 }}>+ Add Item</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {form.items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 6, alignItems: 'center' }}>
                  <input placeholder="Item description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} style={{ padding: 7, borderRadius: 7, border: '1px solid var(--card-border)', fontSize: 12 }} />
                  <input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} style={{ padding: 7, borderRadius: 7, border: '1px solid var(--card-border)', fontSize: 12 }} />
                  <input placeholder="UOM" value={item.uom} onChange={e => updateItem(idx, 'uom', e.target.value)} style={{ padding: 7, borderRadius: 7, border: '1px solid var(--card-border)', fontSize: 12 }} />
                  <input type="number" placeholder="Unit Rate" value={item.unitRate} onChange={e => updateItem(idx, 'unitRate', e.target.value)} style={{ padding: 7, borderRadius: 7, border: '1px solid var(--card-border)', fontSize: 12 }} />
                  <button onClick={() => removeItem(idx)} style={{ border: 'none', background: 'var(--color-danger-bg)', borderRadius: 7, padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={13} color="#ef4444" /></button>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: 10, fontSize: 14, fontWeight: 800, color: 'var(--accent-sky)' }}>
              Total: {LKR(form.items.reduce((s, i) => s + Number(i.total || 0), 0))}
            </div>
          </div>

          <FormField label="Notes / Special Instructions">
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12, resize: 'vertical' }} />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--btn-primary)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {editId ? 'Save Changes' : 'Create PO'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
