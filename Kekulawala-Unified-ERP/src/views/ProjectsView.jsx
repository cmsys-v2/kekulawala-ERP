import React, { useState } from 'react';
import {
  FolderKanban, Plus, CheckCircle2, Clock, TrendingUp, AlertTriangle,
  ArrowUpRight, Wallet, CalendarDays, Layers, Search, CircleDollarSign,
  Users, Activity, ChevronRight, Hammer
} from 'lucide-react';
import { Badge, FormField, Modal, PageHeader, ProgressRing, Avatar, CountUp } from '../components/CommonUI';

const LKR = (n) => 'LKR ' + Number(n || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 });

const STATUS_TONES = {
  planning:  { bg: 'rgba(251,191,36,0.16)',  border: 'rgba(251,191,36,0.3)',  color: '#fbbf24' },
  ongoing:   { bg: 'rgba(56,189,248,0.16)',  border: 'rgba(56,189,248,0.3)',  color: '#38bdf8' },
  completed: { bg: 'rgba(52,211,153,0.16)',  border: 'rgba(52,211,153,0.3)',  color: '#34d399' },
};

export const ProjectsView = ({ projects = [], setProjects, clients = [], showToast }) => {
  const [selectedPrj, setSelectedPrj] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const [form, setForm] = useState({ name: '', clientId: clients[0]?.id || 1, quoted: 3500000, priority: 'medium' });

  const filtered = projects
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => !query || (p.name + ' ' + (p.clientName || '') + ' ' + (p.code || '')).toLowerCase().includes(query.toLowerCase()));

  const handleAdd = () => {
    if (!form.name) return showToast('Project name required', 'error');
    const cl = clients.find(c => c.id === Number(form.clientId));
    const newP = {
      id: `PRJ-${Date.now()}`,
      code: `PRJ-2025-${String(projects.length + 1).padStart(3, '0')}`,
      name: form.name,
      clientId: Number(form.clientId),
      clientName: cl?.name || 'Client',
      status: 'planning',
      quoted: Number(form.quoted),
      budget: Math.round(Number(form.quoted) * 0.8),
      actual: 0,
      start: new Date().toISOString().split('T')[0],
      deadline: '2025-06-30',
      priority: form.priority,
      progress: 0,
      jobCards: [],
      costs: { labor: 0, materials: 0, tools: 0, transport: 0, indirect: 0 },
    };
    setProjects([newP, ...projects]);
    setShowAddModal(false);
    setForm({ name: '', clientId: clients[0]?.id || 1, quoted: 3500000, priority: 'medium' });
    showToast(`Project "${newP.name}" created!`);
  };

  const totalPipeline = projects.reduce((s, p) => s + (Number(p.quoted) || 0), 0);
  const totalActual = projects.reduce((s, p) => s + (Number(p.actual) || 0), 0);
  const overBudget = projects.filter(p => Number(p.actual) > Number(p.budget)).length;
  const avgProgress = projects.length ? Math.round(projects.reduce((s, p) => s + (Number(p.progress) || 0), 0) / projects.length) : 0;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Operations · Work orders"
        icon={FolderKanban}
        title="Project"
        highlight="Command"
        subtitle="Every live job card, budget line and deadline in one cinematic view — synced with Firebase in real time."
        actions={
          <>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="erp-input"
                placeholder="Search projects…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: 32, width: 190, height: 40 }}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={15} /> New project
            </button>
          </>
        }
      />

      {/* Portfolio summary strip */}
      <div className="kpi-grid">
        {[
          { icon: Layers, label: 'Total projects', value: projects.length, sub: `${filtered.length} in view`, color: '#38bdf8' },
          { icon: Wallet, label: 'Portfolio value', value: LKR(totalPipeline), sub: 'Quoted contract value', color: '#34d399' },
          { icon: CircleDollarSign, label: 'Committed cost', value: LKR(totalActual), sub: `${avgProgress}% avg completion`, color: '#c4b5fd' },
          { icon: AlertTriangle, label: 'Over budget', value: overBudget, sub: overBudget ? 'Needs review' : 'All within budget', color: overBudget ? '#fb7185' : '#34d399' },
        ].map((k, i) => (
          <div key={k.label} className="kpi-tile" style={{ '--tile-glow': `${k.color}33`, animation: 'riseIn .5s var(--ease-out) both', animationDelay: `${i * 60}ms` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
              <div>
                <div className="card-label" style={{ fontSize: 9 }}>{k.label}</div>
                <div className="metric" style={{ fontSize: 20, marginTop: 5 }}>{k.value}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3 }}>{k.sub}</div>
              </div>
              <div className="kpi-icon" style={{ background: `${k.color}22`, color: k.color, borderColor: `${k.color}33` }}>
                <k.icon size={17} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'planning', 'ongoing', 'completed'].map(st => (
          <button key={st} className={`filter-chip ${filter === st ? 'active' : ''}`} onClick={() => setFilter(st)}>
            {st} · {st === 'all' ? projects.length : projects.filter(p => p.status === st).length}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
          <Activity size={11} /> live sync
        </div>
      </div>

      {/* Project cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16 }}>
        {filtered.map((p, i) => {
          const tone = STATUS_TONES[p.status] || STATUS_TONES.ongoing;
          const burn = p.budget ? Math.min(140, Math.round((Number(p.actual) / Number(p.budget)) * 100)) : 0;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPrj(p)}
              className="card card-clickable spotlight"
              style={{ padding: 18, animation: 'riseIn .5s var(--ease-out) both', animationDelay: `${Math.min(i * 45, 350)}ms` }}
              onMouseMove={e => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12, position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
                  <Avatar name={p.clientName || p.name} size={38} tone={i} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 750, color: 'var(--text-primary)', letterSpacing: '-0.015em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>{p.code} · {p.clientName}</div>
                  </div>
                </div>
                <ProgressRing value={p.progress || 0} size={46} stroke={5} from={tone.color} to="#22d3ee" label={`${p.progress || 0}%`} />
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 12, position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
                <Badge status={p.status} />
                <Badge status={p.priority} />
                {burn > 100 && <span className="badge" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid rgba(251,113,133,0.28)' }}>Burn {burn}%</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, position: 'relative', zIndex: 2 }}>
                <div style={{ padding: '8px 10px', borderRadius: 11, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                  <div style={{ fontSize: 8.5, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Budget</div>
                  <div style={{ fontSize: 12, fontWeight: 750, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: 2 }}>{LKR(p.budget)}</div>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: 11, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                  <div style={{ fontSize: 8.5, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Actual</div>
                  <div style={{ fontSize: 12, fontWeight: 750, fontFamily: 'var(--font-mono)', color: burn > 100 ? 'var(--color-danger)' : 'var(--color-success)', marginTop: 2 }}>{LKR(p.actual)}</div>
                </div>
              </div>

              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', position: 'relative', zIndex: 2 }}>
                <div style={{ height: '100%', width: `${Math.min(100, p.progress || 0)}%`, borderRadius: 99, background: `linear-gradient(90deg, ${tone.color}, #22d3ee)`, boxShadow: `0 0 12px ${tone.color}88`, transition: 'width .8s var(--ease-out)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 10, color: 'var(--text-muted)', position: 'relative', zIndex: 2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CalendarDays size={11} /> {p.deadline || '—'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-accent)', fontWeight: 700 }}>
                  Open job card <ChevronRight size={11} />
                </span>
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <div className="card" style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center' }}>
            <FolderKanban size={30} color="var(--text-muted)" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>No projects in this view</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>Adjust the filters or create a new work order.</div>
          </div>
        )}
      </div>

      {/* ── Create project modal ─────────────────────────── */}
      {showAddModal && (
        <Modal title="Create new project" eyebrow="Work order" subtitle="A job card is generated automatically for every new project." onClose={() => setShowAddModal(false)} w={520}>
          <FormField label="Project name" req>
            <input className="erp-input" placeholder="e.g. Arpico Kurunegala — LED signage" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Client">
            <select className="erp-select" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <div className="split-2" style={{ gap: 12 }}>
            <FormField label="Quoted contract value (LKR)">
              <input className="erp-input" type="number" value={form.quoted} onChange={e => setForm({ ...form, quoted: e.target.value })} />
            </FormField>
            <FormField label="Priority">
              <select className="erp-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 18 }}>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd}><CheckCircle2 size={15} /> Create project</button>
          </div>
        </Modal>
      )}

      {/* ── Project detail modal ─────────────────────────── */}
      {selectedPrj && (
        <Modal title={selectedPrj.name} eyebrow={`${selectedPrj.code} · job card`} subtitle={selectedPrj.clientName} onClose={() => setSelectedPrj(null)} w={680}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
            <ProgressRing value={selectedPrj.progress || 0} size={96} sublabel="complete" />
            <div style={{ flex: 1, minWidth: 200, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge status={selectedPrj.status} size="md" />
              <Badge status={selectedPrj.priority} size="md" />
              <span className="pill"><Clock size={10} /> {selectedPrj.deadline}</span>
              <span className="pill"><Hammer size={10} /> {selectedPrj.jobCards?.length || 0} job cards</span>
            </div>
          </div>

          <div className="split-3" style={{ marginBottom: 16 }}>
            {[
              { k: 'Quoted', v: LKR(selectedPrj.quoted), c: '#38bdf8' },
              { k: 'Budget', v: LKR(selectedPrj.budget), c: '#c4b5fd' },
              { k: 'Actual', v: LKR(selectedPrj.actual), c: '#34d399' },
            ].map(x => (
              <div key={x.k} style={{ padding: 12, borderRadius: 13, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                <div className="card-label" style={{ fontSize: 8.5 }}>{x.k}</div>
                <div className="metric" style={{ fontSize: 15, color: x.c, marginTop: 3 }}>{x.v}</div>
              </div>
            ))}
          </div>

          <div className="card-label" style={{ marginBottom: 8 }}>Cost breakdown</div>
          {Object.entries(selectedPrj.costs || {}).map(([k, v]) => {
            const total = Object.values(selectedPrj.costs || {}).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
            const pct = Math.round((Number(v) / total) * 100);
            return (
              <div key={k} style={{ marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{LKR(v)}</span>
                </div>
                <div className="progress-track" style={{ height: 5 }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </Modal>
      )}
    </div>
  );
};

export default ProjectsView;
