import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DynamicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dialogClassName?: string;
}

export const DynamicDialog: React.FC<DynamicDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  dialogClassName,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className={cn("sm:max-w-lg w-full", dialogClassName)}>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Separator className='my-2' />

        <div className='py-2'>{children}</div>

        {footer && (
          <>
            <Separator className='my-2' />
            <DialogFooter>{footer}</DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
