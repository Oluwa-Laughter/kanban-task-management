"use client";

import { useActionState, useEffect, useState } from "react";
import { Modal } from "../modal";
import { Icon } from "../icons";
import { useUi } from "../ui-store";
import {
  createTaskAction,
  updateTaskAction,
  type TaskFormState,
} from "@/lib/actions/tasks";
import type { ColumnRow, SubtaskRow } from "@/lib/supabase/types";

const initial: TaskFormState = { error: null };

type Props = {
  open: boolean;
  mode: "create" | "edit";
  taskId?: string;
  columns: ColumnRow[];
  defaults?: {
    title?: string;
    description?: string;
    columnId?: string;
    subtasks?: SubtaskRow[];
  };
};

type DraftSub = {
  id?: string;
  title: string;
  isCompleted: boolean;
  key: string;
};

export function TaskFormModal({
  open,
  mode,
  taskId,
  columns,
  defaults,
}: Props) {
  const { closeModal } = useUi();

  const action = mode === "create"
    ? createTaskAction
    : updateTaskAction.bind(null, taskId!);

  const [state, formAction, pending] = useActionState(action, initial);

  // Lazy initializers — parent supplies a fresh `key` per open so we remount
  // rather than syncing state in an effect.
  const [title, setTitle] = useState(() => defaults?.title ?? "");
  const [description, setDescription] = useState(
    () => defaults?.description ?? ""
  );
  const [columnId, setColumnId] = useState(
    () => defaults?.columnId ?? columns[0]?.id ?? ""
  );
  const [subs, setSubs] = useState<DraftSub[]>(() =>
    defaults?.subtasks && defaults.subtasks.length > 0
      ? defaults.subtasks.map((s) => ({
          id: s.id,
          title: s.title,
          isCompleted: s.is_completed,
          key: s.id,
        }))
      : mode === "create"
      ? [
          { title: "", isCompleted: false, key: rid() },
          { title: "", isCompleted: false, key: rid() },
        ]
      : []
  );

  // Close after a successful submit (no error returned)
  const [submittedAt, setSubmittedAt] = useState(0);
  useEffect(() => {
    if (submittedAt && !pending && !state.error && !state.fieldErrors) {
      closeModal();
    }
  }, [submittedAt, pending, state, closeModal]);

  return (
    <Modal open={open} onClose={closeModal}>
      <h2 className="text-heading-l text-black dark:text-white">
        {mode === "create" ? "Add New Task" : "Edit Task"}
      </h2>
      <form
        action={formAction}
        onSubmit={() => setSubmittedAt(Date.now())}
        className="mt-6 space-y-6"
      >
        <div>
          <label className="label" htmlFor="task-title">Title</label>
          <input
            id="task-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Take coffee break"
            className={`input mt-2 ${state.fieldErrors?.title ? "input-error" : ""}`}
          />
          {state.fieldErrors?.title ? (
            <p className="mt-1 text-body-m text-red">{state.fieldErrors.title}</p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
            className="input mt-2 resize-none"
          />
        </div>

        <div>
          <p className="label">Subtasks</p>
          <div className="mt-2 space-y-3">
            {subs.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-4">
                <input type="hidden" name="subtaskId" value={s.id ?? ""} />
                <input
                  type="hidden"
                  name="subtaskCompleted"
                  value={s.isCompleted ? "true" : "false"}
                />
                <input
                  type="text"
                  name="subtaskTitle"
                  value={s.title}
                  onChange={(e) =>
                    setSubs((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, title: e.target.value } : p
                      )
                    )
                  }
                  placeholder="e.g. Make coffee"
                  className={`input ${
                    state.fieldErrors?.subtasks?.[idx] ? "input-error" : ""
                  }`}
                />
                <button
                  type="button"
                  aria-label="Remove subtask"
                  onClick={() =>
                    setSubs((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="text-medium-grey hover:text-red"
                >
                  <Icon name="icon-cross" alt="" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setSubs((prev) => [
                ...prev,
                { title: "", isCompleted: false, key: rid() },
              ])
            }
            className="btn-secondary mt-3 w-full"
          >
            + Add New Subtask
          </button>
        </div>

        <div>
          <label className="label" htmlFor="task-status">Status</label>
          <select
            id="task-status"
            name="columnId"
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className="input mt-2"
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {state.error ? (
          <p className="text-body-l text-red">{state.error}</p>
        ) : null}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
            ? "Create Task"
            : "Save Changes"}
        </button>
      </form>
    </Modal>
  );
}

function rid() {
  return Math.random().toString(36).slice(2);
}
