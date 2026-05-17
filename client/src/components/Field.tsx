import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Field = ({ label, error, className = "", ...props }: FieldProps) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    <input
      {...props}
      className={`h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${className}`}
    />
    {error ? <span className="mt-1 block text-sm text-rose-600">{error}</span> : null}
  </label>
);

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export const SelectField = ({ label, className = "", children, ...props }: SelectFieldProps) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    <select
      {...props}
      className={`h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${className}`}
    >
      {children}
    </select>
  </label>
);
