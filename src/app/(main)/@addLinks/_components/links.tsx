import Form from "next/form";
import { Suspense } from "react";

import { getLinksCount, getLinksFromDB } from "../page";
import { createNewLink, updateLinkForm } from "@/app/(main)/actions/links";

import { LinkList } from "./link-list";
import { WelcomeCard } from "./welcome-card";
import { ListItemSkeleton } from "./list-items-skeleton";
import { ButtonWithFormState } from "@/components/button-with-formstate";
import { Spinner } from "@/components/icons/spinner";

export const AddLinks = async () => {
  const count = await getLinksCount();

  return (
    <>
      <div className="flex basis-full flex-col p-6 md:p-10">
        <div className="mb-6">
          <header className="mb-10 flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Customize your links</h2>
            <p className="text-accent-foreground">
              Add/edit/remove links below and then share all your profiles with the world!
            </p>
          </header>
          <form action={createNewLink} className="h-11.5">
            <ButtonWithFormState
              variant="secondary"
              actionLoader={<Spinner className="fill-primary size-6" />}
              className="h-11.5 w-full text-base font-semibold"
            >
              + Add new link
            </ButtonWithFormState>
          </form>
        </div>
        <div className="flex basis-full flex-col *:basis-full">
          {count < 1 ? (
            <WelcomeCard />
          ) : (
            <Suspense fallback={<ListItemSkeleton dataLength={count} />}>
              <DisplayLinks />
            </Suspense>
          )}
        </div>
      </div>
      <Form
        id="links-form"
        action={updateLinkForm}
        className="border-border flex items-center justify-center border-t p-4 md:px-10 md:py-6"
      >
        <ButtonWithFormState
          type="submit"
          disabled={count < 1}
          actionLoader={<Spinner className="size-8" />}
          className="h-11.5 w-full text-base font-semibold md:ml-auto md:w-22.75"
        >
          Save
        </ButtonWithFormState>
      </Form>
    </>
  );
};

async function DisplayLinks() {
  const links = await getLinksFromDB();
  return <LinkList links={links} />;
}
