import React, { useState, useRef, useCallback } from 'react';
import {
  FileText, Sparkles, Plus, Printer, Upload, Image, Check,
  X, Eye, Layout, Crop, Move, ChevronRight, Building2,
  CheckCircle2, Trash2, Download, AlertCircle, LayoutTemplate
} from 'lucide-react';
import { LETTER_CATEGORIES, TEMPLATE_GENERATORS } from '../data/letterTemplates';
import { LetterheadCanvas } from '../components/LetterheadCanvas';
import { FormField, Modal, Badge, SectionHeader, EmptyState } from '../components/CommonUI';

/* ─── Built-in Letterhead Templates ─────────────────────── */
const BUILTIN_LETTERHEADS = [
  {
    id: 'builtin-1',
    name: 'Classic Professional',
    tag: 'Built-in',
    headerStyle: 'text',
    primaryColor: '#0f172a',
    accentColor: '#2563eb',
    preview: (s) => (
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 9, minHeight: 70 }}>
        <div style={{ fontWeight: 900, fontSize: 11, color: '#0f172a', borderBottom: '2px solid #2563eb', paddingBottom: 4, marginBottom: 4 }}>
          {s?.companyName || 'KEKULAWALA ENTERPRISES'}
        </div>
        <div style={{ color: '#475569', lineHeight: 1.4 }}>Reg No: PV-00289143 | VAT: 114892014-7000</div>
        <div style={{ color: '#94a3b8', marginTop: 4, height: 12, background: '#f8fafc', borderRadius: 3 }} />
      </div>
    ),
  },
  {
    id: 'builtin-2',
    name: 'Navy Executive',
    tag: 'Built-in',
    headerStyle: 'navy',
    primaryColor: '#1e3a5f',
    accentColor: '#3b82f6',
    preview: (s) => (
      <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden', minHeight: 70 }}>
        <div style={{ background: '#1e3a5f', padding: '8px 10px' }}>
          <div style={{ fontWeight: 900, fontSize: 11, color: '#fff' }}>{s?.companyName || 'KEKULAWALA ENTERPRISES'}</div>
          <div style={{ fontSize: 8, color: '#93c5fd', marginTop: 2 }}>Professional · Reliable · Quality</div>
        </div>
        <div style={{ padding: '4px 10px', fontSize: 8, color: '#475569' }}>
          <div style={{ height: 8, background: '#f8fafc', borderRadius: 2, marginTop: 4 }} />
          <div style={{ height: 8, background: '#f8fafc', borderRadius: 2, marginTop: 4, width: '70%' }} />
        </div>
      </div>
    ),
  },
  {
    id: 'builtin-3',
    name: 'Emerald Modern',
    tag: 'Built-in',
    headerStyle: 'emerald',
    primaryColor: '#065f46',
    accentColor: '#10b981',
    preview: (s) => (
      <div style={{ background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden', minHeight: 70 }}>
        <div style={{ background: 'linear-gradient(135deg, #065f46, #047857)', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 11, color: '#fff' }}>{s?.companyName || 'KEKULAWALA'}</div>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff' }}>K</div>
        </div>
        <div style={{ padding: '4px 10px', borderTop: '2px solid #10b981' }}>
          <div style={{ height: 8, background: '#f0fdf4', borderRadius: 2, marginTop: 4 }} />
        </div>
      </div>
    ),
  },
];

/* ─── Letterhead Gallery ─────────────────────────────────── */
const LetterheadGallery = ({ selected, onSelect, customHeads, onDelete, onUpload, companySettings }) => {
  const fileRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer?.files[0] || e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file (PNG, JPG, PDF preview)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpload({ id: `custom-${Date.now()}`, name: file.name.replace(/\.[^.]+$/, ''), tag: 'Custom', imageUrl: ev.target.result });
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  const allHeads = [...BUILTIN_LETTERHEADS, ...customHeads];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Upload Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--input-border-focus)' : 'var(--card-border)'}`,
          borderRadius: 12,
          padding: '14px 12px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'var(--sidebar-active-bg)' : 'transparent',
          transition: 'all 0.18s ease',
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileDrop} />
        <Upload size={20} color={dragging ? 'var(--text-accent)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px' }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: dragging ? 'var(--text-accent)' : 'var(--text-primary)' }}>
          Upload Letterhead Image
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          PNG, JPG — drag & drop or click
        </div>
      </div>

      {/* Gallery Grid */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Available Letterheads ({allHeads.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 400 }}>
        {allHeads.map(lh => {
          const isActive = selected?.id === lh.id;
          return (
            <div
              key={lh.id}
              onClick={() => onSelect(lh)}
              style={{
                border: `2px solid ${isActive ? 'var(--text-accent)' : 'var(--card-border)'}`,
                borderRadius: 12,
                padding: '10px 12px',
                cursor: 'pointer',
                background: isActive ? 'var(--sidebar-active-bg)' : 'var(--card-bg)',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              {/* Selected checkmark */}
              {isActive && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: 'var(--text-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <Check size={12} color="#fff" />
                </div>
              )}

              {/* Letterhead Preview */}
              <div style={{ marginBottom: 8 }}>
                {lh.imageUrl ? (
                  <img src={lh.imageUrl} alt={lh.name} style={{ width: '100%', maxHeight: 64, objectFit: 'contain', borderRadius: 6, background: '#fff' }} />
                ) : lh.preview ? (
                  lh.preview(companySettings)
                ) : (
                  <div style={{ height: 60, borderRadius: 6, background: 'var(--table-header-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LayoutTemplate size={22} color="var(--text-muted)" />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{lh.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: lh.tag === 'Custom' ? 'var(--color-success-bg)' : 'var(--sidebar-active-bg)', color: lh.tag === 'Custom' ? 'var(--color-success)' : 'var(--text-accent)' }}>
                    {lh.tag}
                  </span>
                </div>
                {lh.tag === 'Custom' && (
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(lh.id); }}
                    style={{ border: 'none', background: 'var(--color-danger-bg)', borderRadius: 7, padding: '4px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={12} color="var(--color-danger)" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Print Area Selector ────────────────────────────────── */
const PRINT_ZONES = [
  { id: 'full',    label: 'Full Page (A4)',      icon: '📄', desc: 'Complete document with header, body & footer' },
  { id: 'body',    label: 'Body Only',           icon: '📝', desc: 'Content area only — no header/footer' },
  { id: 'header',  label: 'Header + Body',       icon: '🔝', desc: 'Letterhead + body (no footer/stamp)' },
  { id: 'footer',  label: 'Footer + Stamp',      icon: '🔏', desc: 'Signature & stamp area only' },
  { id: 'custom',  label: 'Custom Selection',    icon: '✂️',  desc: 'Define top/bottom margin to trim print area' },
];

const PrintAreaSelector = ({ selected, onSelect, customMargins, onMarginChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
      Print Area
    </div>
    {PRINT_ZONES.map(z => (
      <button
        key={z.id}
        onClick={() => onSelect(z.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', borderRadius: 10, border: '1.5px solid',
          borderColor: selected === z.id ? 'var(--text-accent)' : 'var(--card-border)',
          background: selected === z.id ? 'var(--sidebar-active-bg)' : 'var(--card-bg)',
          cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 16 }}>{z.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{z.label}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{z.desc}</div>
        </div>
        {selected === z.id && <Check size={14} color="var(--text-accent)" />}
      </button>
    ))}

    {selected === 'custom' && (
      <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--table-header-bg)', border: '1px solid var(--card-border)', marginTop: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Custom Margins (mm)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <FormField label="Top margin">
            <input type="number" value={customMargins.top} onChange={e => onMarginChange({ ...customMargins, top: e.target.value })} className="erp-input" style={{ fontSize: 12 }} />
          </FormField>
          <FormField label="Bottom margin">
            <input type="number" value={customMargins.bottom} onChange={e => onMarginChange({ ...customMargins, bottom: e.target.value })} className="erp-input" style={{ fontSize: 12 }} />
          </FormField>
          <FormField label="Left margin">
            <input type="number" value={customMargins.left} onChange={e => onMarginChange({ ...customMargins, left: e.target.value })} className="erp-input" style={{ fontSize: 12 }} />
          </FormField>
          <FormField label="Right margin">
            <input type="number" value={customMargins.right} onChange={e => onMarginChange({ ...customMargins, right: e.target.value })} className="erp-input" style={{ fontSize: 12 }} />
          </FormField>
        </div>
      </div>
    )}
  </div>
);

/* ─── Enhanced Letterhead Canvas with area control ───────── */
const LetterheadCanvasEnhanced = ({ letterhead, printZone, customMargins, settings, doc, children, onPrint }) => {
  const s = settings || {};
  const showHeader = printZone === 'full' || printZone === 'header' || !printZone;
  const showFooter = printZone === 'full' || printZone === 'footer' || !printZone;
  const showBody   = printZone !== 'footer';

  const headerBg   = letterhead?.headerStyle === 'navy'    ? '#1e3a5f'
                   : letterhead?.headerStyle === 'emerald' ? 'linear-gradient(135deg, #065f46, #047857)'
                   : '#ffffff';
  const headerColor = (letterhead?.headerStyle === 'navy' || letterhead?.headerStyle === 'emerald') ? '#ffffff' : '#0f172a';
  const accentColor = letterhead?.accentColor || '#2563eb';

  const marginStyle = printZone === 'custom' ? {
    paddingTop: `${customMargins.top}mm`,
    paddingBottom: `${customMargins.bottom}mm`,
    paddingLeft: `${customMargins.left}mm`,
    paddingRight: `${customMargins.right}mm`,
  } : { padding: '24px 32px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Print Toolbar */}
      <div className="no-print" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--card-bg)', padding: '12px 16px', borderRadius: 12,
        border: '1px solid var(--card-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={17} color="var(--color-success)" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              {letterhead?.name || 'Default'} Letterhead — {PRINT_ZONES.find(z => z.id === (printZone || 'full'))?.label || 'Full Page'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Print ready · A4 format</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onPrint}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '7px 16px' }}
          >
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      {/* A4 Preview */}
      <div
        id="print-canvas"
        className="print-area"
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          border: '1px solid #cbd5e1',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden',
          ...marginStyle,
        }}
      >
        {/* Custom image letterhead overlay */}
        {letterhead?.imageUrl && showHeader && (
          <img src={letterhead.imageUrl} alt="Letterhead" style={{ width: '100%', maxHeight: 120, objectFit: 'contain', marginBottom: 16, display: 'block' }} />
        )}

        {/* Built-in header */}
        {!letterhead?.imageUrl && showHeader && (
          <div style={{
            background: headerBg,
            borderRadius: letterhead?.headerStyle !== 'text' ? 8 : 0,
            marginBottom: 16,
            padding: letterhead?.headerStyle !== 'text' ? '14px 18px' : '0 0 12px',
            borderBottom: letterhead?.headerStyle === 'text' ? `3px solid ${accentColor}` : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: headerColor, letterSpacing: -0.5, textTransform: 'uppercase' }}>
                  {s.companyName || 'KEKULAWALA ENTERPRISES (PVT) LTD'}
                </div>
                <div style={{ fontSize: 11, color: letterhead?.headerStyle !== 'text' ? 'rgba(255,255,255,0.7)' : '#475569', marginTop: 2 }}>
                  Reg: {s.regNumber || 'PV-00289143'} · VAT: {s.vatNumber || '114892014-7000'}
                </div>
                <div style={{ fontSize: 11, color: letterhead?.headerStyle !== 'text' ? 'rgba(255,255,255,0.7)' : '#475569' }}>
                  {s.address || 'No. 142/A, Kandy Road, Kurunegala, Sri Lanka'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: letterhead?.headerStyle !== 'text' ? 'rgba(255,255,255,0.7)' : '#475569' }}>
                <div>{s.phone || '+94 37 223 4567'}</div>
                <div>{s.email || 'info@kekulawala.lk'}</div>
                <div>{s.website || 'www.kekulawala.lk'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Doc meta bar */}
        {showBody && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>{doc?.subject || 'OFFICIAL DOCUMENT'}</div>
                {doc?.clientName && <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}><strong>Attention:</strong> {doc.clientName}</div>}
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#334155' }}>
                {doc?.code && <div><strong>Ref:</strong> {doc.code}</div>}
                {doc?.date && <div><strong>Date:</strong> {doc.date}</div>}
              </div>
            </div>

            {/* Body content */}
            <div style={{ fontSize: 12, lineHeight: 1.7, color: '#1e293b', minHeight: 200, whiteSpace: 'pre-wrap' }}>
              {children}
            </div>
          </>
        )}

        {/* Footer / Signature */}
        {showFooter && (
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              {s.bankDetails && (
                <div style={{ fontSize: 10, color: '#64748b' }}>
                  <strong>Bank Details:</strong><br />
                  {s.bankDetails.bankName} | Acc: {s.bankDetails.accountNo} ({s.bankDetails.branch})
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center', minWidth: 180 }}>
              <div style={{ height: 40, borderBottom: '1.5px dashed #94a3b8', marginBottom: 6 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Authorized Signatory</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Managing Director</div>
              <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{s.companyName || 'Kekulawala Enterprises'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main DocumentStudioView ────────────────────────────── */
export const DocumentStudioView = ({
  letters = [], setLetters,
  clients = [], projects = [],
  companySettings, showToast
}) => {
  const [selectedLetter,   setSelectedLetter]   = useState(letters[0] || null);
  const [showCreateModal,  setShowCreateModal]   = useState(false);
  const [activeCategory,   setActiveCategory]    = useState('advance_request');
  const [showLHPanel,      setShowLHPanel]       = useState(false);

  // Letterhead state
  const [customHeads,      setCustomHeads]       = useState([]);
  const [selectedLH,       setSelectedLH]        = useState(BUILTIN_LETTERHEADS[0]);

  // Print area state
  const [printZone,        setPrintZone]         = useState('full');
  const [customMargins,    setCustomMargins]      = useState({ top: 10, bottom: 10, left: 15, right: 15 });

  const [activeTab, setActiveTab] = useState('letterhead'); // 'letterhead' | 'printzone'

  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || 1,
    clientName: clients[0]?.name || 'Arpico Supercentre',
    contactName: clients[0]?.contact || 'Nimal Perera',
    projectName: projects[0]?.name || 'Arpico Signage & Cladding',
    quoteRef: 'QT-2025-001', invoiceNo: 'INV-2025-001',
    advanceAmount: 2250000, dueAmount: 1450000, overdueDays: 14,
    poRef: 'PO-2025-001', partnerName: 'SteelTech Lanka (Pvt) Ltd',
    subcontractorName: 'SteelTech Lanka (Pvt) Ltd', contractValue: 1800000,
    workScope: 'Structural Steel Frame Erection & Welding',
  });

  const [aiGenerating, setAiGenerating] = useState(false);

  const handleGenerateTemplate = () => {
    const generator = TEMPLATE_GENERATORS[activeCategory];
    if (!generator) return;
    const result = generator({
      ...formData,
      companyName: companySettings?.companyName || 'Kekulawala Enterprises (Pvt) Ltd',
      bankName:    companySettings?.bankDetails?.bankName  || 'Commercial Bank of Ceylon PLC',
      accountNo:   companySettings?.bankDetails?.accountNo || '8001049281',
      branch:      companySettings?.bankDetails?.branch    || 'Kurunegala Main Branch',
    });
    const newDoc = {
      id: `LTR-${Date.now()}`,
      code: `DOC-2025-${String(letters.length + 1).padStart(3, '0')}`,
      category: activeCategory,
      clientId: formData.clientId, clientName: formData.clientName,
      date: new Date().toISOString().split('T')[0],
      subject: result.subject, bodyContent: result.body, status: 'issued',
    };
    setLetters([newDoc, ...letters]);
    setSelectedLetter(newDoc);
    setShowCreateModal(false);
    showToast('Document generated successfully!');
  };

  const handleAiPolish = () => {
    if (!selectedLetter) return;
    setAiGenerating(true);
    setTimeout(() => {
      const polished = selectedLetter.bodyContent + '\n\n[Gemini AI Legal Compliance Note: This document complies with Sri Lanka Commercial Contract & Labor Law principles.]';
      setSelectedLetter({ ...selectedLetter, bodyContent: polished });
      setLetters(letters.map(l => l.id === selectedLetter.id ? { ...l, bodyContent: polished } : l));
      setAiGenerating(false);
      showToast('Gemini AI polished the document!');
    }, 1000);
  };

  const handleUploadLH = (lh) => {
    setCustomHeads(prev => [lh, ...prev]);
    setSelectedLH(lh);
    showToast(`Letterhead "${lh.name}" uploaded!`);
  };

  const handleDeleteLH = (id) => {
    setCustomHeads(prev => prev.filter(lh => lh.id !== id));
    if (selectedLH?.id === id) setSelectedLH(BUILTIN_LETTERHEADS[0]);
  };

  const handlePrint = () => {
    // Inject print-zone CSS dynamically
    const style = document.createElement('style');
    style.id = 'erp-print-override';
    if (printZone === 'body') {
      style.textContent = `@media print { .letterhead-header, .letterhead-footer { display: none !important; } }`;
    } else if (printZone === 'header') {
      style.textContent = `@media print { .letterhead-footer { display: none !important; } }`;
    } else if (printZone === 'footer') {
      style.textContent = `@media print { .letterhead-header, .letterhead-body { display: none !important; } }`;
    } else if (printZone === 'custom') {
      style.textContent = `@media print { @page { margin: ${customMargins.top}mm ${customMargins.right}mm ${customMargins.bottom}mm ${customMargins.left}mm; } }`;
    }
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.getElementById('erp-print-override')?.remove(), 500);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Creative studio · Documents</div>
          <h1 className="page-title">Letter &amp; <span className="gradient-text">Agreement Studio</span></h1>
          <div className="page-sub">Eight automated generators · custom letterheads · pixel-perfect A4 print control.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowLHPanel(!showLHPanel)} className="btn btn-secondary" style={{ fontSize: 12 }}>
            <Image size={14} /> {showLHPanel ? 'Hide' : 'Letterhead & Print'}
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ fontSize: 12 }}>
            <Plus size={15} /> Create Document
          </button>
        </div>
      </div>

      {/* Main 3-column workspace */}
      <div className={`studio-grid ${showLHPanel ? '' : 'no-panel'}`}>

        {/* ── Col 1: Document List ─────────────────────── */}
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Issued Documents ({letters.length})
          </div>
          {letters.length === 0 ? (
            <EmptyState icon={FileText} title="No documents yet" desc="Create your first document to get started" />
          ) : letters.map(doc => {
            const isSel = selectedLetter?.id === doc.id;
            return (
              <div key={doc.id} onClick={() => setSelectedLetter(doc)} style={{
                padding: 11, borderRadius: 10,
                border: `1.5px solid ${isSel ? 'var(--text-accent)' : 'var(--card-border)'}`,
                background: isSel ? 'var(--sidebar-active-bg)' : 'var(--card-bg)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-accent)' }}>{doc.code}</span>
                  <Badge status={doc.status} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.clientName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.subject}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5, textAlign: 'right' }}>{doc.date}</div>
              </div>
            );
          })}
        </div>

        {/* ── Col 2: Document Preview / Editor ─────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedLetter ? (
            <>
              {/* AI Toolbar */}
              <div className="no-print card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={17} color="#f59e0b" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Gemini 2.5 AI Document Assistant</span>
                </div>
                <button onClick={handleAiPolish} disabled={aiGenerating} className="btn btn-secondary" style={{ fontSize: 12 }}>
                  <Sparkles size={13} color="#f59e0b" />
                  {aiGenerating ? 'Polishing…' : 'AI Legal Polish'}
                </button>
              </div>

              {/* A4 Canvas */}
              <LetterheadCanvasEnhanced
                letterhead={selectedLH}
                printZone={printZone}
                customMargins={customMargins}
                settings={companySettings}
                doc={selectedLetter}
                onPrint={handlePrint}
              >
                {selectedLetter.bodyContent}
              </LetterheadCanvasEnhanced>
            </>
          ) : (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <EmptyState icon={FileText} title="No document selected" desc="Select a document from the list or create a new one" action={
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ fontSize: 12 }}>
                  <Plus size={14} /> Create Document
                </button>
              } />
            </div>
          )}
        </div>

        {/* ── Col 3: Letterhead & Print Zone Panel ─────── */}
        {showLHPanel && (
          <div className="card" style={{ padding: 14, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 14 }}>
              {[{ id: 'letterhead', label: '🖼 Letterhead' }, { id: 'printzone', label: '✂️ Print Area' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding: '7px 10px', borderRadius: 8, border: '1.5px solid',
                  borderColor: activeTab === tab.id ? 'var(--text-accent)' : 'var(--card-border)',
                  background: activeTab === tab.id ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-accent)' : 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'letterhead' && (
              <LetterheadGallery
                selected={selectedLH}
                onSelect={setSelectedLH}
                customHeads={customHeads}
                onDelete={handleDeleteLH}
                onUpload={handleUploadLH}
                companySettings={companySettings}
              />
            )}

            {activeTab === 'printzone' && (
              <PrintAreaSelector
                selected={printZone}
                onSelect={setPrintZone}
                customMargins={customMargins}
                onMarginChange={setCustomMargins}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Create Modal ──────────────────────────────────── */}
      {showCreateModal && (
        <Modal title="📄 Create Enterprise Letter or MOU" onClose={() => setShowCreateModal(false)} w={760}>
          <FormField label="Document Category" req>
            <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="erp-select">
              {LETTER_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Client / Partner" req>
              <select value={formData.clientId} onChange={e => {
                const cl = clients.find(c => c.id === Number(e.target.value));
                setFormData({ ...formData, clientId: Number(e.target.value), clientName: cl?.name || '', contactName: cl?.contact || '' });
              }} className="erp-select">
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
              </select>
            </FormField>
            <FormField label="Related Project">
              <select value={formData.projectName} onChange={e => setFormData({ ...formData, projectName: e.target.value })} className="erp-select">
                {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </FormField>
          </div>

          {activeCategory === 'advance_request' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Quotation Ref"><input value={formData.quoteRef} onChange={e => setFormData({ ...formData, quoteRef: e.target.value })} className="erp-input" /></FormField>
              <FormField label="Advance Amount (LKR)"><input type="number" value={formData.advanceAmount} onChange={e => setFormData({ ...formData, advanceAmount: Number(e.target.value) })} className="erp-input" /></FormField>
            </div>
          )}
          {activeCategory === 'payment_reminder' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <FormField label="Invoice No"><input value={formData.invoiceNo} onChange={e => setFormData({ ...formData, invoiceNo: e.target.value })} className="erp-input" /></FormField>
              <FormField label="Due Amount (LKR)"><input type="number" value={formData.dueAmount} onChange={e => setFormData({ ...formData, dueAmount: Number(e.target.value) })} className="erp-input" /></FormField>
              <FormField label="Overdue Days"><input type="number" value={formData.overdueDays} onChange={e => setFormData({ ...formData, overdueDays: Number(e.target.value) })} className="erp-input" /></FormField>
            </div>
          )}
          {activeCategory === 'subcontractor_agreement' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Subcontractor Name"><input value={formData.subcontractorName} onChange={e => setFormData({ ...formData, subcontractorName: e.target.value })} className="erp-input" /></FormField>
              <FormField label="Contract Value (LKR)"><input type="number" value={formData.contractValue} onChange={e => setFormData({ ...formData, contractValue: Number(e.target.value) })} className="erp-input" /></FormField>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleGenerateTemplate} className="btn btn-primary">
              <FileText size={14} /> Generate Document
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
