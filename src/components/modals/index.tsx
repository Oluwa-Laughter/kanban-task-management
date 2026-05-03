"use client";

import { useUi } from "../ui-store";
import { BoardFormModal } from "./board-form-modal";
import { TaskFormModal } from "./task-form-modal";
import { ViewTaskModal } from "./view-task-modal";
import { ConfirmDeleteModal } from "./confirm-delete-modal";
import type { BoardWithColumns } from "@/lib/supabase/types";

type Props = { board: BoardWithColumns | null };

export function Modals({ board }: Props) {
  const { modal } = useUi();
  const columns = board?.columns ?? [];
  const allTasks = columns.flatMap((c) =>
    c.tasks.map((t) => ({ ...t, _columnId: c.id }))
  );

  if (modal.kind === "add-board") {
    return <BoardFormModal key="add-board" open mode="create" />;
  }

  if (modal.kind === "edit-board") {
    return (
      <BoardFormModal
        key={`edit-board:${modal.boardId}`}
        open
        mode="edit"
        boardId={modal.boardId}
        initialName={board?.name}
        initialColumns={columns}
      />
    );
  }

  if (modal.kind === "add-task") {
    return (
      <TaskFormModal
        key={`add-task:${modal.defaultColumnId ?? ""}`}
        open
        mode="create"
        columns={columns}
        defaults={{ columnId: modal.defaultColumnId }}
      />
    );
  }

  if (modal.kind === "edit-task") {
    const t = allTasks.find((x) => x.id === modal.taskId);
    if (!t) return null;
    return (
      <TaskFormModal
        key={`edit-task:${t.id}`}
        open
        mode="edit"
        taskId={t.id}
        columns={columns}
        defaults={{
          title: t.title,
          description: t.description ?? "",
          columnId: t.column_id,
          subtasks: t.subtasks,
        }}
      />
    );
  }

  if (modal.kind === "view-task") {
    const t = allTasks.find((x) => x.id === modal.taskId) ?? null;
    return (
      <ViewTaskModal
        key={`view-task:${modal.taskId}`}
        open
        task={t}
        columns={columns}
      />
    );
  }

  if (modal.kind === "delete-board") {
    return (
      <ConfirmDeleteModal
        key={`del-board:${modal.boardId}`}
        open
        kind="board"
        id={modal.boardId}
        name={modal.boardName}
      />
    );
  }

  if (modal.kind === "delete-task") {
    return (
      <ConfirmDeleteModal
        key={`del-task:${modal.taskId}`}
        open
        kind="task"
        id={modal.taskId}
        name={modal.taskTitle}
      />
    );
  }

  return null;
}
