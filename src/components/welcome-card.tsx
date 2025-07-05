import Image from "next/image";
import { Card } from "@/components/ui/card";

export const WelcomeCard = () => {
  return (
    <Card className="bg-background basis-full items-center justify-center gap-6 p-5">
      <Image
        priority
        height={80}
        width={125}
        draggable={false}
        className="h-20 w-[125px]"
        alt="Welcome to DevLinks image"
        src="/assets/images/illustration-empty.svg"
      />
      <h2 className="text-2xl font-bold">Let’s get you started</h2>
      <p className="text-accent-foreground text-center text-balance">
        Use the “Add new link” button to get started. Once you have more than one link, you can
        reorder and edit them. We’re here to help you share your profiles with everyone!
      </p>
    </Card>
  );
};
