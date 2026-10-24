import React, { useState } from 'react';
import {
  Truck, Plus, Edit2, Trash2, Search, MapPin,
  Package, Clock, CheckCircle2, AlertTriangle, Navigation
} from 'lucide-react';
import { Modal, FormField, StatCard } from '../components/CommonUI';

const LKR = (n) => 'LKR ' + Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 });

const TRIP_STATUSES = ['planned', 'in_transit', 'delivered', 'cancelled'];
const STATUS_CONFIG = {
  planned: { bg: 'var(--input-bg)', color: 'var(--text-secondary)', label: '📋 Planned' },
  in_transit: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', label: '🚛 In Transit' },
  delivered: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', label: '✅ Delivered' },
  cancelled: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', label: '✖ Cancelled' },
};

const VEHICLE_TYPES = ['Light Lorry', 'Heavy Lorry (10-ton)', 'Heavy Lorry (20-ton)', 'Pickup Truck', 'Van', 'Three-wheeler', 'Container Truck', 'Crane Truck'];
const CARGO_TYPES = ['Materials (ACP / Sheets)', 'Steel / Fabrication', 'LED / Electrical', 'Finished Signage Boards', 'Tools & Equipment', 'Mixed Cargo', 'Waste Disposal', 'Other'];

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  vehicleType: 'Light Lorry', vehicleNo: '', driver: '',
  origin: 'Kekulawala Workshop, Kurunegala', destination: '',
  projectRef: '', cargoType: 'Materials (ACP / Sheets)', cargoDesc: '',
  status: 'planned', tripCost: '', distanceKm: '', notes: ''
};

