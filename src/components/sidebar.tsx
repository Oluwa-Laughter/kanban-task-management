"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUi } from "./ui-store";
import { ThemeToggle } from "./theme-toggle";
import { Icon } from "./icons";
import type { BoardRow } from "@/lib/supabase/types";

type Props = { boards: BoardRow[] };

export function Sidebar({ boards }: Props) {
  const { sidebarOpen, setSidebarOpen, openModal } = useUi();
  const pathname = usePathname();

  if (!sidebarOpen) return null;

  return (
    <aside className="hidden w-65 shrink-0 flex-col border-r border-lines-light bg-white pt-8 lg:flex xl:w-75 dark:border-lines-dark dark:bg-dark-grey">
      <div className="px-8 pb-8">
        <Image
          src="/assets/logo-dark.svg"
          alt="kanban"
          width={153}
          height={26}
          className="block dark:hidden"
          priority
        />
        <Image
          src="/assets/logo-light.svg"
          alt="kanban"
          width={153}
          height={26}
          className="hidden dark:block"
          priority
        />
      </div>

      <BoardsList boards={boards} pathname={pathname} />

      <div className="mt-auto space-y-2 px-3 pb-8">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="flex w-full items-center gap-3 rounded-r-full px-5 py-3.5 text-medium-grey hover:bg-purple/10 hover:text-purple dark:hover:bg-white"
        >
          <Icon name="icon-hide-sidebar" alt="" />
          <span className="text-heading-m">Hide Sidebar</span>
        </button>
      </div>
    </aside>
  );

  function BoardsList({
    boards,
    pathname,
  }: {
    boards: BoardRow[];
    pathname: string;
  }) {
    return (
      <nav className="flex-1 overflow-y-auto pr-6">
        <p className="mb-5 pl-8 text-heading-s uppercase tracking-[2.4px] text-medium-grey">
          All Boards ({boards.length})
        </p>
        <ul>
          {boards.map((board) => {
            const active = pathname === `/boards/${board.id}`;
            return (
              <li key={board.id}>
                <Link
                  href={`/boards/${board.id}`}
                  className={`flex items-center gap-3 rounded-r-full pl-8 pr-6 py-3.5 text-heading-m ${
                    active
                      ? "bg-purple text-white"
                      : "text-medium-grey hover:bg-purple/10 hover:text-purple dark:hover:bg-white"
                  }`}
                >
                  <Icon name="icon-board" alt="" />
                  <span className="truncate">{board.name}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => openModal({ kind: "add-board" })}
              className="flex w-full items-center gap-3 pl-8 pr-6 py-3.5 text-heading-m text-purple hover:opacity-80"
            >
              <Icon name="icon-board" alt="" />
              <span>+ Create New Board</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  }
}

export function ShowSidebarFab() {
  const { sidebarOpen, setSidebarOpen } = useUi();
  if (sidebarOpen) return null;
  return (
    <button
      type="button"
      onClick={() => setSidebarOpen(true)}
      aria-label="Show sidebar"
      className="fixed bottom-8 left-0 z-30 hidden h-12 w-14 items-center justify-center rounded-r-full bg-purple text-white hover:bg-purple-hover lg:flex"
    >
      <Icon name="icon-show-sidebar" alt="" />
    </button>
  );
}
