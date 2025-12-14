import { useState } from "react";
import { DynamicDialog } from "@/components/dynamic-dialog/DynamicDialog";
import { DynamicForm } from "@/components/dynamic-form/DynamicForm";
import { formConfig, loginFormConfig } from "@/data/dynamic-form/test";
import { Button } from "@/components/ui/button";
import { DynamicTabs } from "@/components/dynamic-tabs/DynamicTabs";
import type { TabItem } from "@/interface/DynamicTabs";

const tabs: TabItem[] = [
  {
    id: "details",
    label: "My Details",
    content: <div>Details</div>,
  },
  {
    id: "profile",
    label: "Profile",
    content: <div>Profile</div>,
  },
  {
    id: "settings",
    label: "Settings",
    content: <div>Settings</div>,
  },
];

const loginTabs: TabItem[] = [
  {
    id: "login",
    label: "Login",
    content: <div>Login Form</div>,
  },
  {
    id: "register",
    label: "Register",
    content: <div>Register Form</div>,
  },
  {
    id: "forgot-password",
    label: "Forgot Password",
    content: <div>Forgot Password</div>,
  },
];

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (data: any, isValid: boolean) => {
    console.log("Form submitted:", data, "Valid:", isValid);
    if (isValid) {
      alert("Form is valid! Check console for data.");
    }
  };

  return (
    <div className='mx-auto space-y-8'>
      <Button
        variant='outline'
        className='px-6 py-2 text-base font-semibold cursor-pointer'
        onClick={() => setIsOpen(true)}
      >
        Open Form Modal
      </Button>

      <DynamicDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title='Dynamic Modal Title'
        description='Enter some details below'
        dialogClassName='sm:max-w-lg w-full'
        footer={
          <>
            <Button
              variant='outline'
              className='px-4 py-2'
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      >
        <p className='text-sm text-muted-foreground'>
          This is dynamic content passed from the parent!
        </p>
      </DynamicDialog>

      <DynamicTabs tabs={tabs} defaultTabId='details' />

      <DynamicTabs tabs={loginTabs} defaultTabId='login' />

      <DynamicForm
        fields={formConfig.fields}
        buttons={formConfig.buttons}
        onSubmit={handleSubmit}
        formClassName='w-full'
        formFieldsClassName='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6'
        formButtonClassName='flex flex-wrap gap-2 justify-end'
      />

      <DynamicForm
        fields={loginFormConfig.fields}
        buttons={loginFormConfig.buttons}
        onSubmit={handleSubmit}
        formClassName='w-full'
        formFieldsClassName='flex flex-col gap-6'
        formButtonClassName='flex flex-wrap gap-2 justify-end'
      />
    </div>
  );
}

export default Dashboard;
