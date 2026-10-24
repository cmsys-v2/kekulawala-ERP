import React, { useState } from 'react';
import {
  UserCheck, Plus, Search, Edit2, Trash2, Users, Briefcase,
  Phone, CreditCard, Award, Star, Building2, User
} from 'lucide-react';
import { Badge, Modal, FormField, StatCard, StarRating } from '../components/CommonUI';

const LKR = (n) => 'LKR ' + Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 });

const EMPTY_FORM = {
  name: '', desg: '', dept: 'Production', pool: 'employee', type: 'permanent',
  salary: '', phone: '', epf: '', rating: 4.0, payDue: 0, bankAcc: '',
  joinDate: '', nic: '', address: ''
};

const DEPTS = ['Production', 'Design', 'Sales', 'Admin', 'Accounts', 'External', 'IT'];

export const WorkforceView = ({ employees = [], setEmployees, showToast }) => {
  const [tab, setTab] = useState('employee');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const pool = employees.filter(e => e.pool === tab);
  const filtered = pool.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.desg || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.dept || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = employees.filter(e => e.pool === 'employee').reduce((s, e) => s + Number(e.salary || 0), 0);
  const totalOutstanding = employees.filter(e => e.pool === 'subcontractor').reduce((s, e) => s + Number(e.payDue || 0), 0);

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY_FORM, pool: tab }); setShowModal(true); };
  const openEdit = (e) => { setEditId(e.id); setForm({ ...e }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) return showToast('Name is required', 'error');
    if (!form.salary) return showToast('Salary / Rate is required', 'error');
    if (editId) {
      setEmployees(employees.map(e => e.id === editId ? { ...e, ...form, salary: Number(form.salary), payDue: Number(form.payDue || 0), rating: Number(form.rating || 4) } : e));
      showToast(`"${form.name}" updated!`);
    } else {
      const code = form.pool === 'employee' ? `EMP-${String(employees.filter(e => e.pool === 'employee').length + 1).padStart(3, '0')}` : `SC-${String(employees.filter(e => e.pool === 'subcontractor').length + 1).padStart(3, '0')}`;
      const newE = { ...form, id: Date.now(), code, salary: Number(form.salary), payDue: Number(form.payDue || 0), rating: Number(form.rating || 4) };
      setEmployees([newE, ...employees]);
      showToast(`"${form.name}" added to ${form.pool === 'employee' ? 'Workforce' : 'Subcontractor Pool'}!`);
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    setEmployees(employees.filter(e => e.id !== id));
    showToast(`"${name}" removed`, 'warning');
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-eyebrow">Operations · People</div>
          <h1 className="page-title">Workforce & Pools</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Employee roster, subcontractor pool & HR management</div>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Plus size={18} /> Add {tab === 'employee' ? 'Employee' : 'Subcontractor'}
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard icon={Users} title="Total Employees" value={employees.filter(e => e.pool === 'employee').length} sub="Permanent & Contract" color="#2563eb" />
        <StatCard icon={Briefcase} title="Subcontractors" value={employees.filter(e => e.pool === 'subcontractor').length} sub="External Pool" color="#8b5cf6" />
        <StatCard icon={CreditCard} title="Monthly Payroll" value={LKR(totalPayroll)} sub="Gross salary total" color="#10b981" />
        <StatCard icon={Award} title="SC Outstanding" value={LKR(totalOutstanding)} sub="Payable to subcontractors" color="#f59e0b" />
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--input-bg)', borderRadius: 10, padding: 4 }}>
          {[{ id: 'employee', label: '👷 Employees' }, { id: 'subcontractor', label: '🔧 Subcontractors' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: tab === t.id ? '#fff' : 'transparent', fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer', color: tab === t.id ? '#2563eb' : '#475569', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
              {t.label} ({employees.filter(e => e.pool === t.id).length})
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search name, designation..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
        </div>
      </div>

      {/* Employee / SC Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--input-bg)', borderBottom: '2px solid var(--card-border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Code</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Name & Role</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Department</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Contact</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>{tab === 'employee' ? 'Monthly Salary' : 'Contract Rate'}</th>
              {tab === 'subcontractor' && <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Amount Due</th>}
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Rating</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Type</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 700, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={tab === 'subcontractor' ? 9 : 8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No records found.</td></tr>
            )}
            {filtered.map((e, idx) => (
              <tr key={e.id} style={{ borderBottom: '1px solid var(--card-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--table-row-alt)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent-sky)' }}>{e.code}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.desg}</div>
                  {e.epf && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>EPF: {e.epf}</div>}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{e.dept}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}><Phone size={12} />{e.phone}</div>
                  {e.bankAcc && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>🏦 {e.bankAcc}</div>}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>{LKR(e.salary)}</td>
                {tab === 'subcontractor' && (
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: e.payDue > 0 ? '#ef4444' : '#10b981' }}>{LKR(e.payDue)}</td>
                )}
                <td style={{ padding: '12px 16px' }}><StarRating rating={e.rating || 4} /></td>
                <td style={{ padding: '12px 16px' }}><Badge status={e.pool} /></td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button onClick={() => openEdit(e)} style={{ border: 'none', background: 'var(--input-bg)', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Edit2 size={13} color="#475569" /></button>
                    <button onClick={() => handleDelete(e.id, e.name)} style={{ border: 'none', background: 'var(--color-danger-bg)', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={13} color="#ef4444" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Member' : `Add ${form.pool === 'employee' ? 'Employee' : 'Subcontractor'}`} onClose={() => setShowModal(false)} w={620}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="Pool Type">
              <select value={form.pool} onChange={e => setForm({ ...form, pool: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                <option value="employee">Employee</option>
                <option value="subcontractor">Subcontractor</option>
              </select>
            </FormField>
            <FormField label="Employment Type">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="casual">Casual</option>
              </select>
            </FormField>
            <FormField label="Full Name" req>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Designation / Trade">
              <input value={form.desg} onChange={e => setForm({ ...form, desg: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="Lead Welder / Graphic Designer" />
            </FormField>
            <FormField label="Department">
              <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Phone Number">
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label={form.pool === 'employee' ? 'Monthly Salary (LKR)' : 'Contract Rate (LKR)'} req>
              <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="EPF Number (if applicable)">
              <input value={form.epf || ''} onChange={e => setForm({ ...form, epf: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="EPF-88901" />
            </FormField>
            <FormField label="NIC Number">
              <input value={form.nic || ''} onChange={e => setForm({ ...form, nic: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
            <FormField label="Join Date">
              <input type="date" value={form.joinDate || ''} onChange={e => setForm({ ...form, joinDate: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
          </div>
          <FormField label="Bank Account Details">
            <input value={form.bankAcc} onChange={e => setForm({ ...form, bankAcc: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} placeholder="7701928301 - Commercial Bank, Kurunegala" />
          </FormField>
          {form.pool === 'subcontractor' && (
            <FormField label="Amount Currently Due (LKR)">
              <input type="number" value={form.payDue || 0} onChange={e => setForm({ ...form, payDue: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12 }} />
            </FormField>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--btn-primary)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {editId ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
