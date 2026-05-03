import { redirect } from "next/navigation";
import { listBoards } from "@/lib/queries";
import { AppShell } from "@/components/app-shell";

export default async function HomePage() {
  const boards = await listBoards();

  if (boards.length > 0) {
    redirect(`/boards/${boards[0].id}`);
  }

  return (
    <AppShell boards={boards} board={null}>
      <EmptyState />
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-heading-l text-medium-grey">
        You don&apos;t have any boards yet. Create one from the sidebar to get
        started.
      </p>
    </div>
  );
}
