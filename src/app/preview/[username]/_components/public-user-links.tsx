import { Link } from "@/lib/types";
import { LINKS_DATA } from "@/lib/data";

import ArrowRightIcon from "public/assets/images/icon-arrow-right.svg";
import { Button } from "@/components/ui/button";
import { FFIcon } from "@/components/icons/frontendmentor-icon";
import { cn } from "@/lib/utils";

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

type Props = {
  links: Link[];
};

export const UserPublicLinks = ({ links }: Props) => {
  return (
    <ul className="col-end-1 row-end-1 flex max-h-[600px] w-full flex-col gap-5 overflow-y-auto">
      {links.map((link) => {
        const platformData = getLinkDataByName(link.platform);
        if (!platformData) return null;

        const { name, color, icon: LinkIcon } = platformData;
        const isFrontendMentor = name === "Frontend Mentor";
        const isDevTo = name === "Dev.to";

        return (
          <li key={link.id}>
            <Button
              variant="link"
              className="relative h-14 w-full border p-4 has-[>svg]:px-4"
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
                      !isFrontendMentor ? "scale-125" : "",
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
                  <span className="ml-12">{link.platform}</span>
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
