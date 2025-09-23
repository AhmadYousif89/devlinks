"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";

import LinkIcon from "public/assets/images/icon-link.svg";

import { LINKS_DATA } from "@/lib/data";
import { normalizeURL } from "@/lib/utils";
import { PlatformKey, PlatformNames } from "@/lib/types";
import { createLinkSchema } from "@/app/(main)/schema/link.schema";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LinkURLProps = {
  id: string;
  url: string;
  platform: PlatformNames | PlatformKey;
  selectedPlatform?: PlatformNames;
  shouldHighlight?: boolean;
};

const PLATFORM_NAME_TO_KEY = Object.entries(LINKS_DATA).reduce(
  (acc, [key, data]) => {
    acc[data.name] = key as PlatformKey;
    return acc;
  },
  {} as Record<string, PlatformKey>,
);

const URL_PATTERNS: Record<PlatformKey, string> = Object.entries(LINKS_DATA).reduce(
  (acc, [key, data]) => {
    acc[key as PlatformKey] = data.pattern || "";
    return acc;
  },
  {} as Record<PlatformKey, string>,
);

const getPlatformKey = (platform: PlatformNames | PlatformKey): PlatformKey => {
  return platform in LINKS_DATA
    ? (platform as PlatformKey)
    : PLATFORM_NAME_TO_KEY[platform] || "github";
};

export const LinkURL = ({
  id,
  url,
  platform,
  selectedPlatform,
  shouldHighlight = false,
}: LinkURLProps) => {
  const [urlValue, setUrlValue] = useState(url);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);

  const ID = `url-${id}`;
  const errorId = `${ID}-error`;
  const currentPlatform = selectedPlatform || platform;

  const { placeholder, platformKey } = useMemo(() => {
    const platformKey = getPlatformKey(currentPlatform);
    const data = LINKS_DATA[platformKey];
    const domain = data.domain[0];
    const pattern = URL_PATTERNS[platformKey] || "";

    return {
      platformKey,
      platformData: data,
      placeholder: `e.g. https://${domain}${pattern}`,
    };
  }, [currentPlatform]);

  const validateURL = useCallback(
    (value: string) => {
      const schema = createLinkSchema(platformKey);
      const result = schema.safeParse({ url: value, platform: platformKey });
      const error = result.success ? "" : result.error.errors[0].message;

      if (error) {
        if (inputRef.current) inputRef.current.setCustomValidity(error);
        return error || "Invalid URL";
      }

      return ""; // No error
    },
    [platformKey],
  );

  // Validate URL on initial render and when platform changes
  useEffect(() => {
    validateURL(url);
  }, [url, validateURL]);

  // This should prevents the input from resetting on every render
  useEffect(() => {
    if (!hasInitialized.current) {
      setUrlValue(url);
      hasInitialized.current = true;
    }
  }, [url]);

  // Only clear url value and error state when platform actually changes
  useEffect(() => {
    if (hasInitialized.current) {
      if (currentPlatform !== platform) setUrlValue("");
      else setUrlValue(url);
    }
    setError("");
  }, [currentPlatform, url, platform]);

  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUrlValue(newValue);

    if (newValue) {
      const errorMsg = validateURL(newValue);
      setError(errorMsg);
    } else if (!error) {
      setError("");
      inputRef.current?.setCustomValidity("");
    }
  };

  const handleURLBlur = () => {
    if (!error && urlValue) {
      try {
        setUrlValue(normalizeURL(urlValue));
        inputRef.current?.setCustomValidity("");
      } catch {
        // If there is error, leave the value as is
      }
    }
  };

  return (
    <fieldset className="space-y-1">
      <Label htmlFor={ID} className="text-xs font-normal">
        Link
      </Label>
      <div className="grid">
        <span className="pointer-events-none z-10 col-end-1 row-end-1 grid h-full w-11 place-content-center pl-2">
          <LinkIcon />
        </span>
        <Input
          id={ID}
          name={ID}
          ref={inputRef}
          type="text"
          form="links-form"
          value={urlValue}
          onBlur={handleURLBlur}
          onChange={handleURLChange}
          placeholder={placeholder}
          aria-invalid={!!error || shouldHighlight}
          aria-describedby={error ? errorId : undefined}
          className="bg-card col-end-1 row-end-1 min-h-12 py-3 pr-4 pl-11 text-sm"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" aria-live="polite" className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </fieldset>
  );
};
