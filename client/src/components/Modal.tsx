import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose(): void;
}

export const Modal = ({ title, children, onClose }: ModalProps) => (
  <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
    <section className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <Button aria-label="Close" title="Close" variant="ghost" onClick={onClose} className="h-9 w-9 px-0">
          <X size={18} />
        </Button>
      </div>
      {children}
    </section>
  </div>
);
