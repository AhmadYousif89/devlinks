"use client";

import {
  useCallback,
  useEffect,
  useState,
  useRef,
  useContext,
  createContext,
  useActionState,
  Context,
} from "react";
import Form from "next/form";
import Link from "next/link";
import { z } from "zod";

import EmailIcon from "public/assets/images/icon-email.svg";
import PasswordIcon from "public/assets/images/icon-password.svg";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonWithFormState } from "@/components/button-with-formstate";

export type AuthFormState = {
  success: boolean;
  errors: Record<"field" | "message", string>[];
};

type FieldData = {
  value: string;
  error: string;
};

type AuthFormData<T extends string> = Record<T, FieldData>;
type FormInputRefs<T extends string> = Record<T, HTMLInputElement | null>;
type CustomValidationMessage<T extends string> = Record<T, Record<string, string>>;

interface AuthFormContextType<T extends string> {
  isPending: boolean;
  formData: AuthFormData<T>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  createFieldProps: (name: T) => {
    name: T;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    ref: (el: HTMLInputElement | null) => void;
    className: string;
    "aria-invalid": boolean;
  };
}

type AuthFormProps<T extends string> = {
  schema: z.ZodSchema;
  fieldNames: readonly T[];
  customValidationMessages: CustomValidationMessage<T>;
  action: (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitText: string;
  linkText: string;
  linkHref: string;
  linkLabel: string;
  children: React.ReactNode;
};

const AuthFormContext = createContext<AuthFormContextType<string> | null>(null);

const useAuthForm = <T extends string>() => {
  const context = useContext(AuthFormContext as Context<AuthFormContextType<T> | null>);
  if (!context) {
    throw new Error("Auth form components must be used within AuthForm");
  }
  return context;
};
const INITIAL_STATE: AuthFormState = {
  success: false,
  errors: [],
};

const initialFormData = <T extends string>(fieldNames: readonly T[]): AuthFormData<T> => {
  return fieldNames.reduce<AuthFormData<T>>((acc, field) => {
    acc[field] = { value: "", error: "" };
    return acc;
  }, {} as AuthFormData<T>);
};

const initialInputRefs = <T extends string>(fieldNames: readonly T[]): FormInputRefs<T> => {
  return fieldNames.reduce((acc, field) => {
    acc[field] = null;
    return acc;
  }, {} as FormInputRefs<T>);
};

const AuthForm = <T extends string>({
  schema,
  fieldNames,
  customValidationMessages,
  action,
  submitText,
  linkText,
  linkHref,
  linkLabel,
  children,
}: AuthFormProps<T>) => {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const [formData, setFormData] = useState(() => initialFormData(fieldNames));
  const inputRefs = useRef(initialInputRefs(fieldNames));

  useEffect(() => {
    if (state.errors && state.errors.length > 0) {
      setFormData((prev) => {
        const newFormData = { ...prev };
        Object.keys(newFormData).forEach((key) => {
          const fieldName = key as T;
          newFormData[fieldName] = { ...newFormData[fieldName], error: "" };
        });
        state.errors.forEach((error) => {
          const fieldName = error.field as T;
          if (fieldName in newFormData) {
            newFormData[fieldName] = {
              ...newFormData[fieldName],
              error: error.message,
            };
          }
        });
        return newFormData;
      });
    }
  }, [state.errors]);

  const validateField = useCallback(
    (name: T, value: string) => {
      const currentValues = {
        ...Object.fromEntries(
          Object.entries(formData).map(([key, data]) => [key, (data as FieldData).value]),
        ),
        [name]: value,
      } as Record<T, string>;

      const result = schema.safeParse(currentValues);
      const errorFieldKeys = result.error?.formErrors?.fieldErrors
        ? Object.keys(result.error.formErrors.fieldErrors)
        : [];

      const zodError = result.success ? "" : result.error.formErrors.fieldErrors[name]?.[0] || "";

      let displayError = "";
      let customValidityMessage = "";

      if (zodError) {
        const customMessages = customValidationMessages[name];
        const matchingKey = Object.keys(customMessages || {}).find((key) => key === zodError);
        if (matchingKey) {
          displayError = matchingKey;
          customValidityMessage = customMessages[matchingKey];
        } else {
          displayError = customValidityMessage = zodError;
        }
      }
      const inputElement = inputRefs.current[name];
      if (inputElement) {
        inputElement.setCustomValidity(customValidityMessage);
      }

      const isPasswordField = name === "password" || name === "confirm";
      if (isPasswordField && "confirm" in currentValues && "password" in currentValues) {
        const passwordsMatch = currentValues.password === currentValues.confirm;
        const passwordsHasError =
          errorFieldKeys?.includes("password") || errorFieldKeys?.includes("confirm");

        if (passwordsMatch && !passwordsHasError) {
          const otherField = (name === "password" ? "confirm" : "password") as T;
          const otherInputElement = inputRefs.current[otherField];
          otherInputElement?.setCustomValidity("");

          setFormData((prev) => ({
            ...prev,
            [otherField]: { ...prev[otherField], error: "" },
          }));
        }
      }

      return displayError;
    },
    [formData, schema, customValidationMessages],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const error = validateField(name as T, value);

      setFormData((prev) => ({
        ...prev,
        [name]: { value, error },
      }));
    },
    [validateField],
  );

  const createFieldProps = (name: string) => {
    const fieldName = name as T;
    return {
      name: fieldName,
      value: formData[fieldName]?.value || "",
      onChange: handleInputChange,
      ref: (el: HTMLInputElement | null) => {
        inputRefs.current[fieldName] = el;
      },
      className: cn("peer bg-card col-end-1 row-end-1 min-h-12 py-3 pr-4 pl-11 overflow-hidden"),
      "aria-invalid": !!formData[fieldName]?.error,
    };
  };

  const generalErrors =
    state.errors?.filter((error) => !fieldNames.includes(error.field as T)) || [];

  const contextValue = {
    formData,
    handleInputChange,
    createFieldProps,
    isPending,
  };

  return (
    <AuthFormContext.Provider value={contextValue}>
      <Form action={formAction} className="flex flex-col gap-6">
        {children}

        <small className="text-accent-foreground text-xs">
          Password must contain at least 8 characters.
        </small>

        {generalErrors.map((error, index) => (
          <span
            key={index}
            className="text-destructive bg-destructive/10 p-2 text-center text-xs font-medium shadow-xs md:text-sm"
            role="alert"
            aria-live="assertive"
          >
            {error.message}
          </span>
        ))}

        <ButtonWithFormState
          isLoading={isPending}
          className="min-h-11.5 w-full text-base font-semibold"
        >
          {submitText}
        </ButtonWithFormState>

        <div className="flex flex-col items-center md:flex-row md:justify-center md:gap-1">
          <p className="text-accent-foreground">{linkText}</p>
          <span>
            <Link href={linkHref} className="text-primary">
              {linkLabel}
            </Link>
          </span>
        </div>
      </Form>
    </AuthFormContext.Provider>
  );
};
type FieldProps<T extends string> = {
  name: T;
  label: string;
  placeholder: string;
  type: "email" | "password";
  icon: "email" | "password";
};

