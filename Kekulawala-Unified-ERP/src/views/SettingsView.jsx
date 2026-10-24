import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Image as ImageIcon, ShieldCheck, Save, Building2, Database,
  RefreshCw, Download, CheckCircle2, Palette, Sparkles, Droplets,
  Stamp, PenTool, Link2, Wand2, Globe2, Phone, Mail, MapPin, Landmark,
  Cloud, HardDrive, FileJson, Sun, Moon
} from 'lucide-react';
import { FormField, PageHeader, Segmented } from '../components/CommonUI';
import { useTheme, THEMES } from '../context/ThemeContext';
import { getDatabaseStats, seedDatabaseClientSide, exportDatabaseBackupJSON } from '../services/firebaseService';

/* ── Asset uploader with live preview ───────────────────── */
const AssetField = ({ label, value, onChange, hint, aspect = 4 }) => {
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const read = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="form-label">{label}</label>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        style={{
          position: 'relative',
          borderRadius: 14,
          border: `1.5px dashed ${drag ? 'var(--input-border-focus)' : 'var(--card-border)'}`,
          background: drag ? 'var(--sidebar-active-bg)' : 'var(--input-bg)',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: 62,
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => read(e.target.files[0])} />
        <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {value
            ? <img src={value} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} />
            : <ImageIcon size={17} color="var(--text-muted)" />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11.5, fontWeight: 650, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value ? 'Asset attached' : 'Drop image or click to upload'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {hint || 'PNG / JPG / SVG · transparent PNG recommended'}
          </div>
        </div>
        <Upload size={14} color="var(--text-accent)" style={{ flexShrink: 0 }} />
      </div>
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, sub, children, style }) => (
  <div className="card" style={{ padding: 20, ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--card-border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(56,189,248,0.10)', border: '1px solid rgba(94,234,212,0.16)', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        {sub && <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{sub}</div>}
      </div>
    </div>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════ */
export const SettingsView = ({ settings, setSettings, showToast }) => {
  const { themeId, setThemeId } = useTheme();
  const [form, setForm] = useState(settings || {});
  const [dbStats, setDbStats] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [tab, setTab] = useState('company');

  const loadStats = async () => {
    try { setDbStats(await getDatabaseStats()); } catch (err) { console.error(err); }
  };

  useEffect(() => { loadStats(); }, []);

  const handleSave = () => {
    setSettings(form);
    showToast('Company profile & brand assets saved to Firebase!');
  };

  const handleReseed = async () => {
    if (!window.confirm('Synchronize / seed master data into Firebase Firestore?')) return;
    setIsSyncing(true);
    try {
      await seedDatabaseClientSide();
      await loadStats();
      showToast('Firebase master database seeded & synchronized!');
    } catch (e) {
      showToast('Seeding failed: ' + e.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const dump = await exportDatabaseBackupJSON();
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kekulawala-erp-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Database backup downloaded successfully!');
    } catch (e) {
      showToast('Export failed: ' + e.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const field = (key, label, placeholder) => (
    <FormField label={label}>
      <input
        className="erp-input"
        placeholder={placeholder}
        value={form[key] || ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
      />
    </FormField>
  );

  return (
    <div className="page">
      <PageHeader
        eyebrow="Workspace · Configuration"
        icon={Wand2}
        title="Studio"
        highlight="Settings"
        subtitle="Corporate identity, print letterheads, stamps, watermarks and cloud synchronisation — all in one control room."
        actions={
          <>
            <Segmented
              value={tab}
              onChange={setTab}
              options={[{ id: 'company', label: 'Company' }, { id: 'brand', label: 'Brand & print' }, { id: 'cloud', label: 'Cloud' }]}
            />
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={15} /> Save changes
            </button>
          </>
        }
      />

      {/* Brand strip */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', padding: '18px 22px', position: 'relative', zIndex: 1 }}>
            <div className="page-eyebrow" style={{ marginBottom: 6 }}>Brand identity</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              {form.companyName || 'Kekulawala Advertising (Pvt) Ltd'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {form.address || 'Negombo Road, Makuladuwa, Kurunegala'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {form.phone || '071 71 94 371'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Mail size={11} /> {form.email || 'hello@kekulawala.lk'}</span>
            </div>
            <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="pill pill-accent"><ShieldCheck size={10} /> VAT {form.vatNumber || '114892014-7000'}</span>
              <span className="pill">Reg {form.regNumber || 'PV-00289143'}</span>
              <span className="pill">Since 1982</span>
            </div>
          </div>
          <div style={{ flex: '0 0 300px', minHeight: 128, background: '#061120', position: 'relative', overflow: 'hidden' }}>
            <img src="/brand/banner.png" alt="Kekulawala Advertising" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.95 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--card-bg-solid), transparent 55%)' }} />
          </div>
        </div>
      </div>

      {tab === 'company' && (
        <div className="split-2" style={{ alignItems: 'start' }}>
          <SectionCard icon={Building2} title="Corporate details" sub="Appears on every quotation, invoice, PO and letterhead">
            {field('companyName', 'Registered company name', 'Kekulawala Advertising (Pvt) Ltd')}
            <div className="split-2" style={{ gap: 12 }}>
              {field('regNumber', 'Company reg. number', 'PV-00289143')}
              {field('vatNumber', 'VAT reg. number', '114892014-7000')}
            </div>
            {field('address', 'Head office address', 'Negombo Road, Makuladuwa, Kurunegala')}
            <div className="split-2" style={{ gap: 12 }}>
              {field('phone', 'Telephone', '071 71 94 371')}
              {field('email', 'Official email', 'hello@kekulawala.lk')}
            </div>
            {field('website', 'Website', 'www.kekulawaladvertising.lk')}
          </SectionCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionCard icon={Landmark} title="Banking & payment" sub="Printed on invoices and advance-request letters">
              <div className="split-2" style={{ gap: 12 }}>
                {field('bankName', 'Bank', 'Bank of Ceylon')}
                {field('bankBranch', 'Branch', 'Kurunegala')}
              </div>
              <div className="split-2" style={{ gap: 12 }}>
                {field('bankAccount', 'Account number', '0071234567')}
                {field('bankSwift', 'SWIFT', 'BCEYLKLX')}
              </div>
              <div style={{ padding: '11px 13px', borderRadius: 12, background: 'var(--color-info-bg)', border: '1px solid rgba(56,189,248,0.18)', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                <Sparkles size={13} color="var(--text-accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                Gemini auto-fills these details into every generated document and validates the tax lines.
              </div>
            </SectionCard>

            <SectionCard icon={Palette} title="Appearance" sub="The interface adapts instantly across the whole workspace">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 9 }}>
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    style={{
                      padding: 9, borderRadius: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      border: `1.5px solid ${themeId === t.id ? 'rgba(94,234,212,0.5)' : 'var(--card-border)'}`,
                      background: themeId === t.id ? 'rgba(56,189,248,0.10)' : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ height: 34, borderRadius: 8, background: t.preview, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }} />
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-primary)', marginTop: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {t.dark ? <Moon size={9} /> : <Sun size={9} />} {t.name}
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === 'brand' && (
        <div className="split-2" style={{ alignItems: 'start' }}>
          <SectionCard icon={ImageIcon} title="Print letterhead assets" sub="Used by the A4 document & letterhead engine">
            <AssetField
              label="Top header banner"
              hint="Wide banner · printed above every document"
              value={form.headerImageUrl}
              onChange={v => setForm({ ...form, headerImageUrl: v })}
            />
            <div style={{ height: 12 }} />
            <AssetField
              label="Footer strip"
              hint="Bank details, certifications & branch addresses"
              value={form.footerImageUrl}
              onChange={v => setForm({ ...form, footerImageUrl: v })}
            />
          </SectionCard>

          <SectionCard icon={Droplets} title="Watermark, stamp & signature" sub="Brand marks layered over the printed page">
            <AssetField
              label="Centre watermark"
              hint="Sinhala / English logo · transparent PNG"
              value={form.watermarkImageUrl}
              onChange={v => setForm({ ...form, watermarkImageUrl: v })}
            />
            <div style={{ marginTop: 12, padding: '12px 13px', borderRadius: 13, background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Droplets size={11} /> Watermark opacity
                </span>
                <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-accent)' }}>
                  {((form.watermarkOpacity || 0.12) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range" min="0.02" max="0.4" step="0.01"
                value={form.watermarkOpacity || 0.12}
                onChange={e => setForm({ ...form, watermarkOpacity: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#22d3ee' }}
              />
            </div>
            <div style={{ height: 12 }} />
            <div className="split-2" style={{ gap: 12 }}>
              <AssetField label="Rubber stamp" hint="Official seal" value={form.stampImageUrl} onChange={v => setForm({ ...form, stampImageUrl: v })} />
              <AssetField label="Signature" hint="Authorised signatory" value={form.signatureImageUrl} onChange={v => setForm({ ...form, signatureImageUrl: v })} />
            </div>
          </SectionCard>

          <SectionCard icon={Wand2} title="Brand library" sub="Assets bundled with the workspace — click to attach" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { name: 'Company logo', src: '/brand/company-logo.png', target: 'headerImageUrl', icon: ImageIcon },
                { name: 'Sinhala watermark', src: '/brand/watermark-sinhala.png', target: 'watermarkImageUrl', icon: Droplets },
                { name: 'Banner lockup', src: '/brand/banner.png', target: 'footerImageUrl', icon: Stamp },
                { name: 'App mark', src: '/brand/app-icon.jpg', target: 'stampImageUrl', icon: ShieldCheck },
              ].map(a => (
                <button
                  key={a.name}
                  onClick={() => setForm(f => ({ ...f, [a.target]: a.src }))}
                  style={{
                    border: '1px solid var(--card-border)', borderRadius: 14, overflow: 'hidden',
                    background: 'var(--input-bg)', cursor: 'pointer', padding: 0, textAlign: 'left',
                    transition: 'all 0.25s ease', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--card-border-strong)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
                >
                  <div style={{ height: 82, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                    <img src={a.src} alt={a.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: '9px 11px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <a.icon size={12} color="var(--text-accent)" />
                    <span style={{ fontSize: 11, fontWeight: 650, color: 'var(--text-primary)' }}>{a.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === 'cloud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -30, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.24), transparent 70%)', filter: 'blur(28px)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(56,189,248,0.16))', border: '1px solid rgba(94,234,212,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <Cloud size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 750, color: 'var(--text-primary)' }}>Firebase Cloud Firestore</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Project <strong style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>kekulawala-erp</strong> · realtime listeners active
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="pill" style={{ background: 'var(--color-success-bg)', borderColor: 'rgba(52,211,153,0.28)', color: 'var(--color-success)' }}>
                  <span className="live-dot" style={{ width: 5, height: 5 }} /> Connected & live
                </span>
                <button className="btn btn-secondary btn-sm" onClick={handleReseed} disabled={isSyncing}>
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Syncing…' : 'Reseed catalog'}
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleExportBackup} disabled={isExporting}>
                  <Download size={12} /> {isExporting ? 'Exporting…' : 'JSON backup'}
                </button>
              </div>
            </div>

            {dbStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 9, marginTop: 16, position: 'relative' }}>
                {Object.entries(dbStats).map(([key, count]) => (
                  <div key={key} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.035)', border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{key}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginTop: 2 }}>
                      {count}<span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginLeft: 3 }}>docs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="split-3">
            {[
              { icon: HardDrive, title: 'Master backend', value: 'Port 5000', sub: 'Express REST + static assets' },
              { icon: Database, title: 'Collections', value: '16', sub: 'Clients · projects · ledgers' },
              { icon: FileJson, title: 'Backup format', value: 'JSON', sub: 'One-click full export' },
              { icon: Globe2, title: 'Hosting', value: 'Firebase', sub: 'Global CDN delivery' },
            ].map(c => (
              <div key={c.title} className="card hover-lift" style={{ padding: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(56,189,248,0.10)', border: '1px solid rgba(94,234,212,0.16)', color: 'var(--text-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <c.icon size={15} />
                </div>
                <div className="card-label" style={{ fontSize: 8.5 }}>{c.title}</div>
                <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginTop: 2 }}>{c.value}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating save on mobile */}
      <div className="show-mobile-only" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave}><Save size={15} /> Save changes</button>
      </div>
    </div>
  );
};

export default SettingsView;
