"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUi } from "./ui-store";
import { ThemeToggle } from "./theme-toggle";
import { Icon } from "./icons";
import type { BoardRow } from "@/lib/supabase/types";

type Props = { boards: BoardRow[] };

export function MobileSidebar({ boards }: Props) {
  const { mobileSidebarOpen, setMobileSidebarOpen, openModal } = useUi();
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  if (!mobileSidebarOpen) return null;

  return (
    <div
      id="mobile-board-picker"
      className="fixed inset-0 top-16 z-40 bg-black/50 lg:hidden"
      onClick={() => setMobileSidebarOpen(false)}
    >
      <div
        className="mx-auto mt-4 w-[90%] max-w-[264px] rounded-lg bg-white py-4 dark:bg-dark-grey"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4 pl-6 text-heading-s uppercase tracking-[2.4px] text-medium-grey">
          All Boards ({boards.length})
        </p>
        <ul className="pr-6">
          {boards.map((board) => {
            const active = pathname === `/boards/${board.id}`;
            return (
              <li key={board.id}>
                <Link
                  href={`/boards/${board.id}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-r-full pl-6 pr-6 py-3.5 text-heading-m ${
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
              onClick={() => {
                setMobileSidebarOpen(false);
                openModal({ kind: "add-board" });
              }}
              className="flex w-full items-center gap-3 pl-6 pr-6 py-3.5 text-heading-m text-purple hover:opacity-80"
            >
              <Icon name="icon-board" alt="" />
              <span>+ Create New Board</span>
            </button>
          </li>
        </ul>
        <div className="mt-4 px-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
