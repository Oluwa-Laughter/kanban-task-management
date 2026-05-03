"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().default(""),
  columnId: z.string().min(1, "Column is required"),
  subtasks: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().trim().min(1, "Subtask can't be empty"),
        isCompleted: z.boolean().default(false),
      })
    )
    .default([]),
});

export type TaskFormState = {
  error: string | null;
  fieldErrors?: {
    title?: string;
    columnId?: string;
    subtasks?: Record<number, string>;
  };
};

export async function createTaskAction(
  _prev: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: lastTask } = await supabase
    .from("tasks")
    .select("position")
    .eq("column_id", parsed.data.columnId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle<{ position: number }>();
  const position = (lastTask?.position ?? -1) + 1;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      column_id: parsed.data.columnId,
      title: parsed.data.title,
      description: parsed.data.description,
      position,
    })
    .select("id")
    .single();
  if (error || !task) return { error: error?.message ?? "Failed to create task" };

  if (parsed.data.subtasks.length > 0) {
    await supabase.from("subtasks").insert(
      parsed.data.subtasks.map((s, idx) => ({
        task_id: task.id,
        user_id: user.id,
        title: s.title,
        is_completed: s.isCompleted,
        position: idx,
      }))
    );
  }

  revalidatePath("/", "layout");
  return { error: null };
}

export async function updateTaskAction(
  taskId: string,
  _prev: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const parsed = parseTaskForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  // Detect column change for repositioning
  const { data: prevTask } = await supabase
    .from("tasks")
    .select("column_id, position")
    .eq("id", taskId)
    .single<{ column_id: string; position: number }>();

  const updates: {
    title: string;
    description: string;
    column_id: string;
    position?: number;
  } = {
    title: parsed.data.title,
    description: parsed.data.description,
    column_id: parsed.data.columnId,
  };

  if (prevTask && prevTask.column_id !== parsed.data.columnId) {
    const { data: last } = await supabase
      .from("tasks")
      .select("position")
      .eq("column_id", parsed.data.columnId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();
    updates.position = (last?.position ?? -1) + 1;
  }

  const { error: updErr } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId);
  if (updErr) return { error: updErr.message };

  // Reconcile subtasks
  const { data: existing } = await supabase
    .from("subtasks")
    .select("id")
    .eq("task_id", taskId);

  const submittedIds = new Set(
    parsed.data.subtasks.map((s) => s.id).filter(Boolean) as string[]
  );
  const toDelete = (existing ?? [])
    .map((s) => s.id)
    .filter((id) => !submittedIds.has(id));
  if (toDelete.length > 0) {
    await supabase.from("subtasks").delete().in("id", toDelete);
  }

  for (let i = 0; i < parsed.data.subtasks.length; i += 1) {
    const s = parsed.data.subtasks[i];
    if (s.id) {
      await supabase
        .from("subtasks")
        .update({ title: s.title, position: i })
        .eq("id", s.id);
    } else {
      await supabase.from("subtasks").insert({
        task_id: taskId,
        user_id: user.id,
        title: s.title,
        is_completed: s.isCompleted,
        position: i,
      });
    }
  }

  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteTaskAction(taskId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/", "layout");
}

export async function toggleSubtaskAction(subtaskId: string, completed: boolean) {
  const supabase = await createClient();
  await supabase
    .from("subtasks")
    .update({ is_completed: completed })
    .eq("id", subtaskId);
  revalidatePath("/", "layout");
}

export async function moveTaskAction(
  taskId: string,
  targetColumnId: string,
  targetIndex: number
) {
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("column_id")
    .eq("id", taskId)
    .single<{ column_id: string }>();
  if (!task) return;

  // Get current ordering of tasks in target column (excluding the moved task)
  const { data: siblings } = await supabase
    .from("tasks")
    .select("id, position")
    .eq("column_id", targetColumnId)
    .order("position", { ascending: true })
    .returns<{ id: string; position: number }[]>();

  const filtered = (siblings ?? []).filter((s) => s.id !== taskId);
  const safeIndex = Math.max(0, Math.min(targetIndex, filtered.length));
  filtered.splice(safeIndex, 0, { id: taskId, position: 0 });

  // Persist new positions and column for moved task
  await supabase
    .from("tasks")
    .update({ column_id: targetColumnId })
    .eq("id", taskId);

  // Bulk update positions
  for (let i = 0; i < filtered.length; i += 1) {
    await supabase
      .from("tasks")
      .update({ position: i })
      .eq("id", filtered[i].id);
  }

  // If source column is different, also reflow source positions
  if (task.column_id !== targetColumnId) {
    const { data: src } = await supabase
      .from("tasks")
      .select("id")
      .eq("column_id", task.column_id)
      .order("position", { ascending: true })
      .returns<{ id: string }[]>();
    if (src) {
      for (let i = 0; i < src.length; i += 1) {
        await supabase
          .from("tasks")
          .update({ position: i })
          .eq("id", src[i].id);
      }
    }
  }

  revalidatePath("/", "layout");
}

function parseTaskForm(
  formData: FormData
): { success: true; data: z.infer<typeof taskSchema> } | { success: false; state: TaskFormState } {
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const columnId = String(formData.get("columnId") ?? "");
  const subtaskTitles = formData.getAll("subtaskTitle").map((v) => String(v));
  const subtaskIds = formData.getAll("subtaskId").map((v) => String(v));
  const subtaskCompleted = formData.getAll("subtaskCompleted").map((v) => v === "true");
  const subtasks = subtaskTitles.map((t, idx) => ({
    id: subtaskIds[idx] || undefined,
    title: t,
    isCompleted: subtaskCompleted[idx] ?? false,
  }));

  const result = taskSchema.safeParse({ title, description, columnId, subtasks });
  if (!result.success) {
    const fieldErrors: TaskFormState["fieldErrors"] = { subtasks: {} };
    for (const issue of result.error.issues) {
      if (issue.path[0] === "title") fieldErrors.title = issue.message;
      if (issue.path[0] === "columnId") fieldErrors.columnId = issue.message;
      if (issue.path[0] === "subtasks" && typeof issue.path[1] === "number") {
        fieldErrors.subtasks![issue.path[1] as number] = issue.message;
      }
    }
    return {
      success: false,
      state: { error: "Please fix the highlighted fields.", fieldErrors },
    };
  }
  return { success: true, data: result.data };
}
