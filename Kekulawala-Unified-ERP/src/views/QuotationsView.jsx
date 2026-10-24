import React, { useState } from 'react';
import { FileText, Plus, Printer, Trash2, Check, Sparkles } from 'lucide-react';
import { LetterheadCanvas } from '../components/LetterheadCanvas';
import { Badge, FormField, Modal } from '../components/CommonUI';

export const QuotationsView = ({
  quotations = [],
  setQuotations,
  clients = [],
  materials = [],
  companySettings,
  showToast,
  nav
}) => {
  const [selectedQuote, setSelectedQuote] = useState(quotations[0] || null);
  const [showNewModal, setShowNewModal] = useState(false);

  const LKR = (n) => "LKR " + Number(n).toLocaleString("en-LK", { minimumFractionDigits: 2 });

  return (
    <div className="page">
      {/* Header Bar */}
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Creative studio · Estimation</div>
          <h1 className="page-title">Quotation &amp; <span className="gradient-text">BOQ Studio</span></h1>
          <div className="page-sub">Compose, price and print official quotations on your custom letterhead.</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => nav("ai_estimator")}
            className="btn btn-secondary"
          >
            <Sparkles size={16} />
            Gemini AI Blueprint Estimator
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            New Quotation
          </button>
        </div>
      </div>

      {/* Split Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* Left List */}
        <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: 16, border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: 10, height: "calc(100vh - 180px)", overflowY: "auto" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Quotations ({quotations.length})</h3>
          {quotations.map((q) => {
            const isSel = selectedQuote?.id === q.id;
            return (
              <div
                key={q.id}
                onClick={() => setSelectedQuote(q)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: `1.5px solid ${isSel ? "rgba(94,234,212,0.5)" : "var(--card-border)"}`,
                  background: isSel ? "rgba(56,189,248,0.12)" : "transparent",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-sky)" }}>{q.code}</span>
                  <Badge status={q.status} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{q.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{q.clientName}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-success)", marginTop: 6, textAlign: "right" }}>
                  {LKR(q.grandTotal)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Printable Canvas Preview */}
        <div>
          {selectedQuote ? (
            <LetterheadCanvas
              settings={companySettings}
              docTitle="OFFICIAL QUOTATION & BOQ"
              docNumber={selectedQuote.code}
              docDate={selectedQuote.date}
              clientName={selectedQuote.clientName}
            >
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                Subject: {selectedQuote.title}
              </h3>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "var(--input-bg)", borderBottom: "2px solid #0f172a" }}>
                    <th style={{ textAlign: "left", padding: 8 }}>Item Description</th>
                    <th style={{ textAlign: "center", padding: 8 }}>Qty</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Rate</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Total (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuote.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--card-border)" }}>
                      <td style={{ padding: 8 }}>{it.description}</td>
                      <td style={{ textAlign: "center", padding: 8 }}>{it.qty} {it.uom}</td>
                      <td style={{ textAlign: "right", padding: 8 }}>LKR {it.unitRate.toLocaleString('en-LK')}</td>
                      <td style={{ textAlign: "right", padding: 8, fontWeight: 700 }}>LKR {it.total.toLocaleString('en-LK')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <div style={{ width: 260, fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Subtotal:</span>
                    <span>{LKR(selectedQuote.subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                    <span>VAT (18% Applicable):</span>
                    <span>{LKR(selectedQuote.tax)}</span>
                  </div>
                  <div style={{ borderTop: "2px solid #0f172a", pt: 6, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>
                    <span>Grand Total:</span>
                    <span>{LKR(selectedQuote.grandTotal)}</span>
                  </div>
                </div>
              </div>
            </LetterheadCanvas>
          ) : (
            <div style={{ background: "var(--card-bg)", padding: 40, borderRadius: 14, textAlign: "center", color: "var(--text-muted)" }}>
              Select a quotation to preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
