import Link from "next/link";
import { redirect } from "next/navigation";

import Logo from "public/assets/images/logo-devlinks-large.svg";
import { getUserFromSession } from "./_lib/session";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const user = await getUserFromSession();

  if (user) redirect("/");

  return (
    <main className="flex min-h-svh flex-col">
      <div className="max-md:bg-card flex flex-col gap-16 max-md:flex-1 max-md:p-8 md:m-auto md:w-[476px] md:justify-center md:gap-12.75">
        <header className="w-fit md:self-center">
          <Link href="/" className="inline-block p-1.5">
            <Logo />
          </Link>
        </header>
        {children}
      </div>
    </main>
  );
}
