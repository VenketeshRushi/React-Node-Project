import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicForm } from "@/components/dynamic-form/DynamicForm";
import type { ButtonConfig, FieldConfig } from "@/interface/DynamicForm";
import { useAuthStore, useUser } from "@/stores/auth.store";
import { useToast } from "@/hooks/use-toast";

const INDIAN_STATES_AND_UTS = [
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" },

  // 8 Union Territories
  {
    label: "Andaman and Nicobar Islands",
    value: "Andaman and Nicobar Islands",
  },
  { label: "Chandigarh", value: "Chandigarh" },
  {
    label: "Dadra and Nagar Haveli and Daman and Diu",
    value: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { label: "Delhi (NCT)", value: "Delhi" },
  { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
  { label: "Ladakh", value: "Ladakh" },
  { label: "Lakshadweep", value: "Lakshadweep" },
  { label: "Puducherry", value: "Puducherry" },
];

const MAJOR_INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Ahmedabad",
  "Pune",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Kalyan-Dombivli",
  "Vasai-Virar",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Navi Mumbai",
  "Prayagraj",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Raipur",
  "Kota",
  "Guwahati",
  "Chandigarh",
  "Solapur",
];

const buttons: ButtonConfig[] = [
  {
    label: "Complete Setup",
    variant: "default",
    type: "submit",
  },
  {
    label: "Reset Form",
    variant: "outline",
    type: "reset",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const { successToast, errorToast } = useToast();
  const user = useUser();
  const { updateUser, isOnboardingComplete } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFields, setFormFields] = useState<FieldConfig[]>([]);

  useEffect(() => {
    if (isOnboardingComplete()) {
      navigate("/dashboard", { replace: true });
    }
  }, [isOnboardingComplete, navigate]);

  useEffect(() => {
    if (user) {
      const fields: FieldConfig[] = [
        {
          name: "header",
          type: "header",
          title: "Complete Your Profile",
          subtitle: "Tell us a bit more to get started",
        },
        {
          name: "name",
          label: "Full Name",
          type: "text",
          placeholder: "Enter your name",
          defaultValue: user.name || "",
          helperText: "This is your display name across the platform",
          validation: {
            required: { value: true, message: "Name is required" },
            custom: (value: string) => {
              if (value && value.length < 3) {
                return "Name must be at least 3 characters";
              }
              return null;
            },
          },
          disabled: true,
        },
        {
          name: "profession",
          label: "Profession",
          type: "text",
          placeholder: "e.g., Software Engineer, Chartered Accountant",
          helperText: "Your current job title or profession",
          defaultValue: user.profession || "",
          validation: {
            required: { value: true, message: "Profession is required" },
            custom: (value: string) => {
              if (value && value.length < 2) {
                return "Profession must be at least 2 characters";
              }
              return null;
            },
          },
        },
        {
          name: "company",
          label: "Company / Organization",
          type: "text",
          placeholder: "e.g., Acme Inc., Self-Employed",
          helperText: "Where do you currently work?",
          defaultValue: user.company || "",
          validation: {
            required: { value: true, message: "Company is required" },
          },
        },
        {
          name: "address",
          label: "Street Address",
          type: "textarea",
          placeholder: "Enter your complete address",
          helperText: "Include building name, street, and area",
          rows: 3,
          defaultValue: user.address || "",
          validation: {
            required: { value: true, message: "Address is required" },
            custom: (value: string) => {
              if (value && value.length < 10) {
                return "Please provide a complete address";
              }
              return null;
            },
          },
        },
        {
          name: "city",
          label: "City",
          type: "select",
          placeholder: "Select your city",
          helperText: "Choose from major Indian cities",
          options: MAJOR_INDIAN_CITIES.map(c => ({ label: c, value: c })),
          defaultValue: user.city || "",
          validation: {
            required: { value: true, message: "City is required" },
          },
        },
        {
          name: "state",
          label: "State / Union Territory",
          type: "select",
          placeholder: "Select your state",
          helperText: "Select your state or UT",
          options: INDIAN_STATES_AND_UTS,
          defaultValue: user.state || "",
          validation: {
            required: { value: true, message: "State is required" },
          },
        },
        {
          name: "country",
          label: "Country",
          type: "select",
          options: [{ label: "India", value: "India" }],
          defaultValue: "India",
          helperText: "Currently available only in India",
          disabled: true,
          validation: {
            required: { value: true, message: "Country is required" },
          },
        },
        {
          name: "timezone",
          label: "Timezone",
          type: "select",
          options: [{ label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" }],
          defaultValue: "Asia/Kolkata",
          helperText: "Indian Standard Time (IST)",
          disabled: true,
          validation: {
            required: { value: true, message: "Select a timezone" },
          },
        },
        {
          name: "language",
          label: "Preferred Language",
          type: "select",
          placeholder: "Select your language",
          helperText: "Choose your preferred communication language",
          options: [
            { label: "English", value: "en" },
            { label: "Hindi", value: "hi" },
            { label: "Telugu", value: "te" },
            { label: "Tamil", value: "ta" },
            { label: "Kannada", value: "kn" },
            { label: "Malayalam", value: "ml" },
            { label: "Marathi", value: "mr" },
            { label: "Gujarati", value: "gu" },
            { label: "Bengali", value: "bn" },
            { label: "Punjabi", value: "pa" },
          ],
          defaultValue: user.language || "en",
          validation: {
            required: { value: true, message: "Select a language" },
          },
        },
      ];

      setFormFields(fields);
    }
  }, [user]);

  const handleSubmit = async (data: Record<string, any>, isValid: boolean) => {
    if (!isValid || !user) {
      errorToast("Please fill in all required fields correctly");
      return;
    }

    try {
      setIsSubmitting(true);

      await new Promise(resolve => setTimeout(resolve, 1500));

      updateUser({
        profession: data.profession,
        company: data.company,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || "India",
        timezone: data.timezone || "Asia/Kolkata",
        language: data.language || "en",
        onboarding: false,
      });

      successToast("Profile completed successfully");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || formFields.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-2'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto' />
          <p className='text-sm text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <DynamicForm
        fields={formFields}
        buttons={buttons}
        onSubmit={handleSubmit}
        showCard={true}
        isSubmitting={isSubmitting}
        formClassName='w-full'
        formFieldsClassName='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6'
        formButtonClassName='flex flex-wrap gap-4 justify-end'
      />
    </div>
  );
}

export default Onboarding;
