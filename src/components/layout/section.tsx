import { cn } from "@/lib/utils";

type SectionProps = React.ComponentProps<"section">;

export const Section = ({ className, children, ...props }: SectionProps) => {
  return (
    <section
      className={cn(
        "bg-card rounded-12 flex flex-col justify-between overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
};
