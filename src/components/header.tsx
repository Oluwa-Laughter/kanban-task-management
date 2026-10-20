"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useUi } from "./ui-store";
import { Icon } from "./icons";
import { signOutAction } from "@/app/(auth)/actions";
import type { BoardWithColumns } from "@/lib/supabase/types";

type Props = {
  board: BoardWithColumns | null;
};

export function Header({ board }: Props) {
  const { openModal, setMobileSidebarOpen, mobileSidebarOpen } = useUi();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  const canAddTask = (board?.columns.length ?? 0) > 0;

  return (
    <header className="flex h-16 items-center border-b border-lines-light bg-white px-4 sm:h-20 sm:px-6 lg:h-24 lg:px-8 dark:border-lines-dark dark:bg-dark-grey">
      <div className="flex items-center gap-4 lg:hidden">
        <Image
          src="/assets/logo-mobile.svg"
          alt="kanban"
          width={24}
          height={25}
          priority
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2 pl-4 lg:pl-0">
        <button
          type="button"
          aria-label="Choose a board"
          aria-expanded={mobileSidebarOpen}
          aria-controls="mobile-board-picker"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex min-w-0 items-center gap-2 lg:hidden"
        >
          <span className="truncate text-heading-l text-black dark:text-white sm:text-heading-xl">
            {board?.name ?? "No board selected"}
          </span>
          <Icon
            name={mobileSidebarOpen ? "icon-chevron-up" : "icon-chevron-down"}
            alt=""
          />
        </button>
        <h1 className="hidden truncate text-heading-xl text-black dark:block dark:text-white lg:block">
          {board?.name ?? "No board selected"}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={!canAddTask}
          onClick={() => openModal({ kind: "add-task" })}
          className="btn-primary-large hidden sm:inline-flex"
        >
          + Add New Task
        </button>
        <button
          type="button"
          aria-label="Add new task"
          disabled={!canAddTask}
          onClick={() => openModal({ kind: "add-task" })}
          className="inline-flex h-8 w-12 items-center justify-center rounded-full bg-purple text-white hover:bg-purple-hover disabled:opacity-25 sm:hidden"
        >
          <Icon name="icon-add-task-mobile" alt="" />
        </button>

        {board ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Board options"
              aria-expanded={menuOpen}
              aria-controls="board-options"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-md"
            >
              <Icon name="icon-vertical-ellipsis" alt="" />
            </button>
            {menuOpen ? (
              <div id="board-options" className="absolute right-0 top-full z-20 mt-2 w-48 space-y-4 rounded-lg bg-white p-4 shadow-lg dark:bg-very-dark-grey">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openModal({ kind: "edit-board", boardId: board.id });
                  }}
                  className="block w-full text-left text-medium-grey hover:opacity-80"
                >
                  Edit Board
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openModal({
                      kind: "delete-board",
                      boardId: board.id,
                      boardName: board.name,
                    });
                  }}
                  className="block w-full text-left text-red hover:opacity-80"
                >
                  Delete Board
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        <form action={signOutAction}>
          <button
            type="submit"
            className="whitespace-nowrap rounded-full px-2 py-2 text-heading-m text-medium-grey transition-colors hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:px-3"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
