import { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { SignUpForm } from "../_components/signup-form";

export const metadata: Metadata = {
  title: "Devlinks | Sign up",
  description: "Create a new account to start sharing your links.",
};

export default function SignUpPage() {
  return (
    <Section className="max-md:rounded-none md:p-10">
      <header className="mb-10 flex flex-col gap-2">
        <h2 className="text-2xl font-bold md:text-[32px]">Create account</h2>
        <p className="text-accent-foreground">
          Let’s get you started sharing your links!
        </p>
      </header>
      <SignUpForm />
    </Section>
  );
}
