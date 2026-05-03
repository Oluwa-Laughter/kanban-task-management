"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const boardSchema = z.object({
  name: z.string().trim().min(1, "Board name is required"),
  columns: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().trim().min(1, "Column name can't be empty"),
      })
    )
    .default([]),
});

export type BoardFormState = {
  error: string | null;
  fieldErrors?: { name?: string; columns?: Record<number, string> };
  boardId?: string;
};

export async function createBoardAction(
  _prev: BoardFormState,
  formData: FormData
): Promise<BoardFormState> {
  const parsed = parseBoardForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: existing } = await supabase
    .from("boards")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle<{ position: number }>();
  const nextPosition = (existing?.position ?? -1) + 1;

  const { data: board, error } = await supabase
    .from("boards")
    .insert({ user_id: user.id, name: parsed.data.name, position: nextPosition })
    .select("id")
    .single();
  if (error || !board) return { error: error?.message ?? "Failed to create board" };

  if (parsed.data.columns.length > 0) {
    await supabase.from("columns").insert(
      parsed.data.columns.map((c, idx) => ({
        board_id: board.id,
        user_id: user.id,
        name: c.name,
        position: idx,
      }))
    );
  }

  revalidatePath("/", "layout");
  redirect(`/boards/${board.id}`);
}

export async function updateBoardAction(
  boardId: string,
  _prev: BoardFormState,
  formData: FormData
): Promise<BoardFormState> {
  const parsed = parseBoardForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error: nameErr } = await supabase
    .from("boards")
    .update({ name: parsed.data.name })
    .eq("id", boardId);
  if (nameErr) return { error: nameErr.message };

  // Reconcile columns: keep ones with id, update name+position; insert new ones; delete removed.
  const { data: existingCols } = await supabase
    .from("columns")
    .select("id")
    .eq("board_id", boardId);

  const submittedIds = new Set(
    parsed.data.columns.map((c) => c.id).filter(Boolean) as string[]
  );
  const toDelete = (existingCols ?? [])
    .map((c) => c.id)
    .filter((id) => !submittedIds.has(id));
  if (toDelete.length > 0) {
    await supabase.from("columns").delete().in("id", toDelete);
  }

  for (let i = 0; i < parsed.data.columns.length; i += 1) {
    const c = parsed.data.columns[i];
    if (c.id) {
      await supabase
        .from("columns")
        .update({ name: c.name, position: i })
        .eq("id", c.id);
    } else {
      await supabase.from("columns").insert({
        board_id: boardId,
        user_id: user.id,
        name: c.name,
        position: i,
      });
    }
  }

  revalidatePath("/", "layout");
  return { error: null, boardId };
}

export async function deleteBoardAction(boardId: string) {
  const supabase = await createClient();
  await supabase.from("boards").delete().eq("id", boardId);
  revalidatePath("/", "layout");
  redirect("/");
}

function parseBoardForm(
  formData: FormData
): { success: true; data: z.infer<typeof boardSchema> } | { success: false; state: BoardFormState } {
  const name = String(formData.get("name") ?? "");
  const columnNames = formData.getAll("columnName").map((v) => String(v));
  const columnIds = formData.getAll("columnId").map((v) => String(v));
  const columns = columnNames.map((n, idx) => ({
    id: columnIds[idx] || undefined,
    name: n,
  }));

  const result = boardSchema.safeParse({ name, columns });
  if (!result.success) {
    const fieldErrors: BoardFormState["fieldErrors"] = { columns: {} };
    for (const issue of result.error.issues) {
      if (issue.path[0] === "name") fieldErrors.name = issue.message;
      if (issue.path[0] === "columns" && typeof issue.path[1] === "number") {
        fieldErrors.columns![issue.path[1] as number] = issue.message;
      }
    }
    return {
      success: false,
      state: { error: "Please fix the highlighted fields.", fieldErrors },
    };
  }
  return { success: true, data: result.data };
}
