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

interface DynamicFormProps {
  fields: FieldConfig[];
  buttons?: ButtonConfig[];
  onSubmit?: (formData: any, isValid: boolean) => void;
  formClassName?: string;
  formFieldsClassName?: string;
  formButtonClassName?: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields = [],
  buttons = [],
  onSubmit,
  formClassName,
  formFieldsClassName,
  formButtonClassName,
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
      if (rules.required?.value && !value) {
        err[field.name] = rules.required.message;
        return;
      }
      if (!value) return;
      if (rules.pattern?.value && !rules.pattern.value.test(value)) {
        err[field.name] = rules.pattern.message;
        return;
      }
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
    const isDisabled = field.disabled || false;
    const errorId = `${field.name}-error`;

    return (
      <Field className='mb-4' key={field.name}>
        {field.label &&
          field.type !== "checkbox" &&
          field.type !== "switch" && (
            <FieldLabel htmlFor={field.name}>
              {field.label}
              {field.validation?.required?.value && (
                <span className='text-destructive'> *</span>
              )}
            </FieldLabel>
          )}
        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "number" ||
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
            aria-describedby={hasError ? errorId : undefined}
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
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
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
              aria-describedby={hasError ? errorId : undefined}
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
            aria-describedby={hasError ? errorId : undefined}
          >
            <div className='flex flex-row items-center space-x-6'>
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
          <div className='flex items-center space-x-2'>
            <Checkbox
              id={field.name}
              checked={!!formData[field.name]}
              onCheckedChange={v => handleChange(field.name, v)}
              disabled={isDisabled}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        )}
        {field.type === "switch" && (
          <div className='flex items-center space-x-2'>
            <Switch
              id={field.name}
              checked={!!formData[field.name]}
              onCheckedChange={v => handleChange(field.name, v)}
              disabled={isDisabled}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : undefined}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
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

  return (
    <Card className={cn("", formClassName)}>
      {headerField && (
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
      <CardContent>
        <FieldGroup className={cn("", formFieldsClassName)}>
          {formFields.map(renderField)}
        </FieldGroup>
      </CardContent>
      {buttons.length > 0 && (
        <>
          <Separator />
          <CardFooter className={cn("", formButtonClassName)}>
            {buttons.map((btn, idx) => (
              <Button
                key={idx}
                variant={btn.variant || "default"}
                type='button'
                onClick={() => {
                  if (btn.type === "submit") handleSubmit();
                  else if (btn.label.toLowerCase() === "reset") resetForm();
                  else btn.onClick?.(formData);
                }}
              >
                {btn.label}
              </Button>
            ))}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default DynamicForm;
