import React, { useState } from 'react';
import {
  CreditCard, Printer, Download, ChevronDown, ChevronUp,
  DollarSign, Users, TrendingDown, Calculator
} from 'lucide-react';
import { Modal, StatCard } from '../components/CommonUI';

const LKR = (n) => 'LKR ' + Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 });

// Sri Lanka APIT Tax Bands (2024/25 Annual)
const calcAPIT = (annualSalary) => {
  if (annualSalary <= 1200000) return 0;
  if (annualSalary <= 1700000) return (annualSalary - 1200000) * 0.06;
  if (annualSalary <= 2500000) return 30000 + (annualSalary - 1700000) * 0.12;
  if (annualSalary <= 3500000) return 126000 + (annualSalary - 2500000) * 0.18;
  if (annualSalary <= 5000000) return 306000 + (annualSalary - 3500000) * 0.24;
  if (annualSalary <= 8000000) return 666000 + (annualSalary - 5000000) * 0.30;
  return 1566000 + (annualSalary - 8000000) * 0.36;
};

export const PayrollView = ({ employees = [], showToast }) => {
  const [payMonth, setPayMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [expandedId, setExpandedId] = useState(null);
  const [showSlip, setShowSlip] = useState(null);
  const [otData, setOtData] = useState({}); // empId: { otHours, allowances, deductions }

  const activeEmployees = employees.filter(e => e.pool === 'employee');

  const getOT = (id) => otData[id] || { otHours: 0, allowances: 0, deductions: 0 };
  const setOT = (id, field, val) => setOtData(prev => ({ ...prev, [id]: { ...getOT(id), [field]: Number(val) } }));

  const calcPayslip = (emp) => {
    const basic = Number(emp.salary) || 0;
    const ot = getOT(emp.id);
    const hourlyRate = basic / 22 / 8; // 22 working days, 8 hours
    const otPay = Math.round(hourlyRate * 1.5 * Number(ot.otHours || 0));
    const allowances = Number(ot.allowances || 0);
    const grossSalary = basic + otPay + allowances;

    const epfEmp = Math.round(grossSalary * 0.08); // 8% employee contribution
    const epfEr = Math.round(grossSalary * 0.12); // 12% employer contribution
    const etf = Math.round(grossSalary * 0.03); // 3% ETF employer
    const annualGross = grossSalary * 12;
    const apitAnnual = calcAPIT(annualGross);
    const apitMonthly = Math.round(apitAnnual / 12);
    const otherDeductions = Number(ot.deductions || 0);

    const totalDeductions = epfEmp + apitMonthly + otherDeductions;
    const netSalary = grossSalary - totalDeductions;

    return { basic, otPay, allowances, grossSalary, epfEmp, epfEr, etf, apitMonthly, otherDeductions, totalDeductions, netSalary, otHours: ot.otHours || 0 };
  };

  const totalGross = activeEmployees.reduce((s, e) => s + calcPayslip(e).grossSalary, 0);
  const totalNet = activeEmployees.reduce((s, e) => s + calcPayslip(e).netSalary, 0);
  const totalEPFEr = activeEmployees.reduce((s, e) => s + calcPayslip(e).epfEr, 0);
  const totalETF = activeEmployees.reduce((s, e) => s + calcPayslip(e).etf, 0);

  const [payMonth_disp] = (() => {
    const d = new Date(payMonth + '-01');
    return [d.toLocaleString('en-LK', { month: 'long', year: 'numeric' })];
  })();

  const PrintSlip = ({ emp, ps }) => (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 32, color: 'var(--text-primary)', maxWidth: 600 }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>KEKULAWALA ENTERPRISES (PVT) LTD</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No. 142/A, Kandy Road, Kurunegala, Sri Lanka</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>SALARY SLIP — {payMonth_disp}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 16 }}>
        <div><strong>Employee:</strong> {emp.name}</div>
        <div><strong>Code:</strong> {emp.code}</div>
        <div><strong>Designation:</strong> {emp.desg}</div>
        <div><strong>Department:</strong> {emp.dept}</div>
        {emp.epf && <div><strong>EPF No:</strong> {emp.epf}</div>}
        <div><strong>Bank A/C:</strong> {emp.bankAcc || 'N/A'}</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--input-bg)' }}>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--card-border)' }}>Earnings</th>
            <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '1px solid var(--card-border)' }}>Amount (LKR)</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--card-border)', paddingLeft: 20 }}>Deductions</th>
            <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '1px solid var(--card-border)' }}>Amount (LKR)</th>
          </tr>
        </thead>
        <tbody>
          {[
            [['Basic Salary', ps.basic], ['EPF (8%)', ps.epfEmp]],
            [['OT Pay (1.5x)', ps.otPay], ['APIT Tax', ps.apitMonthly]],
            [['Allowances', ps.allowances], ['Other Deductions', ps.otherDeductions]],
          ].map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
              {row.map(([label, val], j) => (<>
                <td key={`l${j}`} style={{ padding: '6px 10px', ...(j === 1 ? { paddingLeft: 20 } : {}) }}>{label}</td>
                <td key={`v${j}`} style={{ padding: '6px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{Number(val).toLocaleString()}</td>
              </>))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #0f172a', fontWeight: 700 }}>
            <td style={{ padding: '10px 10px' }}>GROSS SALARY</td>
            <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--accent-sky)', fontFamily: 'monospace' }}>{Number(ps.grossSalary).toLocaleString()}</td>
            <td style={{ padding: '10px 10px', paddingLeft: 20 }}>TOTAL DEDUCTIONS</td>
            <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--color-danger)', fontFamily: 'monospace' }}>{Number(ps.totalDeductions).toLocaleString()}</td>
          </tr>
          <tr style={{ background: 'var(--card-bg-solid)', color: '#fff', fontWeight: 800, fontSize: 14 }}>
            <td colSpan={2} style={{ padding: '12px 10px' }}>NET TAKE-HOME SALARY</td>
            <td colSpan={2} style={{ padding: '12px 10px', textAlign: 'right', fontFamily: 'monospace' }}>LKR {Number(ps.netSalary).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
        <strong>Employer Contributions:</strong> EPF Employer (12%): LKR {Number(ps.epfEr).toLocaleString()} | ETF (3%): LKR {Number(ps.etf).toLocaleString()}
      </div>
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderTop: '1px solid var(--card-border)', paddingTop: 16 }}>
        <div style={{ fontSize: 11 }}>Employee Signature: ________________</div>
        <div style={{ fontSize: 11, textAlign: 'right' }}>Authorized By: ________________</div>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-eyebrow">Operations · Statutory payroll</div>
          <h1 className="page-title">Payroll Calculator</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Sri Lanka compliant payroll — EPF/ETF, APIT tax bands, OT & net salary computation
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="month" value={payMonth} onChange={e => setPayMonth(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--card-border)', fontSize: 12, background: 'var(--card-bg)' }} />
          <button onClick={() => showToast('Payroll register exported!')} className="btn btn-primary">
            <Download size={16} /> Export Payroll
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard icon={Users} title="Employees on Payroll" value={activeEmployees.length} sub={payMonth_disp} color="#2563eb" />
        <StatCard icon={DollarSign} title="Total Gross Payroll" value={LKR(totalGross)} sub="All staff combined" color="#10b981" />
        <StatCard icon={CreditCard} title="Net Payout" value={LKR(totalNet)} sub="After all deductions" color="#8b5cf6" />
        <StatCard icon={TrendingDown} title="EPF Employer (12%)" value={LKR(totalEPFEr)} sub={`+ ETF: ${LKR(totalETF)}`} color="#f59e0b" />
      </div>

      {/* Payroll Register Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', overflow: 'auto' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calculator size={18} color="#2563eb" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Salary Register — {payMonth_disp}</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1000 }}>
          <thead>
            <tr style={{ background: 'var(--input-bg)', borderBottom: '2px solid var(--card-border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Employee</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Basic</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>OT Pay</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Allowances</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Gross</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>EPF (8%)</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>APIT</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Net Salary</th>
              <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No employees. Add employees in Workforce & Pools first.</td></tr>
            )}
            {activeEmployees.map((emp, idx) => {
              const ps = calcPayslip(emp);
              const ot = getOT(emp.id);
              const isExpanded = expandedId === emp.id;
              return (
                <React.Fragment key={emp.id}>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--table-row-alt)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.code} · {emp.desg}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{Number(ps.basic).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: ps.otPay > 0 ? '#10b981' : '#94a3b8' }}>{Number(ps.otPay).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: ps.allowances > 0 ? '#8b5cf6' : '#94a3b8' }}>{Number(ps.allowances).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-sky)' }}>{Number(ps.grossSalary).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: 'var(--color-danger)' }}>{Number(ps.epfEmp).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: 'var(--color-danger)' }}>{Number(ps.apitMonthly).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-success)' }}>{Number(ps.netSalary).toLocaleString()}</td>
                    <td style={{ textAlign: 'center', padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button onClick={() => setExpandedId(isExpanded ? null : emp.id)} style={{ border: '1px solid var(--card-border)', background: 'var(--card-bg)', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} OT/Adj
                        </button>
                        <button onClick={() => setShowSlip({ emp, ps })} style={{ border: 'none', background: 'var(--btn-primary)', color: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                          <Printer size={13} /> Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--card-border)' }}>
                      <td colSpan={9} style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>OT Hours:</label>
                            <input type="number" min={0} max={200} value={ot.otHours || 0} onChange={e => setOT(emp.id, 'otHours', e.target.value)}
                              style={{ width: 70, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--card-border)', fontSize: 12 }} />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>hrs @ 1.5x</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Allowances (LKR):</label>
                            <input type="number" min={0} value={ot.allowances || 0} onChange={e => setOT(emp.id, 'allowances', e.target.value)}
                              style={{ width: 100, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--card-border)', fontSize: 12 }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Extra Deductions (LKR):</label>
                            <input type="number" min={0} value={ot.deductions || 0} onChange={e => setOT(emp.id, 'deductions', e.target.value)}
                              style={{ width: 100, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--card-border)', fontSize: 12 }} />
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--card-bg)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--card-border)' }}>
                            EPF Employer: <strong style={{ color: 'var(--color-purple)' }}>LKR {Number(ps.epfEr).toLocaleString()}</strong> &nbsp;|&nbsp;
                            ETF: <strong style={{ color: 'var(--color-info)' }}>LKR {Number(ps.etf).toLocaleString()}</strong>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          {activeEmployees.length > 0 && (
            <tfoot>
              <tr style={{ background: 'var(--card-bg-solid)', color: '#fff', fontWeight: 700 }}>
                <td style={{ padding: '12px 14px', fontSize: 13 }}>TOTALS</td>
                <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace' }}>{Number(activeEmployees.reduce((s, e) => s + calcPayslip(e).basic, 0)).toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace' }}>{Number(activeEmployees.reduce((s, e) => s + calcPayslip(e).otPay, 0)).toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace' }}>{Number(activeEmployees.reduce((s, e) => s + calcPayslip(e).allowances, 0)).toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: '#93c5fd' }}>{Number(totalGross).toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: '#fca5a5' }}>{Number(activeEmployees.reduce((s, e) => s + calcPayslip(e).epfEmp, 0)).toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: '#fca5a5' }}>{Number(activeEmployees.reduce((s, e) => s + calcPayslip(e).apitMonthly, 0)).toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '12px 12px', fontFamily: 'monospace', color: '#6ee7b7', fontSize: 14 }}>{Number(totalNet).toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Payslip Modal */}
      {showSlip && (
        <Modal title={`Payslip — ${showSlip.emp.name}`} onClose={() => setShowSlip(null)} w={640}>
          <PrintSlip emp={showSlip.emp} ps={showSlip.ps} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
            <button onClick={() => setShowSlip(null)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--card-border)', background: 'var(--card-bg)', fontSize: 13, cursor: 'pointer' }}>Close</button>
            <button onClick={() => window.print()} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--btn-primary)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Printer size={16} /> Print Payslip
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
