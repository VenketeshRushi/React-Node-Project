import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { type ButtonConfig, type FieldConfig } from "@/interface/DynamicForm";
import {
  Loader2,
  Check,
  ChevronsUpDown,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

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
        if (f.type === "checkbox" || f.type === "switch") {
          acc[f.name] = false;
        } else if (f.type === "slider") {
          acc[f.name] = f.validation?.min || 0;
        } else if (f.type === "date") {
          acc[f.name] = null;
        } else {
          acc[f.name] = "";
        }
      }
      return acc;
    },
    {} as Record<string, any>
  );

  const [formData, setFormData] = useState<Record<string, any>>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openComboboxes, setOpenComboboxes] = useState<Record<string, boolean>>(
    {}
  );
  const [openDatePickers, setOpenDatePickers] = useState<
    Record<string, boolean>
  >({});

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setOpenComboboxes({});
    setOpenDatePickers({});
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
        } else if (field.type === "date") {
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
      if (
        (value === "" || value === null || value === undefined) &&
        !rules.required?.value
      )
        return;

      // Pattern validation
      if (rules.pattern?.value && !rules.pattern.value.test(value)) {
        err[field.name] = rules.pattern.message;
        return;
      }

      // Min/Max validation for numbers and sliders
      if (field.type === "number" || field.type === "slider") {
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
    const fieldOrientation = field.orientation || "vertical";

    return (
      <Field
        key={field.name}
        data-invalid={hasError || undefined}
        orientation={fieldOrientation}
      >
        {/* Standard fields: text, email, password, number */}
        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "password" ||
          field.type === "number") && (
          <>
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
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={e => handleChange(field.name, e.target.value)}
              disabled={isDisabled}
              aria-invalid={hasError}
              min={field.type === "number" ? field.validation?.min : undefined}
              max={field.type === "number" ? field.validation?.max : undefined}
            />
            {field.helperText && !hasError && (
              <FieldDescription>{field.helperText}</FieldDescription>
            )}
            {hasError && <FieldError>{errors[field.name]}</FieldError>}
          </>
        )}

        {/* Textarea */}
        {field.type === "textarea" && (
          <>
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
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={e => handleChange(field.name, e.target.value)}
              disabled={isDisabled}
              rows={field.rows || 4}
              aria-invalid={hasError}
            />
            {field.helperText && !hasError && (
              <FieldDescription>{field.helperText}</FieldDescription>
            )}
            {hasError && <FieldError>{errors[field.name]}</FieldError>}
          </>
        )}

        {/* Select - Using Combobox for searchability */}
        {field.type === "select" && (
          <>
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
            <Popover
              open={openComboboxes[field.name] || false}
              onOpenChange={open =>
                setOpenComboboxes({ ...openComboboxes, [field.name]: open })
              }
            >
              <PopoverTrigger asChild>
                <Button
                  id={field.name}
                  variant='outline'
                  role='combobox'
                  aria-expanded={openComboboxes[field.name] || false}
                  aria-invalid={hasError}
                  disabled={isDisabled}
                  className={cn(
                    "w-full justify-between",
                    !formData[field.name] && "text-muted-foreground",
                    hasError && "border-destructive"
                  )}
                >
                  {formData[field.name]
                    ? field.options?.find(
                        opt => opt.value === formData[field.name]
                      )?.label
                    : field.placeholder || "Select an option"}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='p-0 w-(--radix-popover-trigger-width)'
                align='start'
              >
                <Command>
                  <CommandInput
                    placeholder={`Search ${field.label?.toLowerCase() || "options"}...`}
                    className='h-9'
                  />
                  <CommandList>
                    <CommandEmpty>No option found.</CommandEmpty>
                    <CommandGroup>
                      {field.options?.map(opt => (
                        <CommandItem
                          key={opt.value}
                          value={opt.value}
                          onSelect={currentValue => {
                            handleChange(
                              field.name,
                              currentValue === formData[field.name]
                                ? ""
                                : currentValue
                            );
                            setOpenComboboxes({
                              ...openComboboxes,
                              [field.name]: false,
                            });
                          }}
                        >
                          {opt.label}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              formData[field.name] === opt.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {field.helperText && !hasError && (
              <FieldDescription>{field.helperText}</FieldDescription>
            )}
            {hasError && <FieldError>{errors[field.name]}</FieldError>}
          </>
        )}

        {/* Radio */}
        {field.type === "radio" && (
          <>
            <FieldLabel>
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
            {field.helperText && !hasError && (
              <FieldDescription>{field.helperText}</FieldDescription>
            )}
            <RadioGroup
              onValueChange={v => handleChange(field.name, v)}
              value={formData[field.name]}
              disabled={isDisabled}
              aria-invalid={hasError}
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
            {hasError && <FieldError>{errors[field.name]}</FieldError>}
          </>
        )}

        {/* Checkbox */}
        {field.type === "checkbox" && (
          <>
            <div className='flex items-start gap-2'>
              <Checkbox
                id={field.name}
                checked={!!formData[field.name]}
                onCheckedChange={v => handleChange(field.name, v)}
                disabled={isDisabled}
                aria-invalid={hasError}
                className='mt-1'
              />

              <FieldContent>
                <FieldLabel
                  className='cursor-pointer select-none'
                  onClick={() =>
                    !isDisabled &&
                    handleChange(field.name, !formData[field.name])
                  }
                >
                  {field.label}
                  {field.validation?.required?.value && (
                    <span className='text-destructive'> *</span>
                  )}
                </FieldLabel>

                {field.helperText && !hasError && (
                  <FieldDescription>{field.helperText}</FieldDescription>
                )}
              </FieldContent>
            </div>

            {hasError && <FieldError>{errors[field.name]}</FieldError>}
          </>
        )}

        {/* Switch */}
        {field.type === "switch" && (
          <>
            <div className='flex items-center justify-between flex-1 gap-4'>
              <FieldContent>
                <FieldLabel
                  className='cursor-pointer select-none'
                  onClick={() =>
                    !isDisabled &&
                    handleChange(field.name, !formData[field.name])
                  }
                >
                  {field.label}
                  {field.validation?.required?.value && (
                    <span className='text-destructive'> *</span>
                  )}
                </FieldLabel>

                {field.helperText && !hasError && (
                  <FieldDescription>{field.helperText}</FieldDescription>
                )}
              </FieldContent>

              <Switch
                checked={!!formData[field.name]}
                onCheckedChange={v => handleChange(field.name, v)}
                disabled={isDisabled}
                aria-invalid={hasError}
              />
            </div>

            {hasError && <FieldError>{errors[field.name]}</FieldError>}
          </>
        )}

        {/* Slider */}
        {field.type === "slider" && (
          <FieldContent>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                {field.icon && <field.icon className='h-4 w-4' />}
                <FieldLabel htmlFor={field.name}>
                  {field.label}
                  {field.validation?.required?.value && (
                    <span className='text-destructive'> *</span>
                  )}
                </FieldLabel>
              </div>
              {field.showValue !== false && (
                <Badge
                  className='h-7 min-w-7 font-bold text-primary-foreground rounded-full px-1 tabular-nums'
                  variant='secondary'
                >
                  {formData[field.name]}
                </Badge>
              )}
            </div>

            <Slider
              id={field.name}
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              step={field.step || 1}
              value={[formData[field.name]]}
              onValueChange={([value]) => handleChange(field.name, value)}
              disabled={isDisabled}
              aria-invalid={hasError}
              className='mt-2'
            />

            {field.helperText && !hasError && (
              <FieldDescription>{field.helperText}</FieldDescription>
            )}
            {hasError && <FieldError>{errors[field.name]}</FieldError>}
          </FieldContent>
        )}

        {/* Date Picker */}
        {field.type === "date" && (
          <FieldContent>
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
            <Popover
              open={openDatePickers[field.name] || false}
              onOpenChange={open =>
                setOpenDatePickers({ ...openDatePickers, [field.name]: open })
              }
            >
              <PopoverTrigger asChild>
                <Button
                  id={field.name}
                  variant='outline'
                  disabled={isDisabled}
                  aria-invalid={hasError}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData[field.name] && "text-muted-foreground",
                    hasError && "border-destructive"
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {formData[field.name] ? (
                    format(formData[field.name], field.dateFormat || "PPP")
                  ) : (
                    <span>{field.placeholder || "Pick a date"}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={formData[field.name]}
                  onSelect={date => {
                    handleChange(field.name, date);
                    setOpenDatePickers({
                      ...openDatePickers,
                      [field.name]: false,
                    });
                  }}
                  disabled={date => {
                    if (isDisabled) return true;
                    if (
                      field.disablePastDates &&
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    ) {
                      return true;
                    }
                    if (
                      field.disableFutureDates &&
                      date > new Date(new Date().setHours(23, 59, 59, 999))
                    ) {
                      return true;
                    }
                    return false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {field.helperText && !hasError && (
              <FieldDescription>{field.helperText}</FieldDescription>
            )}
            {hasError && <FieldError>{errors[field.name]}</FieldError>}
          </FieldContent>
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

      <CardContent className={!showCard ? "p-0" : undefined}>
        <FieldGroup className={formFieldsClassName}>
          {formFields.map(renderField)}
        </FieldGroup>
      </CardContent>

      {buttons.length > 0 && (
        <>
          {showCard && <Separator />}
          <CardFooter
            className={cn(!showCard && "p-0 pt-4", formButtonClassName)}
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

  return <Card className={formClassName}>{formContent}</Card>;
};

export default DynamicForm;
