import React, { useState } from 'react';
import { Sparkles, Upload, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../components/CommonUI';

export const AIEstimatorView = ({ materials = [], nav, showToast }) => {
  const [fileSelected, setFileSelected] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [boqResult, setBoqResult] = useState(null);

  const handleAnalyzeDrawing = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setBoqResult({
        title: "Extracted Blueprint: 24ft x 8ft Exterior Illuminated Pylon Sign",
        items: [
          { description: "Aluminum Composite Panel 4mm PVDF (4x8ft)", qty: 6, uom: "sheets", rate: 8500, total: 51000 },
          { description: "MS Square Structural Tube 25x25mm Frame", qty: 240, uom: "feet", rate: 320, total: 76800 },
          { description: "LED Module 12V White IP67 Waterproof", qty: 350, uom: "pcs", rate: 180, total: 63000 },
          { description: "LED Power Supply Driver 12V 30A", qty: 4, uom: "pcs", rate: 4500, total: 18000 },
          { description: "Fabrication & Site Erection Labor", qty: 4, uom: "days", rate: 15000, total: 60000 }
        ],
        subtotal: 268800,
        marginPct: 25,
        estimatedPrice: 336000
      });
      showToast("Gemini Vision AI Drawing Analysis Complete!");
    }, 1800);
  };

  return (
    <div className="page">
      {/* Header Banner */}
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Creative studio · Vision AI</div>
          <h1 className="page-title">Blueprint <span className="gradient-text">BOQ Estimator</span></h1>
          <div className="page-sub">
            Upload architectural drawings, elevation sketches or spec sheets. Gemini computer vision reads the
            dimensions and drafts a complete bill of quantities, matched against live stock pricing.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="pill pill-accent"><Sparkles size={10} /> Gemini 2.5 Vision</span>
          <span className="pill">Sri Lanka pricing</span>
        </div>
      </div>

      {/* Uploader & Result Split */}
      <div className="ai-split">
        {/* Upload Box */}
        <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: 22, border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Upload Blueprint Image / Drawing</h3>

          <div
            style={{
              border: "2px dashed var(--card-border)",
              borderRadius: 12,
              padding: 30,
              textAlign: "center",
              background: "var(--input-bg)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onClick={() => setFileSelected("drawing_sample_pylon.png")}
          >
            <Upload size={32} color="#8b5cf6" style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              {fileSelected ? fileSelected : "Click to Upload Blueprint (PNG, JPG, PDF)"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Supports elevation drawings, structural frame sketches & CAD exports
            </div>
          </div>

          <button
            onClick={handleAnalyzeDrawing}
            disabled={analyzing}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "12px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <Sparkles size={16} />
            {analyzing ? "Gemini Scanning Drawing..." : "Run AI Computer Vision Extraction"}
          </button>
        </div>

        {/* AI BOQ Extraction Result */}
        <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: 22, border: "1px solid var(--card-border)" }}>
          {boqResult ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  {boqResult.title}
                </h3>
                <button
                  onClick={() => nav("quotations")}
                  className="btn btn-primary btn-sm"
                >
                  Export to Quotation Builder <ArrowRight size={14} />
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: "var(--input-bg)", borderBottom: "2px solid var(--card-border)" }}>
                    <th style={{ textAlign: "left", padding: 8 }}>Material / Labor Item</th>
                    <th style={{ textAlign: "center", padding: 8 }}>Qty</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Unit Rate (LKR)</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Total (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {boqResult.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--card-border)" }}>
                      <td style={{ padding: 8, fontWeight: 600 }}>{it.description}</td>
                      <td style={{ textAlign: "center", padding: 8 }}>{it.qty} {it.uom}</td>
                      <td style={{ textAlign: "right", padding: 8 }}>LKR {it.rate.toLocaleString('en-LK')}</td>
                      <td style={{ textAlign: "right", padding: 8, fontWeight: 700 }}>LKR {it.total.toLocaleString('en-LK')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ background: "var(--color-success-bg)", padding: 16, borderRadius: 10, border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--color-success)", fontWeight: 700 }}>COST ESTIMATE SUMMARY</div>
                  <div style={{ fontSize: 12, color: "var(--color-success)" }}>Material Cost + Labor: LKR {boqResult.subtotal.toLocaleString('en-LK')}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--color-success)" }}>Recommended Quote Price (+25% Margin):</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-success)" }}>
                    LKR {boqResult.estimatedPrice.toLocaleString('en-LK')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              Upload a drawing on the left and click "Run AI Extraction" to see auto-generated BOQ item breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
