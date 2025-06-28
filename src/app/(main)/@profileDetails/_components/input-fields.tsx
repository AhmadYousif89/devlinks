import { useRef, useState, useCallback, useEffect, use } from "react";

import { ProfileServerState, UserProfileDisplay } from "@/lib/types";
import { FieldName, profileSchema } from "@/app/(main)/schema/profile-schema";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InputFieldNames = Exclude<FieldName, "profileImage">;

const CUSTOM_VALIDATION_MESSAGES: Record<InputFieldNames, Record<string, string>> = {
  firstName: {
    "Can't be empty": "Please enter your first name",
    "Too long": "First name must be 50 characters or less",
  },
  lastName: {
    "Can't be empty": "Please enter your last name",
    "Too long": "Last name must be 50 characters or less",
  },
  email: {
    "Email not valid": "Please enter a valid email address (e.g., name@example.com)",
  },
} as const;

type InputFieldsProps = {
  serverState: ProfileServerState;
  profileDataPromise: Promise<UserProfileDisplay | null>;
};

export const ProfileInputFields = ({ serverState, profileDataPromise }: InputFieldsProps) => {
  const profileData = use(profileDataPromise);
  const [formData, setFormData] = useState(() => ({
    firstName: { value: profileData?.firstName || "", error: "" },
    lastName: { value: profileData?.lastName || "", error: "" },
    email: { value: profileData?.displayEmail || "", error: "" },
  }));

  const inputRefs = useRef<Record<InputFieldNames, HTMLInputElement | null>>({
    firstName: null,
    lastName: null,
    email: null,
  });

  const firstName = formData.firstName.value;
  const lastName = formData.lastName.value;
  const email = formData.email.value;

  const validateField = useCallback(
    (name: InputFieldNames, value: string | undefined) => {
      const currentValues = { firstName, lastName, email, [name]: value };

      const result = profileSchema.safeParse(currentValues);

      const error = result.success ? "" : result.error.formErrors.fieldErrors[name]?.[0] || "";

      let customMessage = "";

      if (error) {
        const customMessages = CUSTOM_VALIDATION_MESSAGES[name];
        customMessage = customMessages?.[error as keyof typeof customMessages] || error;
      }

      const inputElement = inputRefs.current[name];
      if (inputElement) inputElement.setCustomValidity(customMessage);

      return error;
    },
    [firstName, lastName, email],
  );

  const validateAllFields = useCallback(() => {
    Object.keys(formData).forEach((key) => {
      const fieldName = key as InputFieldNames;
      validateField(fieldName, formData[fieldName].value);
    });
  }, [formData, validateField]);

  // Initial validation setup
  useEffect(() => {
    validateAllFields();
  }, [validateAllFields]);

  // Update form data errors when server state changes
  useEffect(() => {
    if (serverState.errors) {
      setFormData((prev) => ({
        firstName: {
          ...prev.firstName,
          error: serverState.errors?.firstName?.[0] || "",
        },
        lastName: {
          ...prev.lastName,
          error: serverState.errors?.lastName?.[0] || "",
        },
        email: {
          ...prev.email,
          error: serverState.errors?.displayEmail?.[0] || "",
        },
      }));
    }
  }, [serverState.errors]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const fieldName = name as InputFieldNames;
      const error = validateField(fieldName, value);

      setFormData((prev) => ({
        ...prev,
        [fieldName]: { value, error },
      }));
    },
    [validateField],
  );

  const createFieldProps = (name: InputFieldNames) => ({
    name,
    form: "profile-form",
    value: formData[name].value,
    onChange: handleInputChange,
    ref: (el: HTMLInputElement | null) => {
      inputRefs.current[name] = el;
    },
    className: `bg-primary-foreground min-h-12 px-4 py-3 col-end-1 row-end-1`,
    "aria-invalid": !!formData[name].error,
  });

  return (
    <Card className="bg-background @container gap-3 p-5">
      <fieldset className="space-y-1 @xl:flex @xl:items-center @xl:justify-between @xl:gap-4 @xl:space-y-0">
        <Label
          htmlFor="firstName"
          className="@xl:text-accent-foreground text-xs font-normal @xl:min-w-40 @xl:text-base"
        >
          First name*
        </Label>
        <div className="grid @xl:max-w-[432px] @xl:flex-1">
          <Input id="firstName" placeholder="e.g. John" {...createFieldProps("firstName")} />
          {/* {isLoading && (
            <Skeleton className="bg-border/50 col-end-1 row-end-1 size-full self-center rounded-md" />
          )} */}
          {(formData.firstName.error || serverState?.errors?.firstName) && (
            <small className="text-destructive bg-primary-foreground col-end-1 row-end-1 mr-2 ml-auto self-center p-1 text-xs">
              {formData.firstName.error || serverState?.errors?.firstName?.[0]}
            </small>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-1 @xl:flex @xl:items-center @xl:justify-between @xl:gap-4 @xl:space-y-0">
        <Label
          htmlFor="lastName"
          className="@xl:text-accent-foreground text-xs font-normal @xl:min-w-40 @xl:text-base"
        >
          Last name*
        </Label>
        <div className="grid @xl:max-w-[432px] @xl:flex-1">
          <Input id="lastName" placeholder="e.g. Anderson" {...createFieldProps("lastName")} />
          {/* {isLoading && (
            <Skeleton className="bg-border/50 col-end-1 row-end-1 size-full self-center rounded-md" />
          )} */}
          {(formData.lastName.error || serverState?.errors?.lastName) && (
            <small className="text-destructive bg-primary-foreground col-end-1 row-end-1 mr-2 ml-auto self-center p-1 text-xs">
              {formData.lastName.error || serverState?.errors?.lastName?.[0]}
            </small>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-1 @xl:flex @xl:items-center @xl:justify-between @xl:gap-4 @xl:space-y-0">
        <Label
          htmlFor="email"
          className="@xl:text-accent-foreground text-xs font-normal @xl:min-w-40 @xl:text-base"
        >
          Email
        </Label>
        <div className="grid @xl:max-w-[432px] @xl:flex-1">
          <Input
            id="email"
            type="email"
            placeholder="e.g. email@example.com"
            {...createFieldProps("email")}
          />
          {/* {isLoading && (
            <Skeleton className="bg-border/50 col-end-1 row-end-1 size-full self-center rounded-md" />
          )} */}
          {(formData.email.error || serverState?.errors?.displayEmail) && (
            <small className="text-destructive bg-primary-foreground col-end-1 row-end-1 mr-2 ml-auto self-center p-1 text-xs">
              {formData.email.error || serverState?.errors?.displayEmail?.[0]}
            </small>
          )}
        </div>
      </fieldset>
    </Card>
  );
};
