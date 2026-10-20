"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUi } from "./ui-store";
import { columnDotColor, cn } from "@/lib/utils";
import { moveTaskAction } from "@/lib/actions/tasks";
import type {
  BoardWithColumns,
  ColumnWithTasks,
  TaskRow,
  SubtaskRow,
} from "@/lib/supabase/types";

type Props = { board: BoardWithColumns };
type TaskWithSubs = TaskRow & { subtasks: SubtaskRow[] };

export function BoardView({ board }: Props) {
  const { openModal } = useUi();
  const [, startTransition] = useTransition();

  // Local mirror for optimistic drag
  const [columns, setColumns] = useState<ColumnWithTasks[]>(board.columns);
  // Sync if server data changes
  useMemoSync(board.columns, setColumns);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeTask, setActiveTask] = useState<TaskWithSubs | null>(null);

  function findColumnByTaskId(taskId: string) {
    return columns.find((c) => c.tasks.some((t) => t.id === taskId));
  }

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    const col = findColumnByTaskId(id);
    const t = col?.tasks.find((t) => t.id === id);
    if (t) setActiveTask(t);
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    setColumns((prev) => {
      const fromCol = prev.find((c) => c.tasks.some((t) => t.id === activeId));
      if (!fromCol) return prev;
      const toCol =
        prev.find((c) => c.id === overId) ??
        prev.find((c) => c.tasks.some((t) => t.id === overId));
      if (!toCol) return prev;
      if (fromCol.id === toCol.id) return prev;

      const taskIdx = fromCol.tasks.findIndex((t) => t.id === activeId);
      const movingTask = fromCol.tasks[taskIdx];
      const newFromTasks = [...fromCol.tasks];
      newFromTasks.splice(taskIdx, 1);

      const overIdx = toCol.tasks.findIndex((t) => t.id === overId);
      const insertAt = overIdx === -1 ? toCol.tasks.length : overIdx;
      const newToTasks = [...toCol.tasks];
      newToTasks.splice(insertAt, 0, { ...movingTask, column_id: toCol.id });

      return prev.map((c) => {
        if (c.id === fromCol.id) return { ...c, tasks: newFromTasks };
        if (c.id === toCol.id) return { ...c, tasks: newToTasks };
        return c;
      });
    });
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const overCol =
      columns.find((c) => c.id === overId) ??
      columns.find((c) => c.tasks.some((t) => t.id === overId));
    const fromCol = findColumnByTaskId(activeId);
    if (!overCol || !fromCol) return;

    let newIdx: number;
    if (fromCol.id === overCol.id) {
      const oldIdx = fromCol.tasks.findIndex((t) => t.id === activeId);
      const overIdx = overCol.tasks.findIndex((t) => t.id === overId);
      if (oldIdx === overIdx || overIdx === -1) return;
      newIdx = overIdx;
      setColumns((prev) =>
        prev.map((c) =>
          c.id === fromCol.id
            ? { ...c, tasks: arrayMove(c.tasks, oldIdx, overIdx) }
            : c
        )
      );
    } else {
      newIdx = overCol.tasks.findIndex((t) => t.id === activeId);
      if (newIdx === -1) newIdx = overCol.tasks.length;
    }

    startTransition(() => {
      void moveTaskAction(activeId, overCol.id, newIdx);
    });
  }

  if (columns.length === 0) {
    return <EmptyBoard boardId={board.id} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveTask(null);
        setColumns(board.columns);
      }}
    >
      <p className="sr-only">
        Move tasks using their drag handles. Press Space to pick up a task,
        use the arrow keys to move it, press Space again to drop it, or Escape to cancel.
      </p>
      <div className="flex h-full gap-6 overflow-x-auto p-6">
        {columns.map((col, idx) => (
          <Column key={col.id} column={col} dotColor={columnDotColor(idx)} />
        ))}
        <button
          type="button"
          onClick={() => openModal({ kind: "edit-board", boardId: board.id })}
          className="mt-10 flex h-[calc(100%-2.5rem)] min-h-[60vh] w-[280px] shrink-0 items-center justify-center rounded-md bg-gradient-to-b from-[#E9EFFA] to-[#E9EFFA]/50 text-heading-xl text-medium-grey hover:text-purple dark:from-[#2B2C37]/25 dark:to-[#2B2C37]/10"
        >
          + New Column
        </button>
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  column,
  dotColor,
}: {
  column: ColumnWithTasks;
  dotColor: string;
}) {
  const taskIds = useMemo(() => column.tasks.map((t) => t.id), [column.tasks]);

  return (
    <div className="flex w-[280px] shrink-0 flex-col">
      <div className="mb-6 flex items-center gap-3">
        <span
          className="h-[15px] w-[15px] rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <h2 className="text-heading-s uppercase tracking-[2.4px] text-medium-grey">
          {column.name} ({column.tasks.length})
        </h2>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <DroppableColumn columnId={column.id}>
          {column.tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </DroppableColumn>
      </SortableContext>
    </div>
  );
}

function DroppableColumn({
  columnId,
  children,
}: {
  columnId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-20 flex-col gap-5 rounded-md pb-12 transition-colors",
        isOver && "bg-purple/10"
      )}
    >
      {children}
    </div>
  );
}

function SortableTask({ task }: { task: TaskWithSubs }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <TaskCard task={task} />
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${task.title} to reorder`}
        className={cn(
          "absolute right-2 top-3 z-10 flex h-10 w-10 touch-none items-center justify-center rounded-md text-medium-grey hover:bg-purple/10 hover:text-purple focus-visible:outline-2 focus-visible:outline-purple dark:hover:bg-white/10",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <span aria-hidden="true" className="text-xl leading-none">⠿</span>
      </button>
    </div>
  );
}

function TaskCard({ task, dragging }: { task: TaskWithSubs; dragging?: boolean }) {
  const { openModal } = useUi();
  const completed = task.subtasks.filter((s) => s.is_completed).length;
  const total = task.subtasks.length;

  return (
    <button
      type="button"
      disabled={dragging}
      tabIndex={dragging ? -1 : undefined}
      aria-hidden={dragging ? true : undefined}
      onClick={() => openModal({ kind: "view-task", taskId: task.id })}
      className={cn(
        "group block w-full rounded-lg bg-white py-6 pl-4 pr-14 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-dark-grey",
        dragging && "rotate-2 cursor-grabbing shadow-lg"
      )}
    >
      <h3 className="text-heading-m text-black group-hover:text-purple dark:text-white dark:group-hover:text-purple">
        {task.title}
      </h3>
      {total > 0 ? (
        <p className="mt-2 text-body-m text-medium-grey">
          {completed} of {total} subtasks
        </p>
      ) : null}
    </button>
  );
}

function EmptyBoard({ boardId }: { boardId: string }) {
  const { openModal } = useUi();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-heading-l text-medium-grey">
        This board is empty. Create a new column to get started.
      </p>
      <button
        type="button"
        onClick={() => openModal({ kind: "edit-board", boardId })}
        className="btn-primary-large"
      >
        + Add New Column
      </button>
    </div>
  );
}

function useMemoSync<T>(source: T, set: (v: T) => void) {
  // Resync state whenever the source reference changes (e.g. after a server revalidation).
  useMemo(() => set(source), [source, set]);
}
