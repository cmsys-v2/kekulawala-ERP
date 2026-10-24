import React from 'react';

/**
 * ErrorBoundary — prevents a single component failure from blanking the app.
 * Shows a recoverable diagnostics panel with cache-reset controls.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error('[K-ERP] Render error captured by boundary:', error, info);
  }

  hardReset = () => {
    try { localStorage.setItem('kerp_build', window.__KERP_BUILD__ || '6.2.0'); } catch (e) { /* ignore */ }
    const clear = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
      } catch (e) { /* ignore */ }
      try {
        if (window.caches) {
          const keys = await window.caches.keys();
          await Promise.all(keys.map(k => window.caches.delete(k)));
        }
      } catch (e) { /* ignore */ }
    };
    clear().finally(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('v', Date.now().toString(36));
      window.location.replace(url.toString());
    });
  };

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    const message = error?.message || String(error);
    const stack = (info?.componentStack || error?.stack || '').trim().split('\n').slice(0, 8).join('\n');

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background:
            'radial-gradient(60% 50% at 20% 10%, rgba(34,211,238,0.16), transparent 65%),' +
            'radial-gradient(55% 45% at 85% 20%, rgba(59,130,246,0.18), transparent 65%),' +
            'radial-gradient(60% 50% at 60% 100%, rgba(16,185,129,0.14), transparent 65%),' +
            '#04070f',
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: '#eaf2ff',
        }}
      >
        <div
          style={{
            width: 'min(660px, 100%)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(11,19,34,0.92)',
            boxShadow: '0 40px 100px -40px rgba(0,0,0,0.9)',
            padding: '28px 30px',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                background: 'linear-gradient(135deg, #fb7185, #be123c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800,
              }}
            >
              !
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fda4af' }}>
                Kekulawala ERP · Recovery
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }}>
                The workspace hit a runtime error
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(226,240,255,0.72)', margin: '10px 0 16px' }}>
            The interface could not finish rendering. This is usually a stale service-worker cache holding
            an old build. Reset the cache below — your Firebase data is not affected.
          </p>

          <pre
            style={{
              margin: '0 0 18px', padding: '12px 14px', borderRadius: 12,
              background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.22)',
              color: '#fecdd3', fontSize: 11.5, lineHeight: 1.55,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 190, overflow: 'auto',
            }}
          >
            {message}
            {stack ? '\n\n' + stack : ''}
          </pre>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={this.hardReset}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.16)',
                background: 'linear-gradient(120deg, #22d3ee, #2563eb 55%, #0ea371)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 12px 30px -12px rgba(37,99,235,0.8)',
              }}
            >
              Reset cache &amp; reload
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '11px 18px', borderRadius: 12, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)',
                color: '#dbe7f8', fontSize: 13, fontWeight: 650,
              }}
            >
              Just reload
            </button>
            <a
              href="?safe=1"
              style={{
                padding: '11px 18px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.14)', background: 'transparent',
                color: 'rgba(226,240,255,0.7)', fontSize: 13, fontWeight: 650, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center',
              }}
            >
              Safe mode
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
