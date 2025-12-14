import type { ButtonConfig, FieldConfig } from "@/interface/DynamicForm";

export const formConfig: { fields: FieldConfig[]; buttons: ButtonConfig[] } = {
  fields: [
    {
      name: "header",
      type: "header",
      title: "Case Entry Form",
      subtitle: "Fill out the details below",
    },
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your name",
      validation: {
        required: { value: true, message: "Full name is required" },
      },
    },

    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      validation: {
        required: { value: true, message: "Email is required" },
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Invalid email format",
        },
      },
    },

    {
      name: "age",
      label: "Age",
      type: "number",
      placeholder: "Enter your age",
      validation: {
        required: { value: true, message: "Age is required" },
      },
    },

    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe the case",
      validation: {
        required: { value: true, message: "Description is required" },
      },
    },

    {
      name: "case_type",
      label: "Case Type",
      type: "select",
      options: [
        { label: "Adjustment u/s 143(2)", value: "143_2" },
        { label: "Appeal", value: "appeal" },
        { label: "Revision", value: "revision" },
      ],
      validation: {
        required: { value: true, message: "Select case type" },
      },
    },

    {
      name: "priority",
      label: "Priority",
      type: "radio",
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      validation: {
        required: { value: true, message: "Select priority" },
      },
    },

    {
      name: "notify_user",
      label: "Notify User",
      type: "checkbox",
      validation: {
        required: { value: true, message: "Notify user is required" },
      },
    },

    {
      name: "urgent_case",
      label: "Is this case urgent?",
      type: "switch",
      validation: {
        required: { value: true, message: "Please set urgency" },
      },
    },
  ],

  buttons: [
    {
      label: "Submit",
      variant: "default",
      type: "submit",
    },
    {
      label: "Reset",
      variant: "destructive",
      type: "button",
      onClick: (data: any) => console.log("Reset clicked", data),
    },
    {
      label: "Cancel",
      variant: "outline",
      type: "button",
      onClick: () => console.log("Cancelled"),
    },
  ],
};

export const loginFormConfig: {
  fields: FieldConfig[];
  buttons: ButtonConfig[];
} = {
  fields: [
    {
      name: "header",
      type: "header",
      title: "Login",
      subtitle: "Welcome back! Please sign in to continue",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      validation: {
        required: { value: true, message: "Email is required" },
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Invalid email format",
        },
      },
    },
    {
      name: "password",
      label: "Password",
      type: "text",
      placeholder: "Enter your password",
      validation: {
        required: { value: true, message: "Password is required" },
      },
    },
    {
      name: "remember_me",
      label: "Remember Me",
      type: "checkbox",
    },
  ],

  buttons: [
    {
      label: "Login",
      variant: "default",
      type: "submit",
    },
  ],
};
