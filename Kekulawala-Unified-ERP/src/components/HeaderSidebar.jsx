import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, FolderKanban, Users, UserCheck, CalendarCheck,
  CreditCard, Package, Wrench, ShoppingBag, Truck, Building2,
  FileText, Sparkles, Scale, DollarSign, Settings, ChevronLeft,
  ChevronRight, Bell, Menu, X, Sun, Moon, Palette, Search,
  Home, Grid3x3, BarChart2, Command, ArrowUpRight, Zap, CheckCheck,
  ShieldCheck, CircleDot, FileSignature, Cpu
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────
   Navigation map
   ───────────────────────────────────────────────────────────── */
export const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Command Center',     icon: LayoutDashboard, category: 'Overview',        hint: 'Live pulse' },

  { id: 'projects',        label: 'Projects & Jobs',    icon: FolderKanban,    category: 'Operations',      hint: 'Job cards' },
  { id: 'clients',         label: 'CRM & Clients',      icon: Users,           category: 'Operations',      hint: 'Accounts' },
  { id: 'hr',              label: 'Workforce Pools',    icon: UserCheck,       category: 'Operations',      hint: 'People' },
  { id: 'attendance',      label: 'Attendance',         icon: CalendarCheck,   category: 'Operations',      hint: 'Time' },
  { id: 'payroll',         label: 'Payroll Engine',     icon: CreditCard,      category: 'Operations',      hint: 'EPF / ETF' },

  { id: 'inventory',       label: 'Material Stock',     icon: Package,         category: 'Supply Chain',    hint: '12 grades' },
  { id: 'tools',           label: 'Tools & Assets',     icon: Wrench,          category: 'Supply Chain',    hint: 'Pool' },
  { id: 'orders',          label: 'Purchase Orders',    icon: ShoppingBag,     category: 'Supply Chain',    hint: 'Pipeline' },
  { id: 'suppliers',       label: 'Suppliers',          icon: Building2,       category: 'Supply Chain',    hint: 'Vendors' },
  { id: 'transport',       label: 'Transport & Fleet',  icon: Truck,           category: 'Supply Chain',    hint: 'Logistics' },

  { id: 'quotations',      label: 'Quotation Studio',   icon: FileText,        category: 'Creative Studio', hint: 'BOQ' },
  { id: 'ai_estimator',    label: 'AI BOQ Estimator',   icon: Sparkles,        category: 'Creative Studio', hint: 'Gemini' },
  { id: 'document_studio', label: 'Letters & MOUs',     icon: FileSignature,   category: 'Creative Studio', hint: 'Print' },

  { id: 'finance',         label: 'Financial Ledger',   icon: DollarSign,      category: 'Finance & Legal', hint: 'Books' },
  { id: 'legal_advisor',   label: 'SL Legal Advisor',   icon: Scale,           category: 'Finance & Legal', hint: 'Compliance' },
  { id: 'settings',        label: 'Settings',           icon: Settings,        category: 'Finance & Legal', hint: 'Brand' },
];

const CATEGORIES = ['Overview', 'Operations', 'Supply Chain', 'Creative Studio', 'Finance & Legal'];

const MOBILE_NAV = [
  { id: 'dashboard', label: 'Home',     icon: Home },
  { id: 'projects',  label: 'Projects', icon: FolderKanban },
  { id: 'clients',   label: 'Clients',  icon: Users },
  { id: 'finance',   label: 'Finance',  icon: BarChart2 },
  { id: '__menu',    label: 'Menu',     icon: Grid3x3, isSidebarToggle: true },
];

const NOTIFICATIONS = [
  { id: 1, icon: ShoppingBag,   tone: '#fbbf24', title: 'PO-2025-014 awaiting approval', meta: 'Procurement · 12 min ago' },
  { id: 2, icon: AlertTriangleIcon, tone: '#fb7185', title: 'ACP 4mm below reorder level', meta: 'Material stock · 1 hr ago' },
  { id: 3, icon: ShieldCheck,   tone: '#34d399', title: 'EPF / ETF remittance window opens', meta: 'Compliance · Today' },
  { id: 4, icon: Sparkles,      tone: '#38bdf8', title: 'Gemini drafted a payment reminder', meta: 'Document studio · 3 hrs ago' },
];

function AlertTriangleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Theme picker
   ───────────────────────────────────────────────────────────── */
