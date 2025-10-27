import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="flex flex-col items-center gap-6">
          <div className="h-36 w-full overflow-hidden rounded-2xl bg-muted/40" />

          <div className="-mt-20 flex w-full flex-col items-center">
            <div className="rounded-full ring-2 ring-border p-1 bg-background">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <div className="mt-4 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
