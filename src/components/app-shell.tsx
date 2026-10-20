"use client";

import { UiProvider } from "./ui-store";
import { Sidebar, ShowSidebarFab } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { Header } from "./header";
import { Modals } from "./modals";
import type { BoardRow, BoardWithColumns } from "@/lib/supabase/types";

type Props = {
  boards: BoardRow[];
  board: BoardWithColumns | null;
  children: React.ReactNode;
};

export function AppShell({ boards, board, children }: Props) {
  return (
    <UiProvider>
      <a
        href="#board-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-purple px-4 py-3 text-white focus:not-sr-only"
      >
        Skip to board content
      </a>
      <div className="flex h-screen w-screen overflow-hidden bg-light-grey dark:bg-very-dark-grey">
        <Sidebar boards={boards} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header board={board} />
          <main id="board-content" tabIndex={-1} className="relative flex-1 overflow-hidden">{children}</main>
        </div>
        <ShowSidebarFab />
        <MobileSidebar boards={boards} />
        <Modals board={board} />
      </div>
    </UiProvider>
  );
}
