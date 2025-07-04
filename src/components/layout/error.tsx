import { cn } from "@/lib/utils";
import { XIcon } from "../icons/x-icon";
import { Card, CardAction, CardContent, CardDescription, CardTitle } from "../ui/card";

type Props = {
  children?: React.ReactNode;
  title?: string;
  message?: string;
  actions?: React.ReactNode;
  className?: string;
};

export const ErrorCard = ({ children, title, message, actions, className }: Props) => {
  return (
    <Card className={cn("border-destructive/80 mx-4 max-w-2xl border p-5 shadow-lg", className)}>
      <CardContent className="flex gap-2">
        <div className="flex size-7 items-center justify-center md:size-8">
          <XIcon />
        </div>
        <div>
          <CardTitle className="text-destructive text-lg font-semibold md:text-2xl">
            {title}
          </CardTitle>
          <CardDescription className="my-2 font-medium text-pretty">{message}</CardDescription>
          <div className="text-sm font-medium text-amber-700">{children}</div>
          <CardAction className="mt-6 flex justify-between gap-2">{actions}</CardAction>
        </div>
      </CardContent>
    </Card>
  );
};
