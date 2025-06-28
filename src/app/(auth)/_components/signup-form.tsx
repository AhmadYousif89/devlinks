"use client";

import { AuthForm } from "./auth-compound-form";
import { createUserAccount } from "../actions/signup";
import { signUpSchema, CUSTOM_VALIDATION_MESSAGES, FIELDS } from "../schema/signUp-schema";

const [email, password, confirm] = FIELDS;

export const SignUpForm = () => {
  return (
    <AuthForm
      fieldNames={FIELDS}
      schema={signUpSchema}
      action={createUserAccount}
      customValidationMessages={CUSTOM_VALIDATION_MESSAGES}
      submitText="Create new account"
      linkText="Already have an account?"
      linkHref="/signin"
      linkLabel="Login"
    >
      <AuthForm.Field
        type="email"
        icon="email"
        name={email}
        label="Email address"
        placeholder="e.g. alex@gmail.com"
      />
      <AuthForm.Field
        type="password"
        icon="password"
        name={password}
        label="Create password"
        placeholder="At least 8 characters"
      />
      <AuthForm.Field
        type="password"
        icon="password"
        name={confirm}
        label="Confirm password"
        placeholder="At least 8 characters"
      />
    </AuthForm>
  );
};
