import { type LucideIcon } from "lucide-react";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  type:
    | "header"
    | "text"
    | "email"
    | "number"
    | "password"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "switch"
    | "slider"
    | "date";
  label?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  helperText?: string;
  icon?: LucideIcon;
  options?: FieldOption[];
  rows?: number;
  orientation?: "horizontal" | "vertical";
  validation?: {
    required?: { value: boolean; message: string };
    pattern?: { value: RegExp; message: string };
    min?: number;
    max?: number;
    minMessage?: string;
    maxMessage?: string;
    custom?: (value: any) => string | null;
  };
  defaultValue?: any;
  disabled?: boolean;
  // Slider specific
  step?: number;
  showValue?: boolean;
  // Date specific
  dateFormat?: string;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
}

export interface ButtonConfig {
  label: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  type?: "submit" | "reset" | "button";
  onClick?: (data: any) => void;
}
