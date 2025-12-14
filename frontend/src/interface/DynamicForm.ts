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
    | "switch";
  label?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  options?: FieldOption[];
  validation?: {
    required?: { value: boolean; message: string };
    pattern?: { value: RegExp; message: string };
    custom?: (value: any) => string | null;
  };
  defaultValue?: any;
  disabled?: boolean;
}

export interface ButtonConfig {
  label: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  type?: "submit" | "button";
  onClick?: (data: any) => void;
}
