import { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { SignInForm } from "../_components/signin-form";

export const metadata: Metadata = {
  title: "Devlinks | Sign In",
  description:
    "Start sharing your social links by signing in to your Devlink account.",
};

export default function SignInPage() {
  return (
    <Section className="max-md:rounded-none md:p-10">
      <header className="mb-10 flex flex-col gap-2">
        <h2 className="text-2xl font-bold md:text-[32px]">Login</h2>
        <p className="text-accent-foreground">
          Add your details below to get back into the app
        </p>
      </header>
      <SignInForm />
    </Section>
  );
}
