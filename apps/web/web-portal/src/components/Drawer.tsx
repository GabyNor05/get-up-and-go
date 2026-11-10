import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the panel */
  label: string;
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Side panel that slides in from the right over the dashboard */
export default function Drawer({ open, onClose, label, header, footer, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="gng-drawer-root">
      <div className="gng-drawer-scrim" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className="gng-drawer" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        <div className="gng-drawer-head">
          <div style={{ flex: 1, minWidth: 0 }}>{header}</div>
          <button type="button" className="gng-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="gng-drawer-body">{children}</div>
        {footer ? <div className="gng-drawer-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/** Centred dialog (used on top of a drawer for "Show all") */
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="gng-modal-root">
      <div className="gng-drawer-scrim" onClick={onClose} aria-hidden="true" />
      <div className="gng-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="gng-drawer-head">
          <h2 style={{ margin: 0, flex: 1 }}>{title}</h2>
          <button type="button" className="gng-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="gng-modal-body">{children}</div>
      </div>
    </div>
  );
}
