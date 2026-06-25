"use client";

import { cn } from "@/lib/utils";
import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-white/60">
      {children}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => (
    <div>
      {label && <Label>{label}</Label>}
      <input ref={ref} className={cn("input-base", className)} {...props} />
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, ...props }, ref) => (
    <div>
      {label && <Label>{label}</Label>}
      <textarea
        ref={ref}
        className={cn("input-base resize-none", className)}
        {...props}
      />
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, options, ...props }, ref) => (
    <div>
      {label && <Label>{label}</Label>}
      <select
        ref={ref}
        className={cn("input-base appearance-none cursor-pointer", className)}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#15151f]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
);
Select.displayName = "Select";
