import React from 'react';

export function FilterTag({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      className={`tag ${active ? 'tag-accent' : 'tag-neutral'}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      {label}
    </div>
  );
}

export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string | null;
}) {
  return (
    <div className="field" style={{ margin: 0 }}>
      <label>{label}</label>
      {children}
      {error ? <div className="field-error">{error}</div> : null}
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  onSave,
  saveLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSave: () => void;
  saveLabel: string;
  children: React.ReactNode;
}) {
  useEscape(onClose);
  return (
    <div className="dialog-backdrop" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          background: 'var(--color-bg)', borderRadius: 12, width: 520,
          maxWidth: '100%', boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-neutral-200)' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
          {subtitle ? (
            <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{subtitle}</div>
          ) : null}
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        <div style={{
          padding: '14px 20px', borderTop: '1px solid var(--color-neutral-200)',
          display: 'flex', gap: 8, justifyContent: 'flex-end',
        }}
        >
          <button className="btn btn-secondary" onClick={onClose} style={{ height: 36, padding: '0 16px', fontSize: 13 }}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSave} style={{ height: 36, padding: '0 18px', fontSize: 13 }}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function useEscape(onClose: () => void) {
  React.useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-muted" style={{ padding: '18px 16px', fontSize: 13 }}>
      {message}
    </div>
  );
}
