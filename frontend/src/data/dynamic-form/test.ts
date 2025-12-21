import type { ButtonConfig, FieldConfig } from "@/interface/DynamicForm";
import { User, Mail, Hash, FileText, Briefcase } from "lucide-react";

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
      name: "notify_user",
      label: "Send me email notifications",
      type: "checkbox",
      helperText: "Receive updates about your case via email",
    },
    {
      name: "urgent_case",
      label: "Mark as urgent",
      type: "switch",
      helperText: "Cases marked urgent receive priority processing",
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
