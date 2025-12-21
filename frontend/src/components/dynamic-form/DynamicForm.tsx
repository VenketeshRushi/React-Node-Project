import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { type ButtonConfig, type FieldConfig } from "@/interface/DynamicForm";
import { Loader2 } from "lucide-react";

interface DynamicFormProps {
  fields: FieldConfig[];
  buttons?: ButtonConfig[];
  onSubmit?: (formData: any, isValid: boolean) => void;
  formClassName?: string;
  formFieldsClassName?: string;
  formButtonClassName?: string;
  showCard?: boolean;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields = [],
  buttons = [],
  onSubmit,
  formClassName,
  formFieldsClassName,
  formButtonClassName,
  showCard = true,
  isSubmitting = false,
  disabled = false,
}) => {
  const headerField = fields.find(f => f.type === "header");
  const formFields = fields.filter(f => f.type !== "header");

  const initialState = formFields.reduce(
    (acc, f) => {
      if (f.defaultValue !== undefined) {
        acc[f.name] = f.defaultValue;
      } else {
        acc[f.name] = f.type === "checkbox" || f.type === "switch" ? false : "";
      }
      return acc;
    },
    {} as Record<string, any>
  );

  const [formData, setFormData] = useState<Record<string, any>>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  const validateForm = () => {
    const err: Record<string, string> = {};
    formFields.forEach(field => {
      const rules = field.validation;
      const value = formData[field.name];

      if (!rules) return;

      // Required validation
      if (rules.required?.value) {
        if (field.type === "checkbox" || field.type === "switch") {
          if (!value) {
            err[field.name] = rules.required.message;
            return;
          }
        } else {
          if (!value || (typeof value === "string" && value.trim() === "")) {
            err[field.name] = rules.required.message;
            return;
          }
        }
      }

      // Skip other validations if value is empty and not required
      if (!value && !rules.required?.value) return;

      // Pattern validation
      if (rules.pattern?.value && !rules.pattern.value.test(value)) {
        err[field.name] = rules.pattern.message;
        return;
      }

      // Min/Max validation for numbers
      if (field.type === "number") {
        const numValue = Number(value);
        if (rules.min !== undefined && numValue < rules.min) {
          err[field.name] = rules.minMessage || `Minimum value is ${rules.min}`;
          return;
        }
        if (rules.max !== undefined && numValue > rules.max) {
          err[field.name] = rules.maxMessage || `Maximum value is ${rules.max}`;
          return;
        }
      }

      // Custom validation
      if (rules.custom) {
        const msg = rules.custom(value);
        if (msg) err[field.name] = msg;
      }
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    const isValid = validateForm();
    onSubmit?.(formData, isValid);
  };

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const renderField = (field: FieldConfig) => {
    const hasError = !!errors[field.name];
    const isDisabled = field.disabled || disabled || isSubmitting;
    const errorId = `${field.name}-error`;
    const helperId = `${field.name}-helper`;

    return (
      <Field className='mb-4' key={field.name}>
        {field.label &&
          field.type !== "checkbox" &&
          field.type !== "switch" && (
            <FieldLabel htmlFor={field.name}>
              <div className='flex items-center gap-2'>
                {field.icon && <field.icon className='h-4 w-4' />}
                <span>
                  {field.label}
                  {field.validation?.required?.value && (
                    <span className='text-destructive'> *</span>
                  )}
                </span>
              </div>
            </FieldLabel>
          )}

        {field.helperText && !hasError && (
          <p id={helperId} className='text-sm text-muted-foreground mb-2'>
            {field.helperText}
          </p>
        )}

        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "password") && (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={e => handleChange(field.name, e.target.value)}
            className={hasError ? "border-destructive" : ""}
            disabled={isDisabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : field.helperText ? helperId : undefined
            }
          />
        )}

        {field.type === "number" && (
          <Input
            id={field.name}
            type='number'
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={e => handleChange(field.name, e.target.value)}
            className={hasError ? "border-destructive" : ""}
            disabled={isDisabled}
            min={field.validation?.min}
            max={field.validation?.max}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : field.helperText ? helperId : undefined
            }
          />
        )}

        {field.type === "textarea" && (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={e => handleChange(field.name, e.target.value)}
            className={hasError ? "border-destructive" : ""}
            disabled={isDisabled}
            rows={field.rows || 4}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : field.helperText ? helperId : undefined
            }
          />
        )}

        {field.type === "select" && (
          <Select
            onValueChange={v => handleChange(field.name, v)}
            value={formData[field.name]}
            defaultValue={field.defaultValue}
            disabled={isDisabled}
          >
            <SelectTrigger
              id={field.name}
              className={hasError ? "border-destructive" : ""}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? errorId : field.helperText ? helperId : undefined
              }
            >
              <SelectValue
                placeholder={field.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.type === "radio" && (
          <RadioGroup
            onValueChange={v => handleChange(field.name, v)}
            value={formData[field.name]}
            disabled={isDisabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : field.helperText ? helperId : undefined
            }
          >
            <div className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6'>
              {field.options?.map(opt => (
                <div key={opt.value} className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value={opt.value}
                    id={`${field.name}-${opt.value}`}
                    disabled={isDisabled}
                  />
                  <Label htmlFor={`${field.name}-${opt.value}`}>
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {field.type === "checkbox" && (
          <div className='flex items-start space-x-2'>
            <Checkbox
              id={field.name}
              checked={!!formData[field.name]}
              onCheckedChange={v => handleChange(field.name, v)}
              disabled={isDisabled}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? errorId : field.helperText ? helperId : undefined
              }
              className='mt-1'
            />
            <div className='grid gap-1.5 leading-none'>
              <Label
                htmlFor={field.name}
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                {field.label}
                {field.validation?.required?.value && (
                  <span className='text-destructive'> *</span>
                )}
              </Label>
              {field.helperText && !hasError && (
                <p className='text-sm text-muted-foreground'>
                  {field.helperText}
                </p>
              )}
            </div>
          </div>
        )}

        {field.type === "switch" && (
          <div className='flex items-center justify-between space-x-2'>
            <div className='grid gap-1.5 leading-none'>
              <Label
                htmlFor={field.name}
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                {field.label}
                {field.validation?.required?.value && (
                  <span className='text-destructive'> *</span>
                )}
              </Label>
              {field.helperText && !hasError && (
                <p className='text-sm text-muted-foreground'>
                  {field.helperText}
                </p>
              )}
            </div>
            <Switch
              id={field.name}
              checked={!!formData[field.name]}
              onCheckedChange={v => handleChange(field.name, v)}
              disabled={isDisabled}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? errorId : field.helperText ? helperId : undefined
              }
            />
          </div>
        )}

        {errors[field.name] && (
          <p
            id={errorId}
            role='alert'
            className='text-destructive text-sm mt-1'
          >
            {errors[field.name]}
          </p>
        )}
      </Field>
    );
  };

  const formContent = (
    <>
      {headerField && showCard && (
        <>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              {headerField.title}
            </CardTitle>
            {headerField.subtitle && (
              <CardDescription>{headerField.subtitle}</CardDescription>
            )}
          </CardHeader>
          <Separator />
        </>
      )}

      <div className={showCard ? "" : ""}>
        <CardContent className={showCard ? "" : "p-0"}>
          <FieldGroup className={cn("", formFieldsClassName)}>
            {formFields.map(renderField)}
          </FieldGroup>
        </CardContent>
      </div>

      {buttons.length > 0 && (
        <>
          {showCard && <Separator />}
          <CardFooter
            className={cn(showCard ? "" : "p-0 pt-4", formButtonClassName)}
          >
            {buttons.map((btn, idx) => (
              <Button
                key={idx}
                variant={btn.variant || "default"}
                type='button'
                disabled={isSubmitting || disabled}
                onClick={() => {
                  if (btn.type === "submit") handleSubmit();
                  else if (btn.type === "reset") resetForm();
                  else btn.onClick?.(formData);
                }}
              >
                {isSubmitting && btn.type === "submit" && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                {btn.label}
              </Button>
            ))}
          </CardFooter>
        </>
      )}
    </>
  );

  if (!showCard) {
    return <div className={cn("w-full", formClassName)}>{formContent}</div>;
  }

  return <Card className={cn("", formClassName)}>{formContent}</Card>;
};

export default DynamicForm;