const Field = <T extends string>({ name, label, type, icon, placeholder }: FieldProps<T>) => {
  const { formData, createFieldProps } = useAuthForm<T>();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const inputProps = createFieldProps(name);
  const FieldIcon = icon === "email" ? EmailIcon : PasswordIcon;

  const handlePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <fieldset className="flex flex-col gap-1">
      <Label
        htmlFor={name}
        className={cn("text-xs font-normal", formData[name]?.error && "text-destructive")}
      >
        {label}
      </Label>
      <div className="grid">
        <span className="pointer-events-none z-10 col-end-1 row-end-1 grid h-full w-11 place-content-center pl-2">
          <FieldIcon />
        </span>
        <Input
          id={name}
          placeholder={placeholder}
          type={type === "password" ? (passwordVisible ? "text" : "password") : type}
          {...inputProps}
        />
        {formData[name]?.error && (
          <small className="text-destructive bg-card z-10 col-end-1 row-end-1 mr-2 ml-auto flex h-[calc(100%-10px)] items-center self-center text-xs">
            {formData[name].error}
          </small>
        )}
        {/* Password toggle show/hide button */}
        {type === "password" && (name === "password" || name === "confirm") && (
          <button
            type="button"
            className="col-end-1 row-end-1 mr-2.5 ml-auto flex h-8 w-10 cursor-pointer items-center justify-center self-center"
            onClick={handlePasswordVisibility}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            aria-controls={name}
            aria-live="polite"
          >
            {passwordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </button>
        )}
      </div>
    </fieldset>
  );
};

AuthForm.Field = Field;

export { AuthForm };

const VisibilityIcon = () => (
  <svg
    height="16px"
    width="16px"
    fill="#e3e3e3"
    viewBox="0 -960 960 960"
    xmlns="http://www.w3.org/2000/svg"
    className="fill-accent-foreground"
  >
    <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg
    height="16px"
    width="16px"
    fill="#e3e3e3"
    viewBox="0 -960 960 960"
    xmlns="http://www.w3.org/2000/svg"
    className="fill-accent-foreground"
  >
    <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
  </svg>
);
