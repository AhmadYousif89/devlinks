import { Spinner } from "@/components/icons/spinner";

export default function Loading() {
  return (
    <div className="flex grow items-center justify-center gap-2">
      <Spinner className="fill-primary size-20" />
    </div>
  );
}
