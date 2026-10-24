import React, { useEffect, useState, useRef } from 'react';
import { Check, X, Star, AlertCircle, TrendingUp, TrendingDown, Search } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Shared helpers
   ───────────────────────────────────────────────────────────── */
const alpha = (color, pct = 14) => {
  if (!color) return 'rgba(56,189,248,0.14)';
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${pct / 100})`;
  }
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
};

/* ─────────────────────────────────────────────────────────────
   PageHeader — the new signature page opening
   ───────────────────────────────────────────────────────────── */
export const PageHeader = ({ eyebrow, icon: Icon, title, highlight, subtitle, actions }) => (
  <div className="page-head">
    <div style={{ minWidth: 0 }}>
      {eyebrow && (
        <div className="page-eyebrow">
          {Icon && <Icon size={12} strokeWidth={2.2} color="var(--text-accent)" />}
          {eyebrow}
        </div>
      )}
      <h1 className="page-title">
        {title}{' '}
        {highlight && <span className="gradient-text">{highlight}</span>}
      </h1>
      {subtitle && <div className="page-sub">{subtitle}</div>}
    </div>
    {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>{actions}</div>}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Badge
   ───────────────────────────────────────────────────────────── */
export const Badge = ({ status, size = 'sm' }) => {
  const map = {
    active:          ['rgba(52,211,153,0.14)',  '#34d399', 'Active',        'rgba(52,211,153,0.26)'],
    ongoing:         ['rgba(56,189,248,0.14)',  '#38bdf8', 'Ongoing',       'rgba(56,189,248,0.28)'],
    completed:       ['rgba(52,211,153,0.14)',  '#34d399', 'Completed',     'rgba(52,211,153,0.26)'],
    planning:        ['rgba(251,191,36,0.14)',  '#fbbf24', 'Planning',      'rgba(251,191,36,0.28)'],
    approved:        ['rgba(52,211,153,0.14)',  '#34d399', 'Approved',      'rgba(52,211,153,0.26)'],
    sent:            ['rgba(56,189,248,0.14)',  '#38bdf8', 'Sent',          'rgba(56,189,248,0.28)'],
    draft:           ['rgba(148,163,184,0.14)', '#94a3b8', 'Draft',         'rgba(148,163,184,0.24)'],
    rejected:        ['rgba(251,113,133,0.14)', '#fb7185', 'Rejected',      'rgba(251,113,133,0.28)'],
    issued:          ['rgba(52,211,153,0.14)',  '#34d399', 'Issued',        'rgba(52,211,153,0.26)'],
    signed:          ['rgba(167,139,250,0.16)', '#c4b5fd', 'Signed',        'rgba(167,139,250,0.3)'],
    urgent:          ['rgba(251,113,133,0.16)', '#fb7185', '⚡ Urgent',     'rgba(251,113,133,0.3)'],
    employee:        ['rgba(56,189,248,0.14)',  '#38bdf8', 'Employee',      'rgba(56,189,248,0.28)'],
    subcontractor:   ['rgba(167,139,250,0.16)', '#c4b5fd', 'Subcontractor', 'rgba(167,139,250,0.3)'],
    high:            ['rgba(251,113,133,0.14)', '#fb7185', 'High',          'rgba(251,113,133,0.28)'],
    medium:          ['rgba(251,191,36,0.14)',  '#fbbf24', 'Medium',        'rgba(251,191,36,0.28)'],
    low:             ['rgba(56,189,248,0.14)',  '#38bdf8', 'Low',           'rgba(56,189,248,0.28)'],
    income:          ['rgba(52,211,153,0.14)',  '#34d399', 'Income',        'rgba(52,211,153,0.26)'],
    expense:         ['rgba(251,113,133,0.14)', '#fb7185', 'Expense',       'rgba(251,113,133,0.28)'],
    paid:            ['rgba(52,211,153,0.14)',  '#34d399', 'Paid',          'rgba(52,211,153,0.26)'],
    pending:         ['rgba(251,191,36,0.14)',  '#fbbf24', 'Pending',       'rgba(251,191,36,0.28)'],
    overdue:         ['rgba(251,113,133,0.16)', '#fb7185', 'Overdue',       'rgba(251,113,133,0.3)'],
    present:         ['rgba(52,211,153,0.14)',  '#34d399', 'Present',       'rgba(52,211,153,0.26)'],
    absent:          ['rgba(251,113,133,0.14)', '#fb7185', 'Absent',        'rgba(251,113,133,0.28)'],
  };

  const [bg, color, label, border] = map[status] || ['rgba(148,163,184,0.12)', 'var(--text-secondary)', status, 'rgba(148,163,184,0.2)'];

  return (
    <span
      className="badge"
      style={{
        background: bg,
        color,
        border: `1px solid ${border}`,
        padding: size === 'sm' ? '2px 9px' : '4px 12px',
        fontSize: size === 'sm' ? 10 : 11,
      }}
    >
      {label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   Sparkline
   ───────────────────────────────────────────────────────────── */
export const Sparkline = ({ data = [], color = '#38bdf8', height = 34, fill = true, id }) => {
  if (!data.length) return null;
  const w = 120;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - ((d - min) / span) * (h - 6) - 3;
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  const gid = id || `spark-${Math.round(Math.random() * 1e9)}`;

  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   StatCard / KPI tile
   ───────────────────────────────────────────────────────────── */
export const StatCard = ({
  icon: Icon,
  title,
  value,
  sub,
  color = 'var(--text-accent)',
  onClick,
  trend,
  spark,
  index = 0,
}) => (
  <div
    onClick={onClick}
    className="kpi-tile"
    style={{
      cursor: onClick ? 'pointer' : 'default',
      '--tile-glow': alpha(color, 26),
      animation: 'riseIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
      animationDelay: `${Math.min(index * 60, 400)}ms`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, position: 'relative', zIndex: 2 }}>
      <div style={{ minWidth: 0 }}>
        <div className="card-label" style={{ fontSize: 9, letterSpacing: '0.16em' }}>{title}</div>
        <div style={{ fontSize: 21, fontWeight: 800, marginTop: 6, fontFamily: 'var(--font-display)', letterSpacing: '-0.04em', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>
          {value}
        </div>
      </div>
      {Icon && (
        <div className="kpi-icon" style={{ background: alpha(color, 16), color, borderColor: alpha(color, 26) }}>
          <Icon size={18} strokeWidth={1.9} />
        </div>
      )}
    </div>

    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginTop: 10, position: 'relative', zIndex: 2 }}>
      <div style={{ minWidth: 0 }}>
        {sub && <div style={{ fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
        {trend !== undefined && (
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4,
              fontSize: 10.5, fontWeight: 700,
              color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
              background: trend >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              padding: '1px 6px', borderRadius: 99,
            }}
          >
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {spark && <div style={{ width: 84, flexShrink: 0 }}><Sparkline data={spark} color={typeof color === 'string' && color.startsWith('#') ? color : '#38bdf8'} /></div>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Toast
   ───────────────────────────────────────────────────────────── */
export const Toast = ({ msg, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === 'error'
      ? 'linear-gradient(120deg, #be123c, #7f1d1d)'
      : type === 'warning'
      ? 'linear-gradient(120deg, #b45309, #78350f)'
      : 'linear-gradient(120deg, #0d9488, #15803d)';
  const Icon = type === 'error' ? AlertCircle : Check;

  return (
    <div className="erp-toast no-print" style={{ background: bg }}>
      <span style={{ display: 'flex', width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>
        <Icon size={15} />
      </span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{ border: 'none', background: 'rgba(255,255,255,0.16)', borderRadius: 8, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4, flexShrink: 0 }}
      >
        <X size={12} color="#fff" />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Modal
   ───────────────────────────────────────────────────────────── */
export const Modal = ({ title, subtitle, eyebrow, onClose, children, w = 720 }) => (
  <div className="erp-modal-overlay no-print" onClick={onClose}>
    <div className="erp-modal" style={{ maxWidth: w }} onClick={e => e.stopPropagation()}>
      <div className="erp-modal-header">
        <div>
          {eyebrow && <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 4 }}>{eyebrow}</div>}
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h3>
          {subtitle && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 3 }}>{subtitle}</div>}
        </div>
        <button onClick={onClose} className="icon-btn" style={{ width: 34, height: 34, minHeight: 34 }} aria-label="Close">
          <X size={15} />
        </button>
      </div>
      <div className="erp-modal-body">{children}</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   FormField
   ───────────────────────────────────────────────────────────── */
export const FormField = ({ label, req, children, hint }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label className="form-label">
        {label} {req && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </label>
    )}
    {children}
    {hint && <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 5 }}>{hint}</div>}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   StarRating
   ───────────────────────────────────────────────────────────── */
export const StarRating = ({ rating = 0, size = 13 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        fill={i < Math.round(rating) ? '#fbbf24' : 'none'}
        color={i < Math.round(rating) ? '#fbbf24' : 'var(--text-muted)'}
        strokeWidth={1.8}
      />
    ))}
    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', marginLeft: 4 }}>
      {Number(rating).toFixed(1)}
    </span>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SectionHeader
   ───────────────────────────────────────────────────────────── */
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="section-header">
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <div className="section-sub">{subtitle}</div>}
    </div>
    {action}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   EmptyState
   ───────────────────────────────────────────────────────────── */
export const EmptyState = ({ icon: Icon, title, desc, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 24px', textAlign: 'center' }}>
    {Icon && (
      <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg, rgba(56,189,248,0.16), rgba(16,185,129,0.12))', border: '1px solid rgba(94,234,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Icon size={30} color="var(--text-accent)" strokeWidth={1.5} />
        <div style={{ position: 'absolute', inset: -6, borderRadius: 26, border: '1px dashed rgba(94,234,212,0.18)' }} />
      </div>
    )}
    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
    {desc && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 320 }}>{desc}</div>}
    {action}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Divider
   ───────────────────────────────────────────────────────────── */
export const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--card-border), transparent)' }} />
    {label && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--card-border), transparent)' }} />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   ProgressRing
   ───────────────────────────────────────────────────────────── */
export const ProgressRing = ({ value = 0, size = 92, stroke = 8, label, sublabel, from = '#22d3ee', to = '#10b981' }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gid = `ring-${Math.round(value)}-${size}`;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(Math.min(100, value) / 100) * c} ${c}`}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)', filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.5))' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: size / 4.6, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>{label ?? `${Math.round(value)}%`}</span>
        {sublabel && <span style={{ fontSize: 8.5, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>{sublabel}</span>}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CountUp
   ───────────────────────────────────────────────────────────── */
export const CountUp = ({ value = 0, duration = 1100, format = (v) => Math.round(v).toLocaleString('en-LK'), prefix = '', suffix = '' }) => {
  const [n, setN] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <span>{prefix}{format(n)}{suffix}</span>;
};

/* ─────────────────────────────────────────────────────────────
   Avatar
   ───────────────────────────────────────────────────────────── */
export const Avatar = ({ name = '?', size = 36, src, tone = 0 }) => {
  const palettes = [
    'linear-gradient(135deg,#22d3ee,#2563eb)',
    'linear-gradient(135deg,#34d399,#0d9488)',
    'linear-gradient(135deg,#818cf8,#8b5cf6)',
    'linear-gradient(135deg,#fbbf24,#f97316)',
    'linear-gradient(135deg,#f472b6,#8b5cf6)',
  ];
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.32, flexShrink: 0,
        background: src ? 'transparent' : palettes[tone % palettes.length],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: size * 0.36,
        fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 16px -8px rgba(0,0,0,0.6)',
        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SearchField
   ───────────────────────────────────────────────────────────── */
export const SearchField = ({ value, onChange, placeholder = 'Search…', width = 260, style }) => (
  <div style={{ position: 'relative', width, ...style }}>
    <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    <input
      className="erp-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ paddingLeft: 34, height: 38 }}
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Tabs (segmented)
   ───────────────────────────────────────────────────────────── */
export const Segmented = ({ options = [], value, onChange }) => (
  <div className="segmented">
    {options.map(o => {
      const id = typeof o === 'string' ? o : o.id;
      const label = typeof o === 'string' ? o : o.label;
      return (
        <button key={id} className={value === id ? 'active' : ''} onClick={() => onChange(id)}>
          {label}
        </button>
      );
    })}
  </div>
);