const ThemePicker = ({ onClose }) => {
  const { themeId, setThemeId } = useTheme();
  return (
    <div className="popover" onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 4px' }}>
        <div className="card-label" style={{ color: 'var(--text-secondary)' }}>Appearance</div>
        <Palette size={13} color="var(--text-muted)" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => { setThemeId(t.id); onClose(); }}
            className={`theme-row ${themeId === t.id ? 'active' : ''}`}
          >
            <div style={{ width: 34, height: 34, borderRadius: 10, background: t.preview, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12), 0 6px 14px -8px rgba(0,0,0,0.8)' }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                {t.name}
                {t.dark ? <Moon size={10} color="var(--text-muted)" /> : <Sun size={10} color="var(--color-warning)" />}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>
            </div>
            {themeId === t.id && <CheckCheck size={14} color="var(--text-accent)" />}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Command palette
   ───────────────────────────────────────────────────────────── */
const CommandPalette = ({ onClose, onNavigate }) => {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = query
      ? NAV_ITEMS.filter(n => (n.label + ' ' + n.category + ' ' + n.hint).toLowerCase().includes(query))
      : NAV_ITEMS;
    return list.slice(0, 9);
  }, [q]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setActive(0); }, [q]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && results[active]) { onNavigate(results[active].id); onClose(); }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={e => e.stopPropagation()}>
        <div className="cmdk-input">
          <Search size={17} color="var(--text-muted)" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Jump to a module, client or document…"
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="cmdk-list">
          <div className="cmdk-group-label">{q ? `${results.length} results` : 'All modules'}</div>
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`cmdk-item ${i === active ? 'active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => { onNavigate(item.id); onClose(); }}
              >
                <span className="cmdk-ico"><Icon size={15} /></span>
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <span className="cmdk-hint">{item.category}</span>
                {i === active && <ArrowUpRight size={13} color="var(--text-accent)" />}
              </button>
            );
          })}
          {!results.length && (
            <div style={{ padding: '26px 14px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>
              No modules match “{q}”
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Header + Sidebar shell
   ───────────────────────────────────────────────────────────── */
export const HeaderSidebar = ({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  dailyTip = '',
  children,
}) => {
  const activeItem = NAV_ITEMS.find(n => n.id === activePage) || NAV_ITEMS[0];
  const { currentTheme } = useTheme();
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  const navigate = (id) => {
    setActivePage(id);
    setMobileOpen(false);
    setNotifOpen(false);
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen(o => !o);
      }
      if (e.key === 'Escape') { setCmdkOpen(false); setNotifOpen(false); setThemePickerOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', mobileOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [mobileOpen]);

  const ActiveIcon = activeItem.icon;
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  /* ── Sidebar content ────────────────────────────────── */
  const sidebarContent = (
    <>
      <div className="sidebar-brand">
        <div className="brand-mark">
          <img src="/brand/app-icon.jpg" alt="Kekulawala" />
        </div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">KEKULAWALA</span>
            <span className="brand-sub">ERP · est. 1982</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {CATEGORIES.map(cat => {
          const items = NAV_ITEMS.filter(n => n.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} style={{ marginBottom: 2 }}>
              {!collapsed
                ? <div className="nav-cat">{cat}</div>
                : <div style={{ height: 1, margin: '10px 8px', background: 'linear-gradient(90deg,rgba(255,255,255,0.08),transparent)' }} />}
              {items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '9px 0' : '9px 11px' }}
                  >
                    <span className="nav-icon-wrap">
                      <Icon
                        size={16}
                        color={isActive ? 'var(--sidebar-icon-active)' : 'currentColor'}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        style={{ flexShrink: 0 }}
                      />
                    </span>
                    {!collapsed && <span className="truncate" style={{ flex: 1 }}>{item.label}</span>}
                    {!collapsed && item.id === 'orders' && <span className="nav-badge">3</span>}
                  </button>
                );
              })}
            </div>
          );
        })}

        {!collapsed && (
          <div style={{ marginTop: 14, padding: '12px 12px 13px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(140deg, rgba(56,189,248,0.13), rgba(16,185,129,0.09))', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -22, top: -22, width: 76, height: 76, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.55), transparent 70%)', filter: 'blur(14px)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
              <Sparkles size={12} color="#5eead4" />
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5eead4' }}>Gemini Copilot</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(226,240,255,0.72)', lineHeight: 1.5, marginTop: 6, position: 'relative' }}>
              Ask anything about jobs, cashflow or compliance — in English or සිංහල.
            </div>
            <button
              onClick={() => navigate('ai_estimator')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', marginTop: 10, position: 'relative' }}
            >
              <Zap size={12} /> Open AI Studio
            </button>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-status">
            <span className="dot" />
            <span>Cloud sync live</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>v6.0</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="nav-item"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '9px 0' : '9px 11px', marginBottom: 0 }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="nav-icon-wrap">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          {!collapsed && <span style={{ fontSize: 11.5 }}>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className="erp-sidebar no-print"
        style={{ width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile overlay + drawer ─────────────────────── */}
      {mobileOpen && <div className="erp-sidebar-overlay show-mobile-only" onClick={() => setMobileOpen(false)} />}
      <aside
        className={`erp-sidebar show-mobile-only no-print ${mobileOpen ? 'mobile-open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="icon-btn"
          style={{ position: 'absolute', top: 16, right: 14, zIndex: 5, background: 'rgba(255,255,255,0.06)' }}
          aria-label="Close menu"
        >
          <X size={15} />
        </button>
        {sidebarContent}
      </aside>

      {/* ── Main column ─────────────────────────────────── */}
      <div className="erp-main-wrapper">
        <header className="erp-topbar no-print">
          {/* Left cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <button
              onClick={() => { setCollapsed(false); setMobileOpen(!mobileOpen); }}
              className="icon-btn show-mobile-only"
              style={{ width: 34, height: 34, minHeight: 34 }}
              aria-label="Open menu"
            >
              <Menu size={17} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                className="hide-mobile"
                style={{
                  width: 34, height: 34, borderRadius: 11,
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(16,185,129,0.14))',
                  border: '1px solid rgba(94,234,212,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-accent)', flexShrink: 0,
                }}
              >
                <ActiveIcon size={16} strokeWidth={2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="hide-mobile" style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: 1 }}>
                  {activeItem.category}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <h1 style={{ fontSize: 14, fontWeight: 700, color: 'var(--header-text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }}>
                    {activeItem.label}
                  </h1>
                  <span className="pill hide-mobile" style={{ padding: '1px 7px', fontSize: 8.5, gap: 4 }}>
                    <span className="live-dot" style={{ width: 5, height: 5 }} /> LIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center search trigger */}
          <button
            className="hide-mobile"
            onClick={() => setCmdkOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: 330, maxWidth: '30vw', height: 38,
              padding: '0 10px 0 12px', borderRadius: 11,
              border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.035)',
              color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
              transition: 'all 0.2s ease', flexShrink: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--card-border-strong)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.035)'; }}
          >
            <Search size={14} />
            <span style={{ flex: 1, textAlign: 'left' }}>Search workspace…</span>
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </button>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div className="pill hide-mobile hide-lg" style={{ height: 34, gap: 6, fontSize: 10, letterSpacing: '0.02em', textTransform: 'none', fontWeight: 600 }}>
              <Sparkles size={12} color="var(--text-accent)" />
              <span style={{ color: 'var(--text-secondary)' }}>{greeting}, Admin</span>
            </div>

            <div className="hide-mobile hide-lg" style={{ fontSize: 11, color: 'var(--header-muted)', fontWeight: 600, whiteSpace: 'nowrap', padding: '0 4px' }}>
              {now.toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setThemePickerOpen(o => !o); setNotifOpen(false); }}
                className="icon-btn hide-mobile"
                style={{ width: 36, height: 36, minHeight: 36 }}
                title="Appearance"
              >
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: currentTheme?.dot || 'var(--brand-gradient)', boxShadow: '0 0 0 2px rgba(255,255,255,0.09)' }} />
              </button>
              {themePickerOpen && <ThemePicker onClose={() => setThemePickerOpen(false)} />}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setNotifOpen(o => !o); setThemePickerOpen(false); }}
                className="icon-btn"
                style={{ width: 36, height: 36, minHeight: 36 }}
                title="Notifications"
              >
                <Bell size={16} />
                <span style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: 99, background: 'var(--color-danger)', boxShadow: '0 0 8px var(--color-danger)' }} />
              </button>
              {notifOpen && (
                <div className="popover" style={{ width: 320 }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 8px' }}>
                    <div className="card-label" style={{ color: 'var(--text-secondary)' }}>Notifications</div>
                    <span className="pill pill-accent" style={{ fontSize: 8.5, padding: '1px 7px' }}>4 new</span>
                  </div>
                  {NOTIFICATIONS.map(n => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} style={{ display: 'flex', gap: 10, padding: '9px 6px', borderRadius: 11, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover-bg)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: 28, height: 28, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${n.tone}1f`, color: n.tone }}>
                          <Icon size={13} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>{n.title}</div>
                          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2 }}>{n.meta}</div>
                        </div>
                      </div>
                    );
                  })}
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 6 }} onClick={() => setNotifOpen(false)}>
                    View all activity
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('settings')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '3px 10px 3px 3px',
                borderRadius: 11, background: 'var(--header-user-bg)',
                border: '1px solid var(--header-user-border)', cursor: 'pointer',
                transition: 'all 0.2s ease', minHeight: 38,
              }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 9, overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 1px rgba(255,255,255,0.12)' }}>
                <img src="/brand/app-icon.jpg" alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="hide-mobile" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--header-text)' }}>Admin</div>
                <div style={{ fontSize: 8.5, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>DIRECTOR</div>
              </div>
            </button>
          </div>
        </header>

        <main className="erp-content">
          <div key={activePage} className="page-enter" style={{ display: 'contents' }}>
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom bar ───────────────────────────── */}
      <nav className="mobile-bottom-nav no-print">
        {MOBILE_NAV.map(item => {
          const Icon = item.icon;
          const isActive = !item.isSidebarToggle && activePage === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => { if (item.isSidebarToggle) { setCollapsed(false); setMobileOpen(true); } else { navigate(item.id); } }}
            >
              <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {cmdkOpen && <CommandPalette onClose={() => setCmdkOpen(false)} onNavigate={navigate} />}
    </>
  );
};

export default HeaderSidebar;
