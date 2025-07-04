import Link from "next/link";
import Logo from "public/assets/images/logo-devlinks-large.svg";

import { Button } from "@/components/ui/button";
import { ErrorCard } from "@/components/layout/error";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <header className="mb-8">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <ErrorCard
        title="Not Found"
        message="The requested page does not exist."
        actions={
          <Button asChild className="min-h-12 w-full">
            <Link href="/">Return Home</Link>
          </Button>
        }
      />
    </main>
  );
}
