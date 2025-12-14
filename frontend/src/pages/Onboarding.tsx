import { useNavigate } from "react-router-dom";
import { DynamicForm } from "@/components/dynamic-form/DynamicForm";
import type { ButtonConfig, FieldConfig } from "@/interface/DynamicForm";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Updated onboarding form for India-only users:
 * - country: fixed to "India"
 * - timezone: only "Asia/Kolkata"
 * - state: all 28 states + 8 union territories
 * - city: list of common/major Indian cities
 *
 * Sources: list of states/UTs and cities (Wikipedia / Census lists).
 * See: States & UTs of India; Cities by population; India timezone (Asia/Kolkata).
 */

const INDIAN_STATES_AND_UTS = [
  // 28 States
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
const onboardingFormConfig: {
  fields: FieldConfig[];
  buttons: ButtonConfig[];
} = {
  fields: [
    {
      name: "header",
      type: "header",
      title: "Complete Your Profile",
      subtitle: "Tell us a bit more to get started",
    },

    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Enter your name",
      validation: {
        required: { value: true, message: "Name is required" },
      },
      disabled: true,
    },

    {
      name: "profession",
      label: "Profession",
      type: "text",
      placeholder: "Enter your profession",
      validation: {
        required: { value: true, message: "Profession is required" },
      },
    },

    {
      name: "company",
      label: "Company",
      type: "text",
      placeholder: "Enter your company",
      validation: {
        required: { value: true, message: "Company is required" },
      },
    },

    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter address",
      validation: {
        required: { value: true, message: "Address is required" },
      },
    },

    {
      name: "city",
      label: "City",
      type: "select",
      options: MAJOR_INDIAN_CITIES.map(c => ({ label: c, value: c })),
      validation: {
        required: { value: true, message: "City is required" },
      },
    },

    {
      name: "state",
      label: "State / Union Territory",
      type: "select",
      options: INDIAN_STATES_AND_UTS,
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
      disabled: true,
      validation: {
        required: { value: true, message: "Select a timezone" },
      },
    },

    {
      name: "language",
      label: "Preferred Language",
      type: "select",
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
      defaultValue: "en",
      validation: {
        required: { value: true, message: "Select a language" },
      },
    },
  ],

  buttons: [
    {
      label: "Save",
      variant: "default",
      type: "submit",
    },
    {
      label: "Reset",
      variant: "destructive",
      type: "button",
    },
  ],
};

function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const handleSubmit = async (data: Record<string, any>, isValid: boolean) => {
    if (!isValid || !user) return;

    try {
      // ensure defaults
      const finalData = {
        ...data,
        country: data.country || "India",
        timezone: data.timezone || "Asia/Kolkata",
        onboarding: false,
      };

      setUser({
        ...user,
        ...finalData,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding failed:", error);
    }
  };

  return (
    <div className='mr-auto lg:max-w-4xl space-y-8'>
      <DynamicForm
        fields={onboardingFormConfig.fields}
        buttons={onboardingFormConfig.buttons}
        onSubmit={handleSubmit}
        formClassName='w-full'
        formFieldsClassName='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2'
        formButtonClassName='flex flex-wrap gap-4 justify-end'
      />
    </div>
  );
}

export default Onboarding;
