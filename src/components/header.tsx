"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useUi } from "./ui-store";
import { Icon } from "./icons";
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
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
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
      <div className="flex flex-1 items-center gap-2 pl-4 lg:pl-0">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex items-center gap-2 lg:cursor-default"
        >
          <h1 className="truncate text-heading-l text-black dark:text-white sm:text-heading-xl">
            {board?.name ?? "No board selected"}
          </h1>
          <span className="lg:hidden">
            <Icon
              name={mobileSidebarOpen ? "icon-chevron-up" : "icon-chevron-down"}
              alt=""
            />
          </span>
        </button>
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
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-4 items-center justify-center"
            >
              <Icon name="icon-vertical-ellipsis" alt="" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full mt-4 w-48 space-y-4 rounded-lg bg-white p-4 shadow-lg dark:bg-very-dark-grey">
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
      </div>
    </header>
  );
}
