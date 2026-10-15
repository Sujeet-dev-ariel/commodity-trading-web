import { Link, useRouteError } from 'react-router-dom';

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--color-neutral-200)',
    }}
    >
      <div className="panel panel-pad" style={{ width: 440, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <Centered>
      <div style={{ fontWeight: 700, fontSize: 18 }}>Page not found</div>
      <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
        This admin section doesn&apos;t exist. Check the sidebar — every console
        page lives one click away.
      </p>
      <div>
        <Link to="/dash" className="btn btn-primary" style={{ height: 38, padding: '0 18px', fontSize: 13 }}>
          Back to dashboard
        </Link>
      </div>
    </Centered>
  );
}

export function RouteErrorPage() {
  const error = useRouteError() as { message?: string } | null;
  return (
    <Centered>
      <div style={{ fontWeight: 700, fontSize: 18 }}>Something went wrong</div>
      <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
        {error?.message ?? 'The console hit an unexpected error while loading this page.'}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary" onClick={() => window.location.reload()} style={{ height: 38, padding: '0 18px', fontSize: 13 }}>
          Reload
        </button>
        <Link to="/dash" className="btn btn-primary" style={{ height: 38, padding: '0 18px', fontSize: 13 }}>
          Back to dashboard
        </Link>
      </div>
    </Centered>
  );
}

export function PageLoader() {
  return (
    <div className="text-muted" role="status" style={{ padding: '28px 8px', fontSize: 13 }}>
      Loading…
    </div>
  );
}
