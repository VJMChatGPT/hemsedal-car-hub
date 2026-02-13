import { PropsWithChildren } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface SidePanelProps extends PropsWithChildren {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SidePanel = ({ title, open, onOpenChange, children }: SidePanelProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>
      <div className="mt-6 space-y-4">{children}</div>
    </SheetContent>
  </Sheet>
);
