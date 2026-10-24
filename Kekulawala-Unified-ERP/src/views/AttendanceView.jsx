import React, { useState, useEffect } from 'react';
import {
  CalendarCheck, ChevronLeft, ChevronRight, Check, X,
  Clock, AlertTriangle, Download, Users
} from 'lucide-react';
import { StatCard } from '../components/CommonUI';
import { subscribeCollection, saveAttendanceEntry } from '../services/firebaseService';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUS_CONFIG = {
  present: { label: 'P', bg: 'var(--color-success-bg)', color: 'var(--color-success)', fullLabel: 'Present' },
  absent: { label: 'A', bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', fullLabel: 'Absent' },
  halfday: { label: 'H', bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', fullLabel: 'Half Day' },
  leave: { label: 'L', bg: 'var(--color-purple-bg)', color: 'var(--color-purple)', fullLabel: 'Leave' },
  '': { label: '-', bg: 'var(--input-bg)', color: 'var(--text-muted)', fullLabel: '-' },
};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

export const AttendanceView = ({ employees = [], showToast }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedEmp, setSelectedEmp] = useState(null);
  // attendance: { empId: { 'YYYY-MM-DD': status } }
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const unsub = subscribeCollection('attendance', (docs) => {
      const map = {};
      docs.forEach(d => {
        map[d.id] = d;
      });
      setAttendance(prev => ({ ...prev, ...map }));
    });
    return () => unsub();
  }, []);

  const activeEmployees = employees.filter(e => e.pool === 'employee');
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthName = new Date(year, month).toLocaleString('en-LK', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const getKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getStatus = (empId, day) => {
    return (attendance[empId] || {})[getKey(day)] || '';
  };

  const cycleStatus = (empId, day) => {
    const statuses = ['present', 'absent', 'halfday', 'leave', ''];
    const current = getStatus(empId, day);
    const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
    const key = getKey(day);
    setAttendance(prev => ({
      ...prev,
      [empId]: { ...(prev[empId] || {}), [key]: next }
    }));
    saveAttendanceEntry(empId, key, next).catch(err => console.error('[Attendance Sync Error]', err));
  };

  const getEmpSummary = (empId) => {
    const rec = attendance[empId] || {};
    const vals = Object.values(rec);
    return {
      present: vals.filter(v => v === 'present').length,
      absent: vals.filter(v => v === 'absent').length,
      halfday: vals.filter(v => v === 'halfday').length,
      leave: vals.filter(v => v === 'leave').length,
    };
  };

  const totalPresent = activeEmployees.reduce((s, e) => s + getEmpSummary(e.id).present, 0);
  const totalAbsent = activeEmployees.reduce((s, e) => s + getEmpSummary(e.id).absent, 0);

  // Build calendar day cells
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-eyebrow">Operations · Time</div>
          <h1 className="page-title">Attendance Tracking</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Monthly attendance register — click cells to cycle status (P/A/H/L)</div>
        </div>
        <button onClick={() => showToast('Attendance report exported!')} className="btn btn-primary">
          <Download size={16} /> Export Register
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <StatCard icon={Users} title="Active Staff" value={activeEmployees.length} sub="On payroll" color="#2563eb" />
        <StatCard icon={Check} title="Total Present" value={totalPresent} sub={`Days this month`} color="#10b981" />
        <StatCard icon={X} title="Total Absent" value={totalAbsent} sub="Absences this month" color="#ef4444" />
        <StatCard icon={Clock} title="Days in Month" value={daysInMonth} sub={monthName} color="#8b5cf6" />
      </div>

      {/* Month Navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={prevMonth} style={{ border: '1px solid var(--card-border)', background: 'var(--card-bg)', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={16} /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', minWidth: 160, textAlign: 'center' }}>{monthName}</span>
        <button onClick={nextMonth} style={{ border: '1px solid var(--card-border)', background: 'var(--card-bg)', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronRight size={16} /></button>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 16, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_CONFIG).filter(([k]) => k !== '').map(([k, v]) => (
            <span key={k} style={{ background: v.bg, color: v.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>{v.label} = {v.fullLabel}</span>
          ))}
        </div>
      </div>

      {/* Attendance Grid Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', overflow: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 11, minWidth: 900 }}>
          <thead>
            <tr style={{ background: 'var(--input-bg)', borderBottom: '2px solid var(--card-border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', minWidth: 160, position: 'sticky', left: 0, background: 'var(--input-bg)', zIndex: 2 }}>Employee</th>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1;
                const dow = new Date(year, month, d).getDay();
                const isWeekend = dow === 0 || dow === 6;
                return (
                  <th key={d} style={{ padding: '8px 4px', fontWeight: 700, color: isWeekend ? '#94a3b8' : '#334155', minWidth: 34, textAlign: 'center' }}>
                    <div>{d}</div>
                    <div style={{ fontSize: 9, fontWeight: 500 }}>{DAYS_OF_WEEK[dow]}</div>
                  </th>
                );
              })}
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', minWidth: 80, textAlign: 'center' }}>P</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', minWidth: 80, textAlign: 'center' }}>A</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', minWidth: 80, textAlign: 'center' }}>H</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-secondary)', minWidth: 80, textAlign: 'center' }}>L</th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.length === 0 && (
              <tr><td colSpan={daysInMonth + 5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No employees added yet. Go to Workforce & Pools to add employees.</td></tr>
            )}
            {activeEmployees.map((emp, idx) => {
              const summary = getEmpSummary(emp.id);
              return (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--card-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--table-row-alt)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)', position: 'sticky', left: 0, background: idx % 2 === 0 ? 'transparent' : 'var(--table-row-alt)', zIndex: 1, borderRight: '1px solid var(--card-border)' }}>
                    <div>{emp.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{emp.desg}</div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const d = i + 1;
                    const status = getStatus(emp.id, d);
                    const cfg = STATUS_CONFIG[status];
                    const dow = new Date(year, month, d).getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    return (
                      <td key={d} style={{ textAlign: 'center', padding: '4px 2px' }}>
                        <button
                          onClick={() => !isWeekend && cycleStatus(emp.id, d)}
                          title={isWeekend ? 'Weekend' : cfg.fullLabel}
                          style={{
                            width: 28, height: 28, borderRadius: 6, border: 'none', cursor: isWeekend ? 'default' : 'pointer',
                            background: isWeekend ? 'var(--input-bg)' : cfg.bg,
                            color: isWeekend ? 'var(--text-muted)' : cfg.color,
                            fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                            transition: 'all 0.1s'
                          }}
                        >
                          {isWeekend ? '—' : cfg.label}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 700, color: 'var(--color-success)' }}>{summary.present}</td>
                  <td style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 700, color: 'var(--color-danger)' }}>{summary.absent}</td>
                  <td style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 700, color: 'var(--color-warning)' }}>{summary.halfday}</td>
                  <td style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 700, color: 'var(--color-purple)' }}>{summary.leave}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
