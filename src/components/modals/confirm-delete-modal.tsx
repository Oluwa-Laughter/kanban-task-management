"use client";

import { useTransition } from "react";
import { Modal } from "../modal";
import { useUi } from "../ui-store";
import { deleteBoardAction } from "@/lib/actions/boards";
import { deleteTaskAction } from "@/lib/actions/tasks";

type Props = {
  open: boolean;
  kind: "board" | "task";
  id: string;
  name: string;
};

export function ConfirmDeleteModal({ open, kind, id, name }: Props) {
  const { closeModal } = useUi();
  const [pending, startTransition] = useTransition();

  const isBoard = kind === "board";

  const onConfirm = () => {
    startTransition(async () => {
      if (isBoard) {
        await deleteBoardAction(id);
      } else {
        await deleteTaskAction(id);
        closeModal();
      }
    });
  };

  return (
    <Modal open={open} onClose={closeModal} title={`Delete ${kind}`}>
      <h2 className="text-heading-l text-red">
        Delete this {isBoard ? "board" : "task"}?
      </h2>
      <p className="mt-6 text-body-l text-medium-grey">
        {isBoard
          ? `Are you sure you want to delete the '${name}' board? This action will remove all columns and tasks and cannot be reversed.`
          : `Are you sure you want to delete the '${name}' task and its subtasks? This action cannot be reversed.`}
      </p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="btn-destructive flex-1"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
        <button
          type="button"
          onClick={closeModal}
          disabled={pending}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
