import Link from "next/link";

import Logo from "public/assets/images/logo-devlinks-large.svg";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-svh flex-col">
      <div className="max-md:bg-card flex flex-col gap-16 max-md:flex-1 max-md:p-8 md:m-auto md:w-[476px] md:justify-center md:gap-12.75">
        <header className="w-fit md:self-center">
          <Link href="/">
            <Logo />
          </Link>
        </header>
        {children}
      </div>
    </main>
  );
}
