import Link from "next/link";
import Logo from "public/assets/images/logo-devlinks-large.svg";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <header className="mb-8">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <Card className="gap-12 p-8">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Not Found</h2>
          <p className="text-accent-foreground">
            The requested page does not exist.
          </p>
        </div>
        <Button asChild className="min-h-12 min-w-40">
          <Link href="/">Return Home</Link>
        </Button>
      </Card>
    </main>
  );
}
