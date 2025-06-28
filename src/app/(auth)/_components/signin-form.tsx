"use client";

import { AuthForm } from "./auth-compound-form";
import { loginUser } from "../actions/signin";
import { CUSTOM_VALIDATION_MESSAGES, signInSchema, FIELDS } from "../schema/signIn-schema";

const [email, password] = FIELDS;

export const SignInForm = () => {
  return (
    <AuthForm
      fieldNames={FIELDS}
      action={loginUser}
      schema={signInSchema}
      customValidationMessages={CUSTOM_VALIDATION_MESSAGES}
      submitText="Login"
      linkText="Don't have an account?"
      linkLabel="Create account"
      linkHref="/signup"
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
        label="Password"
        placeholder="Enter your password"
      />
    </AuthForm>
  );
};
