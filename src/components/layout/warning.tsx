import { cn } from "@/lib/utils";
import { XIcon } from "../icons/x-icon";

type Props = {
  children?: React.ReactNode;
  title?: string;
  message?: string;
  actions?: React.ReactNode;
  className?: string;
};

export const WarningCard = ({ children, title, message, actions, className }: Props) => {
  return (
    <section className={cn(className)}>
      <div className="flex gap-2">
        <div className="flex size-7 items-center justify-center md:size-8">
          <XIcon />
        </div>
        <div>
          <h2 className="text-destructive text-lg font-semibold md:text-2xl">{title}</h2>
          <p className="text-accent-foreground my-2 text-sm font-medium text-pretty">{message}</p>
          <div className="text-sm font-medium text-amber-700">{children}</div>
          <div className="mt-6 flex justify-between gap-2">{actions}</div>
        </div>
      </div>
    </section>
  );
};
