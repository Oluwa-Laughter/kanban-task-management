import { createClient } from "./supabase/server";
import type { BoardRow, BoardWithColumns } from "./supabase/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function listBoards(): Promise<BoardRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getBoardWithChildren(
  boardId: string
): Promise<BoardWithColumns | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select(
      `*,
       columns:columns (
         *,
         tasks:tasks (
           *,
           subtasks:subtasks (*)
         )
       )`
    )
    .eq("id", boardId)
    .single();
  if (error) return null;
  if (!data) return null;

  const board = data as unknown as BoardWithColumns;
  board.columns.sort((a, b) => a.position - b.position);
  for (const col of board.columns) {
    col.tasks.sort((a, b) => a.position - b.position);
    for (const task of col.tasks) {
      task.subtasks.sort((a, b) => a.position - b.position);
    }
  }
  return board;
}
