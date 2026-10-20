"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Modal } from "../modal";
import { Icon } from "../icons";
import { useUi } from "../ui-store";
import {
  toggleSubtaskAction,
  updateTaskAction,
} from "@/lib/actions/tasks";
import type { ColumnRow, SubtaskRow, TaskRow } from "@/lib/supabase/types";

type Props = {
  open: boolean;
  task: (TaskRow & { subtasks: SubtaskRow[] }) | null;
  columns: ColumnRow[];
};

export function ViewTaskModal({ open, task, columns }: Props) {
  const { closeModal, openModal } = useUi();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Optimistic local state for subtasks + status. Parent uses `key` to
  // remount when a different task is opened, so initializers always run.
  const [subs, setSubs] = useState<SubtaskRow[]>(() => task?.subtasks ?? []);
  const [columnId, setColumnId] = useState<string>(() => task?.column_id ?? "");

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

  if (!task) return null;

  const completed = subs.filter((s) => s.is_completed).length;

  const onToggleSub = (sub: SubtaskRow) => {
    const next = !sub.is_completed;
    setSubs((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, is_completed: next } : s))
    );
    startTransition(() => {
      void toggleSubtaskAction(sub.id, next);
    });
  };

  const onChangeColumn = (newColId: string) => {
    setColumnId(newColId);
    const fd = new FormData();
    fd.set("title", task.title);
    fd.set("description", task.description ?? "");
    fd.set("columnId", newColId);
    for (const s of subs) {
      fd.append("subtaskId", s.id);
      fd.append("subtaskTitle", s.title);
      fd.append("subtaskCompleted", s.is_completed ? "true" : "false");
    }
    startTransition(() => {
      void updateTaskAction(task.id, { error: null }, fd);
    });
  };

  return (
    <Modal open={open} onClose={closeModal} title={task.title}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-heading-l text-black dark:text-white">
          {task.title}
        </h2>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Task options"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md"
          >
            <Icon name="icon-vertical-ellipsis" alt="" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full mt-4 w-48 space-y-4 rounded-lg bg-white p-4 shadow-lg dark:bg-very-dark-grey">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openModal({ kind: "edit-task", taskId: task.id });
                }}
                className="block w-full text-left text-medium-grey hover:opacity-80"
              >
                Edit Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openModal({
                    kind: "delete-task",
                    taskId: task.id,
                    taskTitle: task.title,
                  });
                }}
                className="block w-full text-left text-red hover:opacity-80"
              >
                Delete Task
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {task.description ? (
        <p className="mt-6 text-body-l text-medium-grey">{task.description}</p>
      ) : null}

      {subs.length > 0 ? (
        <div className="mt-6">
          <p className="label">
            Subtasks ({completed} of {subs.length})
          </p>
          <ul className="mt-4 space-y-2">
            {subs.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-start gap-4 rounded bg-light-grey p-3 hover:bg-purple/25 focus-within:ring-2 focus-within:ring-purple dark:bg-very-dark-grey">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      s.is_completed
                        ? "border-purple bg-purple"
                        : "border-medium-grey/25 bg-white dark:bg-dark-grey"
                    }`}
                  >
                    {s.is_completed ? (
                      <Icon name="icon-check" alt="" />
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={s.is_completed}
                    onChange={() => onToggleSub(s)}
                  />
                  <span
                    className={`text-body-m ${
                      s.is_completed
                        ? "text-black/50 line-through dark:text-white/50"
                        : "text-black dark:text-white"
                    }`}
                  >
                    {s.title}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6">
        <label className="label" htmlFor="status-select">Current Status</label>
        <select
          id="status-select"
          value={columnId}
          onChange={(e) => onChangeColumn(e.target.value)}
          className="input mt-2"
        >
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
}
