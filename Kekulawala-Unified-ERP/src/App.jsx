import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { HeaderSidebar } from './components/HeaderSidebar';
import { AuroraBackdrop } from './components/Aurora';
import { Toast } from './components/CommonUI';

import {
  DEFAULT_COMPANY_SETTINGS,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_MATERIALS,
  INITIAL_TOOLS,
  INITIAL_SUPPLIERS,
  INITIAL_EMPLOYEES,
  INITIAL_QUOTATIONS,
  INITIAL_LETTERS,
  INITIAL_TRANSACTIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_TRANSPORTS
} from './data/initialData';

import { DAILY_LEGAL_TIPS } from './config/legalKnowledge';

import {
  subscribeCollection,
  subscribeDocument,
  saveCompanySettings,
  saveClient, deleteClient,
  saveProject, deleteProject,
  saveMaterial, deleteMaterial,
  saveTool, deleteTool,
  saveSupplier, deleteSupplier,
  saveEmployee, deleteEmployee,
  saveQuotation, deleteQuotation,
  saveLetter, deleteLetter,
  saveTransaction, deleteTransaction,
  savePurchaseOrder, deletePurchaseOrder,
  saveTransport, deleteTransport,
  syncListState
} from './services/firebaseService';

// Views
import { DashboardView }       from './views/DashboardView';
import { ProjectsView }        from './views/ProjectsView';
import { InventoryView }       from './views/InventoryView';
import { QuotationsView }      from './views/QuotationsView';
import { AIEstimatorView }     from './views/AIEstimatorView';
import { DocumentStudioView }  from './views/DocumentStudioView';
import { LegalAdvisorView }    from './views/LegalAdvisorView';
import { SettingsView }        from './views/SettingsView';
import { CRMClientsView }      from './views/CRMClientsView';
import { WorkforceView }       from './views/WorkforceView';
import { AttendanceView }      from './views/AttendanceView';
import { PayrollView }         from './views/PayrollView';
import { ToolsView }           from './views/ToolsView';
import { PurchaseOrdersView }  from './views/PurchaseOrdersView';
import { SupplierDirectoryView } from './views/SupplierDirectoryView';
import { TransportView }       from './views/TransportView';
import { FinanceLedgerView }   from './views/FinanceLedgerView';