export const TransportView = ({
  projects = [],
  trips: propTrips,
  setTrips: propSetTrips,
  showToast
}) => {
  const [localTrips, setLocalTrips] = useState([]);
  const trips = propTrips || localTrips;
  const setTrips = propSetTrips || setLocalTrips;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = trips.filter(t => {
    const matchSearch = t.destination.toLowerCase().includes(search.toLowerCase()) ||
      t.driver.toLowerCase().includes(search.toLowerCase()) ||
      (t.projectRef || '').toLowerCase().includes(search.toLowerCase()) ||
      t.vehicleNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY_FORM, id: `TR-${String(trips.length + 1).padStart(3, '0')}` }); setShowModal(true); };
  const openEdit = (t) => { setEditId(t.id); setForm({ ...t }); setShowModal(true); };

  const handleSave = () => {
    if (!form.destination.trim()) return showToast('Destination is required', 'error');
    if (!form.driver.trim()) return showToast('Driver name is required', 'error');
    if (editId) {
      setTrips(trips.map(t => t.id === editId ? { ...t, ...form, tripCost: Number(form.tripCost), distanceKm: Number(form.distanceKm) } : t));
      showToast(`Trip "${editId}" updated!`);
    } else {
      const newT = { ...form, id: `TR-${String(trips.length + 1).padStart(3, '0')}`, tripCost: Number(form.tripCost), distanceKm: Number(form.distanceKm) };
      setTrips([newT, ...trips]);
      showToast('New transport trip logged!');
    }
    setShowModal(false);
  };

  const updateStatus = (id, status) => {
    setTrips(trips.map(t => t.id === id ? { ...t, status } : t));
    showToast(`Trip status updated to "${status.replace('_', ' ')}"!`);
  };

  const totalCost = trips.reduce((s, t) => s + Number(t.tripCost || 0), 0);
  const inTransit = trips.filter(t => t.status === 'in_transit').length;
  const delivered = trips.filter(t => t.status === 'delivered').length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-eyebrow">Supply chain · Fleet</div>
          <h1 className="page-title">Transport & Logistics</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Delivery dispatch log — vehicles, drivers, routes & trip costs</div>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Plus size={18} /> Log Trip
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard icon={Truck} title="Total Trips" value={trips.length} sub="All logged trips" color="#2563eb" />
        <StatCard icon={Navigation} title="In Transit" value={inTransit} sub="Currently active" color="#f59e0b" />
        <StatCard icon={CheckCircle2} title="Delivered" value={delivered} sub="Completed runs" color="#10b981" />
        <StatCard icon={Package} title="Total Freight Cost" value={LKR(totalCost)} sub="All trips combined" color="#8b5cf6" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search destination, driver, project, vehicle..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
        </div>
        {['all', ...TRIP_STATUSES].map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid', borderColor: statusFilter === s ? 'rgba(94,234,212,0.45)' : 'var(--card-border)', background: statusFilter === s ? 'rgba(56,189,248,0.16)' : 'transparent', color: statusFilter === s ? '#ffffff' : 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {s === 'all' ? `All (${trips.length})` : `${cfg?.label} (${trips.filter(t => t.status === s).length})`}
            </button>
          );
        })}
      </div>

      {/* Trip Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)' }}>
            No trips found. Log your first delivery trip!
          </div>
        )}
        {filtered.map(trip => {
          const statusCfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.planned;
          return (
            <div key={trip.id} style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Icon + ID */}
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb15, #06b6d415)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)', flexShrink: 0 }}>
                  <Truck size={20} color="#2563eb" />
                </div>
                {/* Main Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-sky)', fontSize: 13 }}>{trip.id}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{trip.date}</span>
                    <span style={{ background: statusCfg.bg, color: statusCfg.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{statusCfg.label}</span>
                  </div>
                  {/* Route */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <MapPin size={13} color="#10b981" />
                    <span style={{ color: 'var(--text-muted)' }}>{trip.origin}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span style={{ fontWeight: 600 }}>{trip.destination}</span>
                  </div>
                  {/* Details Row */}
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>🚛 {trip.vehicleType} · {trip.vehicleNo}</span>
                    <span>👤 {trip.driver}</span>
                    {trip.projectRef && <span>📁 {trip.projectRef}</span>}
                    {trip.distanceKm && <span>📏 {trip.distanceKm} km</span>}
                    <span style={{ fontWeight: 700, color: 'var(--color-purple)' }}>💰 {LKR(trip.tripCost)}</span>
                  </div>
                  {trip.cargoDesc && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>📦 {trip.cargoType}: {trip.cargoDesc}</div>}
                  {trip.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>📝 {trip.notes}</div>}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  {trip.status === 'planned' && <button onClick={() => updateStatus(trip.id, 'in_transit')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>Dispatch ▶</button>}
                  {trip.status === 'in_transit' && <button onClick={() => updateStatus(trip.id, 'delivered')} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'var(--color-success-bg)', color: 'var(--color-success)', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>Delivered ✓</button>}
                  <button onClick={() => openEdit(trip)} style={{ border: 'none', background: 'var(--input-bg)', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Edit2 size={13} color="#475569" /></button>
                  <button onClick={() => { setTrips(trips.filter(t => t.id !== trip.id)); showToast('Trip removed', 'warning'); }} style={{ border: 'none', background: 'var(--color-danger-bg)', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} color="#ef4444" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Trip' : 'Log New Transport Trip'} onClose={() => setShowModal(false)} w={640}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="Trip Date">
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {TRIP_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </FormField>
            <FormField label="Vehicle Type">
              <select value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Vehicle Number Plate">
              <input value={form.vehicleNo} onChange={e => setForm({ ...form, vehicleNo: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="WP KV-1234" />
            </FormField>
            <FormField label="Driver Name" req>
              <input value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Cargo Type">
              <select value={form.cargoType} onChange={e => setForm({ ...form, cargoType: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {CARGO_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Trip Cost (LKR)">
              <input type="number" value={form.tripCost} onChange={e => setForm({ ...form, tripCost: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="12000" />
            </FormField>
            <FormField label="Distance (km)">
              <input type="number" value={form.distanceKm} onChange={e => setForm({ ...form, distanceKm: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="25" />
            </FormField>
          </div>
          <FormField label="Origin Location">
            <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
          </FormField>
          <FormField label="Destination" req>
            <input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="Delivery site address" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="Linked Project">
              <select value={form.projectRef || ''} onChange={e => setForm({ ...form, projectRef: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                <option value="">— Unlinked —</option>
                {projects.map(p => <option key={p.id} value={p.code}>{p.code}</option>)}
              </select>
            </FormField>
            <FormField label="Cargo Description">
              <input value={form.cargoDesc || ''} onChange={e => setForm({ ...form, cargoDesc: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="ACP panels, steel frames..." />
            </FormField>
          </div>
          <FormField label="Notes / Special Instructions">
            <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12, resize: 'vertical' }} />
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--btn-primary)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {editId ? 'Save Changes' : 'Log Trip'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
