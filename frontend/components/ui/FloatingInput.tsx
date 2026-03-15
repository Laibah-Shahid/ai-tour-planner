"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  icon: ReactNode;
  showPasswordToggle?: boolean;
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FloatingInput({
  id,
  label,
  type = "text",
  icon,
  showPasswordToggle = false,
  required = true,
  className = "",
  value,
  onChange,
}: FloatingInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
        {icon}
      </div>
      <input
        type={inputType}
        required={required}
        className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all peer"
        placeholder={label}
        id={id}
        value={value}
        onChange={onChange}
      />
      <label
        htmlFor={id}
        className="absolute left-10 -top-2.5 bg-white px-2 text-xs text-slate-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-emerald-600"
      >
        {label}
      </label>
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}