function ERPApp() {
  const [activePage, setActivePage]     = useState('dashboard');
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [dailyTipIndex]                 = useState(0);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ m: msg, t: type });

  // Master Data State
  const [companySettings, setCompanySettings] = useState(DEFAULT_COMPANY_SETTINGS);
  const [clients,      setClients]      = useState(INITIAL_CLIENTS);
  const [projects,     setProjects]     = useState(INITIAL_PROJECTS);
  const [materials,    setMaterials]    = useState(INITIAL_MATERIALS);
  const [tools,        setTools]        = useState(INITIAL_TOOLS);
  const [suppliers,    setSuppliers]    = useState(INITIAL_SUPPLIERS);
  const [employees,    setEmployees]    = useState(INITIAL_EMPLOYEES);
  const [quotations,   setQuotations]   = useState(INITIAL_QUOTATIONS);
  const [letters,      setLetters]      = useState(INITIAL_LETTERS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [orders,       setOrders]       = useState(INITIAL_PURCHASE_ORDERS);
  const [transports,   setTransports]   = useState(INITIAL_TRANSPORTS);

  // References to keep current values for diffing
  const stateRefs = useRef({
    clients, projects, materials, tools, suppliers,
    employees, quotations, letters, transactions, orders, transports
  });
  useEffect(() => {
    stateRefs.current = {
      clients, projects, materials, tools, suppliers,
      employees, quotations, letters, transactions, orders, transports
    };
  });

  // Real-Time Firebase Subscriptions
  useEffect(() => {
    const unsubSettings = subscribeDocument('settings', 'company', (doc) => {
      if (doc) {
        setCompanySettings(prev => ({ ...prev, ...doc }));
        setFirebaseConnected(true);
      }
    });

    const unsubs = [
      unsubSettings,
      subscribeCollection('clients', (docs) => {
        if (docs.length) { setClients(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('projects', (docs) => {
        if (docs.length) { setProjects(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('materials', (docs) => {
        if (docs.length) { setMaterials(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('tools', (docs) => {
        if (docs.length) { setTools(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('suppliers', (docs) => {
        if (docs.length) { setSuppliers(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('employees', (docs) => {
        if (docs.length) { setEmployees(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('quotations', (docs) => {
        if (docs.length) { setQuotations(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('letters', (docs) => {
        if (docs.length) { setLetters(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('transactions', (docs) => {
        if (docs.length) { setTransactions(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('orders', (docs) => {
        if (docs.length) { setOrders(docs); setFirebaseConnected(true); }
      }),
      subscribeCollection('transports', (docs) => {
        if (docs.length) { setTransports(docs); setFirebaseConnected(true); }
      }),
    ];

    return () => {
      unsubs.forEach(fn => fn && fn());
    };
  }, []);

  // Sync Mutation Setters
  const handleSetClients = (updater) => {
    const current = stateRefs.current.clients;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('clients', current, next, saveClient, deleteClient);
    setClients(next);
  };

  const handleSetProjects = (updater) => {
    const current = stateRefs.current.projects;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('projects', current, next, saveProject, deleteProject);
    setProjects(next);
  };

  const handleSetMaterials = (updater) => {
    const current = stateRefs.current.materials;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('materials', current, next, saveMaterial, deleteMaterial);
    setMaterials(next);
  };

  const handleSetTools = (updater) => {
    const current = stateRefs.current.tools;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('tools', current, next, saveTool, deleteTool);
    setTools(next);
  };

  const handleSetSuppliers = (updater) => {
    const current = stateRefs.current.suppliers;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('suppliers', current, next, saveSupplier, deleteSupplier);
    setSuppliers(next);
  };

  const handleSetEmployees = (updater) => {
    const current = stateRefs.current.employees;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('employees', current, next, saveEmployee, deleteEmployee);
    setEmployees(next);
  };

  const handleSetQuotations = (updater) => {
    const current = stateRefs.current.quotations;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('quotations', current, next, saveQuotation, deleteQuotation);
    setQuotations(next);
  };

  const handleSetLetters = (updater) => {
    const current = stateRefs.current.letters;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('letters', current, next, saveLetter, deleteLetter);
    setLetters(next);
  };

  const handleSetTransactions = (updater) => {
    const current = stateRefs.current.transactions;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('transactions', current, next, saveTransaction, deleteTransaction);
    setTransactions(next);
  };

  const handleSetOrders = (updater) => {
    const current = stateRefs.current.orders;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('orders', current, next, savePurchaseOrder, deletePurchaseOrder);
    setOrders(next);
  };

  const handleSetTransports = (updater) => {
    const current = stateRefs.current.transports;
    const next = typeof updater === 'function' ? updater(current) : updater;
    syncListState('transports', current, next, saveTransport, deleteTransport);
    setTransports(next);
  };

  const handleSetCompanySettings = (updater) => {
    const next = typeof updater === 'function' ? updater(companySettings) : updater;
    saveCompanySettings(next).catch(err => console.error('[Settings Save Error]', err));
    setCompanySettings(next);
  };

  // Close sidebar overlay when resizing to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const renderView = () => {
    const common = { showToast };
    switch (activePage) {
      case 'dashboard':     return <DashboardView projects={projects} clients={clients} materials={materials} quotations={quotations} employees={employees} transactions={transactions} dailyTip={DAILY_LEGAL_TIPS[dailyTipIndex]} nav={setActivePage} />;
      case 'projects':      return <ProjectsView projects={projects} setProjects={handleSetProjects} clients={clients} {...common} />;
      case 'clients':       return <CRMClientsView clients={clients} setClients={handleSetClients} projects={projects} {...common} />;
      case 'hr':            return <WorkforceView employees={employees} setEmployees={handleSetEmployees} {...common} />;
      case 'attendance':    return <AttendanceView employees={employees} {...common} />;
      case 'payroll':       return <PayrollView employees={employees} {...common} />;
      case 'inventory':     return <InventoryView materials={materials} setMaterials={handleSetMaterials} {...common} />;
      case 'tools':         return <ToolsView tools={tools} setTools={handleSetTools} projects={projects} {...common} />;
      case 'orders':        return <PurchaseOrdersView suppliers={suppliers} materials={materials} orders={orders} setOrders={handleSetOrders} {...common} />;
      case 'suppliers':     return <SupplierDirectoryView suppliers={suppliers} setSuppliers={handleSetSuppliers} {...common} />;
      case 'transport':     return <TransportView projects={projects} trips={transports} setTrips={handleSetTransports} {...common} />;
      case 'quotations':    return <QuotationsView quotations={quotations} setQuotations={handleSetQuotations} clients={clients} materials={materials} companySettings={companySettings} nav={setActivePage} {...common} />;
      case 'ai_estimator':  return <AIEstimatorView materials={materials} nav={setActivePage} {...common} />;
      case 'document_studio': return <DocumentStudioView letters={letters} setLetters={handleSetLetters} clients={clients} projects={projects} companySettings={companySettings} {...common} />;
      case 'legal_advisor': return <LegalAdvisorView />;
      case 'finance':       return <FinanceLedgerView transactions={transactions} setTransactions={handleSetTransactions} {...common} />;
      case 'settings':      return <SettingsView settings={companySettings} setSettings={handleSetCompanySettings} {...common} />;
      default:              return <DashboardView projects={projects} clients={clients} materials={materials} quotations={quotations} employees={employees} transactions={transactions} dailyTip={DAILY_LEGAL_TIPS[dailyTipIndex]} nav={setActivePage} />;
    }
  };

  return (
    <div className="erp-shell">
      {/* Living aurora light behind the glass workspace */}
      <AuroraBackdrop />

      {/* Toast Notification */}
      {toast && <Toast msg={toast.m} type={toast.t} onClose={() => setToast(null)} />}

      {/* Sidebar + Header + Content */}
      <HeaderSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        dailyTip={DAILY_LEGAL_TIPS[dailyTipIndex]}
      >
        {renderView()}
      </HeaderSidebar>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ERPApp />
    </ThemeProvider>
  );
}
