import React, { type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface DynamicSheetProps {
  trigger?: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
  children: ReactNode;
  side?: "right" | "left" | "top" | "bottom";
  footer?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sheetClassName?: string;
  contentClassName?: string;
}

export const DynamicSheet: React.FC<DynamicSheetProps> = ({
  trigger,
  title,
  description,
  children,
  side = "right",
  footer,
  open,
  onOpenChange,
  sheetClassName = "",
  contentClassName = "",
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side={side} className={cn("flex flex-col", sheetClassName)}>
        {(title || description) && (
          <>
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </SheetHeader>
            <Separator className='my-2' />
          </>
        )}

        <div className={cn("flex-1 overflow-y-auto px-4", contentClassName)}>
          {children}
        </div>

        {footer && (
          <>
            <Separator className='my-2' />
            <SheetFooter>{footer}</SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
