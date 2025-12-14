import React from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

const toasterConfig = {
  position: "top-right" as const,
  reverseOrder: false,
  gutter: 8,
  toastOptions: {
    duration: 4000,
    style: {
      background: "var(--background)",
      color: "var(--foreground)",
      borderRadius: "8px",
      padding: "12px 16px",
      border: "1px solid var(--border)",
      fontSize: "14px",
    },
  },
};

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme='system' storageKey='app-ui-theme'>
      {children}
      <Toaster {...toasterConfig} />
    </ThemeProvider>
  );
}
