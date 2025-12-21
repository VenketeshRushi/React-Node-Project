import { useState } from "react";
import { DynamicDialog } from "@/components/dynamic-dialog/DynamicDialog";
import { DynamicAlertDialog } from "@/components/dynamic-alert-dialog/DynamicAlertDialog";
import { DynamicForm } from "@/components/dynamic-form/DynamicForm";
import { formConfig } from "@/data/dynamic-form/test";
import { Button } from "@/components/ui/button";
import { DynamicTabs } from "@/components/dynamic-tabs/DynamicTabs";
import type { TabItem } from "@/interface/DynamicTabs";
import { DynamicSheet } from "@/components/dynamic-sheet/DynamicSheet";
import {
  Settings,
  User,
  Bell,
  MessageSquare,
  FileText,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

function Dashboard() {
  // Dialog states
  const [basicDialogOpen, setBasicDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // AlertDialog states
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);

  // Sheet states
  const [rightSheetOpen, setRightSheetOpen] = useState(false);
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [formSheetOpen, setFormSheetOpen] = useState(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tabs data
  const basicTabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Overview Tab</h3>
          <p className='text-muted-foreground'>
            This is the overview content. You can put any React component here.
          </p>
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      content: (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Analytics Tab</h3>
          <p className='text-muted-foreground'>
            Analytics data and charts would go here.
          </p>
        </div>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      content: (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Reports Tab</h3>
          <p className='text-muted-foreground'>
            Generate and view reports in this section.
          </p>
        </div>
      ),
    },
  ];

  const iconTabs: TabItem[] = [
    {
      id: "profile",
      label: (
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4' />
          <span>Profile</span>
        </div>
      ),
      content: (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Profile Settings</h3>
          <p className='text-muted-foreground'>
            Update your profile information here.
          </p>
        </div>
      ),
    },
    {
      id: "notifications",
      label: (
        <div className='flex items-center gap-2'>
          <Bell className='h-4 w-4' />
          <span>Notifications</span>
        </div>
      ),
      content: (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Notification Preferences</h3>
          <p className='text-muted-foreground'>
            Manage your notification settings.
          </p>
        </div>
      ),
    },
    {
      id: "settings",
      label: (
        <div className='flex items-center gap-2'>
          <Settings className='h-4 w-4' />
          <span>Settings</span>
        </div>
      ),
      content: (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>General Settings</h3>
          <p className='text-muted-foreground'>
            Configure your account settings.
          </p>
        </div>
      ),
    },
  ];

  const handleFormSubmit = async (data: any, isValid: boolean) => {
    console.log("Form submitted:", data, "Valid:", isValid);
    if (isValid) {
      setIsSubmitting(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSubmitting(false);
      setSuccessAlertOpen(true);
      setFormDialogOpen(false);
      setFormSheetOpen(false);
    }
  };

  const handleConfirmAction = () => {
    alert("Action confirmed!");
    setConfirmDialogOpen(false);
  };

  const handleDelete = () => {
    alert("Item deleted successfully!");
    setDeleteAlertOpen(false);
  };

  const handleLogout = () => {
    alert("Logged out successfully!");
    setLogoutAlertOpen(false);
  };

  return (
    <div className='container mx-auto p-6 space-y-12'>
      {/* Page Header */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Dynamic Components Showcase
        </h1>
        <p className='text-muted-foreground'>
          Examples and demonstrations of reusable dynamic components
        </p>
      </div>

      {/* AlertDialog Examples Section */}
      <section className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>AlertDialog Examples</h2>
          <p className='text-sm text-muted-foreground'>
            Alert dialogs for critical actions and confirmations
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Delete AlertDialog */}
          <div className='p-6 border rounded-lg space-y-3'>
            <div className='flex items-center gap-2'>
              <Trash2 className='h-5 w-5 text-destructive' />
              <h3 className='font-semibold'>Destructive Action</h3>
            </div>
            <p className='text-sm text-muted-foreground'>
              Alert for delete operations
            </p>
            <Button
              variant='destructive'
              className='w-full'
              onClick={() => setDeleteAlertOpen(true)}
            >
              Delete Item
            </Button>
          </div>

          {/* Logout AlertDialog */}
          <div className='p-6 border rounded-lg space-y-3'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-amber-500' />
              <h3 className='font-semibold'>Confirmation Alert</h3>
            </div>
            <p className='text-sm text-muted-foreground'>
              Alert for logout confirmation
            </p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => setLogoutAlertOpen(true)}
            >
              Logout
            </Button>
          </div>

          {/* Success AlertDialog */}
          <div className='p-6 border rounded-lg space-y-3'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <h3 className='font-semibold'>Success Alert</h3>
            </div>
            <p className='text-sm text-muted-foreground'>
              Alert for success messages
            </p>
            <Button
              variant='default'
              className='w-full'
              onClick={() => setSuccessAlertOpen(true)}
            >
              Show Success
            </Button>
          </div>
        </div>

        {/* AlertDialog Components */}
        <DynamicAlertDialog
          open={deleteAlertOpen}
          onOpenChange={setDeleteAlertOpen}
          title='Are you absolutely sure?'
          description='This action cannot be undone. This will permanently delete your data from our servers.'
          actionText='Delete'
          cancelText='Cancel'
          actionVariant='destructive'
          onAction={handleDelete}
          onCancel={() => setDeleteAlertOpen(false)}
        >
          <div className='p-4 bg-destructive/10 border border-destructive/20 rounded-md'>
            <p className='text-sm text-destructive font-medium'>
              ⚠️ Warning: This is a destructive action
            </p>
          </div>
        </DynamicAlertDialog>

        <DynamicAlertDialog
          open={logoutAlertOpen}
          onOpenChange={setLogoutAlertOpen}
          title='Logout Confirmation'
          description='Are you sure you want to logout? Any unsaved changes will be lost.'
          actionText='Logout'
          cancelText='Stay Logged In'
          onAction={handleLogout}
          onCancel={() => setLogoutAlertOpen(false)}
        />

        <DynamicAlertDialog
          open={successAlertOpen}
          onOpenChange={setSuccessAlertOpen}
          title='Success!'
          description='Your form has been submitted successfully.'
          actionText='Okay'
          cancelText='Close'
          onAction={() => setSuccessAlertOpen(false)}
          onCancel={() => setSuccessAlertOpen(false)}
        >
          <div className='flex items-center justify-center py-4'>
            <CheckCircle className='h-16 w-16 text-green-500' />
          </div>
        </DynamicAlertDialog>
      </section>

      {/* Dialog Examples Section */}
      <section className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Dialog Examples</h2>
          <p className='text-sm text-muted-foreground'>
            Modal dialogs for various use cases
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Basic Dialog */}
          <div className='p-6 border rounded-lg space-y-3'>
            <h3 className='font-semibold'>Basic Dialog</h3>
            <p className='text-sm text-muted-foreground'>
              Simple dialog with content
            </p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => setBasicDialogOpen(true)}
            >
              Open Basic Dialog
            </Button>
          </div>

          {/* Form Dialog */}
          <div className='p-6 border rounded-lg space-y-3'>
            <h3 className='font-semibold'>Form Dialog</h3>
            <p className='text-sm text-muted-foreground'>
              Dialog with form inside
            </p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => setFormDialogOpen(true)}
            >
              Open Form Dialog
            </Button>
          </div>

          {/* Confirmation Dialog */}
          <div className='p-6 border rounded-lg space-y-3'>
            <h3 className='font-semibold'>Confirmation Dialog</h3>
            <p className='text-sm text-muted-foreground'>
              Dialog with action buttons
            </p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => setConfirmDialogOpen(true)}
            >
              Open Confirmation
            </Button>
          </div>
        </div>

        {/* Dialog Components */}
        <DynamicDialog
          open={basicDialogOpen}
          onOpenChange={setBasicDialogOpen}
          title='Basic Dialog Example'
          description='This is a simple dialog with custom content'
        >
          <div className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              This dialog demonstrates basic usage with a title, description,
              and custom content. You can put any React component here.
            </p>
            <div className='p-4 bg-muted rounded-md'>
              <p className='text-sm'>
                This is some highlighted content inside the dialog.
              </p>
            </div>
          </div>
        </DynamicDialog>

        <DynamicDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          title='Submit Your Information'
          description='Please fill out the form below'
          dialogClassName='sm:max-w-2xl'
        >
          <DynamicForm
            fields={formConfig.fields}
            buttons={formConfig.buttons}
            onSubmit={handleFormSubmit}
            showCard={false}
            isSubmitting={isSubmitting}
            formClassName='w-full'
            formFieldsClassName='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'
            formButtonClassName='flex gap-2 justify-end'
          />
        </DynamicDialog>

        <DynamicDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          title='Confirm Action'
          description='Are you sure you want to proceed with this action?'
          footer={
            <div className='flex gap-2 w-full sm:w-auto'>
              <Button
                variant='outline'
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmAction}>Confirm</Button>
            </div>
          }
        >
          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              This action cannot be undone. This will permanently delete your
              data and remove it from our servers.
            </p>
            <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
              <p className='text-sm text-destructive font-medium'>
                ⚠️ Warning: This is a destructive action
              </p>
            </div>
          </div>
        </DynamicDialog>
      </section>

      {/* Sheet Examples Section */}
      <section className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Sheet Examples</h2>
          <p className='text-sm text-muted-foreground'>
            Side panels from different directions
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Right Sheet */}
          <div className='p-6 border rounded-lg space-y-3'>
            <h3 className='font-semibold'>Right Sheet</h3>
            <p className='text-sm text-muted-foreground'>
              Sheet sliding from right
            </p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => setRightSheetOpen(true)}
            >
              Open Right Sheet
            </Button>
          </div>

          {/* Left Sheet */}
          <div className='p-6 border rounded-lg space-y-3'>
            <h3 className='font-semibold'>Left Sheet</h3>
            <p className='text-sm text-muted-foreground'>
              Sheet sliding from left
            </p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => setLeftSheetOpen(true)}
            >
              Open Left Sheet
            </Button>
          </div>

          {/* Form Sheet */}
          <div className='p-6 border rounded-lg space-y-3'>
            <h3 className='font-semibold'>Form Sheet</h3>
            <p className='text-sm text-muted-foreground'>
              Sheet with form content
            </p>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => setFormSheetOpen(true)}
            >
              Open Form Sheet
            </Button>
          </div>
        </div>

        {/* Sheet Components */}
        <DynamicSheet
          open={rightSheetOpen}
          onOpenChange={setRightSheetOpen}
          title='User Settings'
          description='Manage your account settings and preferences'
          side='right'
          footer={
            <Button onClick={() => setRightSheetOpen(false)} className='w-full'>
              Save Changes
            </Button>
          }
        >
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h4 className='font-medium'>Account Information</h4>
              <p className='text-sm text-muted-foreground'>
                Update your account details here. This sheet slides from the
                right side.
              </p>
            </div>
            <div className='space-y-4'>
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className='p-4 border rounded-md'>
                  <p className='text-sm'>Setting option {item}</p>
                </div>
              ))}
            </div>
          </div>
        </DynamicSheet>

        <DynamicSheet
          open={leftSheetOpen}
          onOpenChange={setLeftSheetOpen}
          title='Navigation Menu'
          description='Quick access to all sections'
          side='left'
        >
          <div className='space-y-2'>
            {[
              { icon: FileText, label: "Documents" },
              { icon: MessageSquare, label: "Messages" },
              { icon: User, label: "Profile" },
              { icon: Settings, label: "Settings" },
              { icon: Bell, label: "Notifications" },
            ].map((item, index) => (
              <Button
                key={index}
                variant='ghost'
                className='w-full justify-start'
                onClick={() => setLeftSheetOpen(false)}
              >
                <item.icon className='mr-2 h-4 w-4' />
                {item.label}
              </Button>
            ))}
          </div>
        </DynamicSheet>

        <DynamicSheet
          open={formSheetOpen}
          onOpenChange={setFormSheetOpen}
          title='Add New Entry'
          description='Fill out the form to create a new entry'
          side='right'
        >
          <DynamicForm
            fields={formConfig.fields}
            buttons={formConfig.buttons}
            onSubmit={handleFormSubmit}
            showCard={false}
            isSubmitting={isSubmitting}
            formClassName='w-full'
            formFieldsClassName='space-y-4'
            formButtonClassName='flex gap-2 justify-end'
          />
        </DynamicSheet>
      </section>

      {/* Tabs Examples Section */}
      <section className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Tabs Examples</h2>
          <p className='text-sm text-muted-foreground'>
            Tabbed navigation for organizing content
          </p>
        </div>

        <div className='space-y-6'>
          {/* Basic Tabs */}
          <div className='p-6 border rounded-lg space-y-4'>
            <div>
              <h3 className='font-semibold mb-1'>Basic Tabs</h3>
              <p className='text-sm text-muted-foreground'>
                Simple tabs with text labels
              </p>
            </div>
            <DynamicTabs tabs={basicTabs} defaultTabId='overview' />
          </div>

          {/* Icon Tabs */}
          <div className='p-6 border rounded-lg space-y-4'>
            <div>
              <h3 className='font-semibold mb-1'>Tabs with Icons</h3>
              <p className='text-sm text-muted-foreground'>
                Tabs with icons and labels
              </p>
            </div>
            <DynamicTabs
              tabs={iconTabs}
              defaultTabId='profile'
              onTabChange={tabId => console.log("Tab changed to:", tabId)}
            />
          </div>
        </div>
      </section>

      {/* Form Example Section */}
      <section className='space-y-4'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Standalone Form Example</h2>
          <p className='text-sm text-muted-foreground'>
            Dynamic form with validation and card wrapper
          </p>
        </div>

        <DynamicForm
          fields={formConfig.fields}
          buttons={formConfig.buttons}
          onSubmit={handleFormSubmit}
          showCard={true}
          isSubmitting={isSubmitting}
          formClassName='w-full'
          formFieldsClassName='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6'
          formButtonClassName='flex flex-wrap gap-2 justify-end'
        />
      </section>
    </div>
  );
}

export default Dashboard;
