import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Box, Check, ChevronRight, Moon, Sun, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { usePreferences } from "../stores/preferences";
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="SpaceCraft home">
      <span className="logo-mark">
        <Box size={21} strokeWidth={1.6} />
      </span>
      SpaceCraft<span className="logo-dot">®</span>
    </Link>
  );
}
export function Button({
  children,
  className = "",
  variant = "secondary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`icon-button ${active ? "active" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function ThemeToggle() {
  const { theme, set } = usePreferences();
  return (
    <IconButton
      label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      onClick={() => set({ theme: theme === "dark" ? "light" : "dark" })}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </IconButton>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="modal-heading">
          <h2>{title}</h2>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={19} />
          </IconButton>
        </div>
        {children}
      </motion.div>
    </dialog>,
    document.body,
  );
}
export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  suffix,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(Number(value.toFixed(3))));
  useEffect(() => setDraft(String(Number(value.toFixed(3)))), [value]);
  const commit = () => {
    const n = Number(draft);
    if (draft.trim() && Number.isFinite(n)) {
      const valid = Math.max(min, Math.min(max, n));
      onChange(valid);
      setDraft(String(Number(valid.toFixed(3))));
    } else setDraft(String(value));
  };
  return (
    <label className="field">
      <span>{label}</span>
      <div className="number-wrap">
        <input
          type="number"
          aria-label={label}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
        {suffix && <small>{suffix}</small>}
      </div>
    </label>
  );
}
export function ColorField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <label className="field">
      <span>{label}</span>
      <div className="color-input">
        <input
          type="color"
          aria-label={label}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => draft !== value && onChange(draft)}
          disabled={disabled}
        />
        <span>{draft.toUpperCase()}</span>
      </div>
    </label>
  );
}
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message, onClose]);
  return (
    <motion.div
      className="toast"
      role="status"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Check size={17} />
      {message}
      <IconButton label="Dismiss notification" onClick={onClose}>
        <X size={15} />
      </IconButton>
    </motion.div>
  );
}
export function Breadcrumb({ children }: { children: ReactNode }) {
  return (
    <div className="breadcrumb">
      <Link to="/dashboard">Workspace</Link>
      <ChevronRight size={13} />
      {children}
    </div>
  );
}
