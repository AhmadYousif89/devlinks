import { Fragment } from "react";

import { LINKS_DATA } from "@/lib/data";
import { PlatformNames } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type LinkPlatformProps = {
  id: string;
  platform: PlatformNames;
  onPlatformChange: (platform: PlatformNames) => void;
};

export const LinkPlatform = ({
  id,
  platform,
  onPlatformChange,
}: LinkPlatformProps) => {
  const ID = `platform-${id}`;

  const handleSelectChange = (value: PlatformNames) => {
    onPlatformChange(value);
  };

  return (
    <fieldset className="space-y-1">
      <Label id={ID} className="text-xs font-normal">
        Platform
      </Label>
      <input type="hidden" name={ID} value={platform} form="links-form" />
      <Select value={platform} onValueChange={handleSelectChange}>
        <SelectTrigger
          id={ID}
          className="bg-card m-0 min-h-12 w-full px-4 py-3"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LINKS_DATA).map(([key, { name, icon: Icon }]) => (
            <Fragment key={key}>
              <SelectItem value={name} className="group/select-item">
                <Icon className="group-focus/select-item:fill-primary group-data-[state=checked]/select-item:fill-primary mr-0.5" />
                {name}
              </SelectItem>
              {key !== Object.keys(LINKS_DATA).slice(-1)[0] && (
                <SelectSeparator />
              )}
            </Fragment>
          ))}
        </SelectContent>
      </Select>
    </fieldset>
  );
};
