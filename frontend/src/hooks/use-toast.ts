import toast, { type ToastOptions } from "react-hot-toast";

const baseStyle = {
  background: "var(--background)",
  color: "var(--foreground)",
  borderRadius: "8px",
  padding: "12px 16px",
  border: "1px solid var(--border)",
  fontSize: "14px",
};

export const useToast = () => {
  return {
    successToast: (msg: string, opts: ToastOptions = {}) =>
      toast.success(msg, { style: baseStyle, ...opts }),

    errorToast: (msg: string, opts: ToastOptions = {}) =>
      toast.error(msg, { style: baseStyle, ...opts }),

    loadingToast: (msg: string, opts: ToastOptions = {}) =>
      toast.loading(msg, { style: baseStyle, ...opts }),

    customToast: (msg: string, opts: ToastOptions = {}) =>
      toast(msg, { style: baseStyle, ...opts }),

    dismissToast: (id?: string) => toast.dismiss(id),
  };
};
