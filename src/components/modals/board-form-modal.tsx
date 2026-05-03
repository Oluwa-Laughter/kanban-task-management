"use client";

import { useActionState, useState, useEffect } from "react";
import { Modal } from "../modal";
import { Icon } from "../icons";
import {
  createBoardAction,
  updateBoardAction,
  type BoardFormState,
} from "@/lib/actions/boards";
import { useUi } from "../ui-store";
import type { ColumnRow } from "@/lib/supabase/types";

const initial: BoardFormState = { error: null };

type Props = {
  open: boolean;
  mode: "create" | "edit";
  boardId?: string;
  initialName?: string;
  initialColumns?: ColumnRow[];
};

type DraftColumn = { id?: string; name: string; key: string };

export function BoardFormModal({
  open,
  mode,
  boardId,
  initialName = "",
  initialColumns = [],
}: Props) {
  const { closeModal } = useUi();

  const action = mode === "create"
    ? createBoardAction
    : updateBoardAction.bind(null, boardId!);

  const [state, formAction, pending] = useActionState(action, initial);

  // Lazy initializers run only when the component mounts. The parent uses a
  // `key` prop tied to the modal kind/id so that opening a different board
  // remounts this component with fresh state.
  const [name, setName] = useState(() => initialName);
  const [columns, setColumns] = useState<DraftColumn[]>(() =>
    initialColumns.length > 0
      ? initialColumns.map((c) => ({ id: c.id, name: c.name, key: c.id }))
      : mode === "create"
      ? [
          { name: "Todo", key: rid() },
          { name: "Doing", key: rid() },
        ]
      : []
  );

  // Close on success for edit mode
  useEffect(() => {
    if (mode === "edit" && state.boardId && !state.error) {
      closeModal();
    }
  }, [state, mode, closeModal]);

  return (
    <Modal open={open} onClose={closeModal}>
      <h2 className="text-heading-l text-black dark:text-white">
        {mode === "create" ? "Add New Board" : "Edit Board"}
      </h2>
      <form action={formAction} className="mt-6 space-y-6">
        <div>
          <label className="label" htmlFor="board-name">Board Name</label>
          <input
            id="board-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Web Design"
            className={`input mt-2 ${state.fieldErrors?.name ? "input-error" : ""}`}
          />
          {state.fieldErrors?.name ? (
            <p className="mt-1 text-body-m text-red">{state.fieldErrors.name}</p>
          ) : null}
        </div>

        <div>
          <p className="label">Board Columns</p>
          <div className="mt-2 space-y-3">
            {columns.map((col, idx) => (
              <div key={col.key} className="flex items-center gap-4">
                <input
                  type="hidden"
                  name="columnId"
                  value={col.id ?? ""}
                />
                <input
                  type="text"
                  name="columnName"
                  value={col.name}
                  onChange={(e) =>
                    setColumns((prev) =>
                      prev.map((c, i) =>
                        i === idx ? { ...c, name: e.target.value } : c
                      )
                    )
                  }
                  placeholder="e.g. In Progress"
                  className={`input ${
                    state.fieldErrors?.columns?.[idx] ? "input-error" : ""
                  }`}
                />
                <button
                  type="button"
                  aria-label="Remove column"
                  onClick={() =>
                    setColumns((prev) => prev.filter((_, i) => i !== idx))
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
              setColumns((prev) => [...prev, { name: "", key: rid() }])
            }
            className="btn-secondary mt-3 w-full"
          >
            + Add New Column
          </button>
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
            ? "Create New Board"
            : "Save Changes"}
        </button>
      </form>
    </Modal>
  );
}

function rid() {
  return Math.random().toString(36).slice(2);
}
