"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAppRuntime } from "@/lib/client/runtime";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  description,
  closeLabel,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const runtime = useAppRuntime();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = panel.current;
    if (!dialog) return;
    const focusRoot = dialog.getRootNode() as Document | ShadowRoot;
    restore.current = focusRoot.activeElement as HTMLElement | null;
    const scroll = runtime.scrollElement ?? document.body;
    const { overflow } = scroll.style;
    const previousInert = scroll.inert;
    scroll.style.overflow = "hidden";
    if (runtime.embedded) scroll.inert = true;
    const timer = window.setTimeout(() => panel.current?.focus(), 30);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close.current();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (focusRoot.activeElement === first || focusRoot.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (focusRoot.activeElement === last || focusRoot.activeElement === dialog)) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      dialog.removeEventListener("keydown", onKey);
      scroll.style.overflow = overflow;
      scroll.inert = previousInert;
      if (!runtime.signal?.aborted && restore.current?.isConnected) restore.current.focus();
    };
  }, [open, runtime]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="modal-layer">
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panel}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={closeLabel}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>,
    runtime.portalRoot ?? document.body,
  );
}
