"use client";

import ArrowRightIcon from "public/assets/images/icon-arrow-right.svg";

import { cn } from "@/lib/utils";
import { LINKS_DATA } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useLinks } from "../contexts/links-context";
import { FFIcon } from "@/components/icons/frontendmentor-icon";

const getLinkDataByName = (platformName: string) => {
  for (const data of Object.values(LINKS_DATA)) {
    if (data.name === platformName) {
      return {
        name: data.name,
        color: data.color,
        icon: data.icon,
      };
    }
  }
  return null;
};

type Props = { inPreviewPage?: boolean };

export const LinksPreview = ({ inPreviewPage = false }: Props) => {
  const { optimisticLinks } = useLinks();

  return (
    <ul
      className={cn(
        "col-end-1 row-end-1 flex w-full flex-col gap-5 overflow-auto",
        inPreviewPage ? "max-h-[600px]" : "",
      )}
    >
      {optimisticLinks.map((link) => {
        const platformData = getLinkDataByName(link.platform);
        if (!platformData) return null;

        const { name, color, icon: LinkIcon } = platformData;
        const isFrontendMentor = name === "Frontend Mentor";
        const isDevTo = name === "Dev.to";

        return (
          <li key={link.id}>
            <Button
              variant="link"
              className={cn(
                "relative w-full border has-[>svg]:px-4",
                inPreviewPage ? "h-14 p-4" : "h-11 py-2.75",
              )}
              style={{
                backgroundColor:
                  name === link.platform ? color : isFrontendMentor ? "var(--card)" : "#ffa",
                color: isFrontendMentor ? "var(--muted-foreground)" : "var(--primary-foreground)",
                borderColor: isFrontendMentor ? "var(--border)" : color,
              }}
            >
              <span className="flex items-center">
                {isFrontendMentor ? (
                  <FFIcon />
                ) : (
                  <LinkIcon
                    className={cn(
                      !isFrontendMentor && inPreviewPage ? "scale-125" : "",
                      isFrontendMentor
                        ? "fill-accent-foreground size-5"
                        : isDevTo
                          ? `fill-accent-foreground`
                          : `fill-primary-foreground`,
                    )}
                  />
                )}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center"
                >
                  <span className={cn("ml-12", inPreviewPage ? "text-base" : "text-xs")}>
                    {link.platform}
                  </span>
                </a>
              </span>

              <ArrowRightIcon
                className={cn(
                  "ml-auto",
                  isFrontendMentor ? "fill-accent-foreground" : "fill-primary-foreground",
                )}
              />
            </Button>
          </li>
        );
      })}
    </ul>
  );
};
