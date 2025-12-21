import type { ButtonConfig, FieldConfig } from "@/interface/DynamicForm";
import {
  User,
  Mail,
  Hash,
  FileText,
  Briefcase,
  TrendingUp,
  Calendar as CalendarIcon,
} from "lucide-react";

export const formConfig: { fields: FieldConfig[]; buttons: ButtonConfig[] } = {
  fields: [
    {
      name: "header",
      type: "header",
      title: "Case Entry Form",
      subtitle: "Fill out the details below to create a new case",
    },
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      icon: User,
      helperText: "Your legal name as it appears on official documents",
      validation: {
        required: { value: true, message: "Full name is required" },
        custom: (value: string) => {
          if (value && value.length < 3) {
            return "Name must be at least 3 characters";
          }
          return null;
        },
      },
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      icon: Mail,
      helperText: "We'll use this email for important case updates",
      validation: {
        required: { value: true, message: "Email is required" },
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Please enter a valid email address",
        },
      },
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      placeholder: "Enter your age",
      icon: Hash,
      helperText: "Must be 18 or older to submit a case",
      validation: {
        required: { value: true, message: "Age is required" },
        min: 18,
        max: 120,
        minMessage: "You must be at least 18 years old",
        maxMessage: "Please enter a valid age",
      },
    },
    {
      name: "case_date",
      label: "Case Filing Date",
      type: "date",
      icon: CalendarIcon,
      placeholder: "Select filing date",
      helperText: "The date when this case was filed",
      dateFormat: "PPP", // e.g., "April 29, 2024"
      disableFutureDates: true,
      validation: {
        required: { value: true, message: "Filing date is required" },
      },
    },
    {
      name: "hearing_date",
      label: "Next Hearing Date",
      type: "date",
      icon: CalendarIcon,
      placeholder: "Select hearing date",
      helperText: "Schedule the next hearing date",
      dateFormat: "PPP",
      disablePastDates: true,
    },
    {
      name: "description",
      label: "Case Description",
      type: "textarea",
      placeholder: "Provide a detailed description of the case",
      icon: FileText,
      rows: 5,
      helperText: "Include all relevant details and background information",
      validation: {
        required: { value: true, message: "Description is required" },
        custom: (value: string) => {
          if (value && value.length < 50) {
            return "Description must be at least 50 characters";
          }
          return null;
        },
      },
    },
    {
      name: "case_type",
      label: "Case Type",
      type: "select",
      icon: Briefcase,
      placeholder: "Select case type",
      helperText: "Choose the category that best fits your case",
      options: [
        { label: "Adjustment u/s 143(2)", value: "143_2" },
        { label: "Appeal", value: "appeal" },
        { label: "Revision", value: "revision" },
      ],
      validation: {
        required: { value: true, message: "Please select a case type" },
      },
    },
    {
      name: "priority",
      label: "Priority Level",
      type: "radio",
      helperText: "Select the urgency level for this case",
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      validation: {
        required: { value: true, message: "Please select a priority level" },
      },
      defaultValue: "medium",
    },
    {
      name: "complexity_score",
      label: "Case Complexity Score",
      type: "slider",
      icon: TrendingUp,
      helperText: "Rate the complexity of this case (1-10)",
      showValue: true,
      step: 1,
      defaultValue: 5,
      validation: {
        min: 1,
        max: 10,
        required: { value: true, message: "Complexity score is required" },
      },
    },
    {
      name: "effort_hours",
      label: "Estimated Effort (Hours)",
      type: "slider",
      helperText: "Estimated hours needed to complete this case",
      showValue: true,
      step: 5,
      defaultValue: 10,
      validation: {
        min: 0,
        max: 200,
      },
    },
    {
      name: "notify_user",
      label: "Send me email notifications",
      type: "checkbox",
      helperText: "Receive updates about your case via email",
      orientation: "horizontal",
    },
    {
      name: "urgent_case",
      label: "Mark as urgent",
      type: "switch",
      helperText: "Cases marked urgent receive priority processing",
      orientation: "horizontal",
    },
  ],

  buttons: [
    {
      label: "Submit Case",
      variant: "default",
      type: "submit",
    },
    {
      label: "Reset Form",
      variant: "outline",
      type: "reset",
    },
  ],
};
