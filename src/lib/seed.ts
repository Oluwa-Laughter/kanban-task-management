import { createClient } from "./supabase/server";
import seedData from "@/data/seed.json";

type SeedSubtask = { title: string; isCompleted: boolean };
type SeedTask = {
  title: string;
  description: string;
  status: string;
  subtasks: SeedSubtask[];
};
type SeedColumn = { name: string; tasks: SeedTask[] };
type SeedBoard = { name: string; columns: SeedColumn[] };
type SeedFile = { boards: SeedBoard[] };

export async function seedUserBoards(userId: string) {
  const supabase = await createClient();

  // Idempotent: only seed if the user has zero boards.
  const { count } = await supabase
    .from("boards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) > 0) return;

  const data = seedData as SeedFile;

  for (let bIdx = 0; bIdx < data.boards.length; bIdx += 1) {
    const board = data.boards[bIdx];
    const { data: insertedBoard, error: boardErr } = await supabase
      .from("boards")
      .insert({ user_id: userId, name: board.name, position: bIdx })
      .select("id")
      .single();
    if (boardErr || !insertedBoard) continue;

    for (let cIdx = 0; cIdx < board.columns.length; cIdx += 1) {
      const column = board.columns[cIdx];
      const { data: insertedCol, error: colErr } = await supabase
        .from("columns")
        .insert({
          board_id: insertedBoard.id,
          user_id: userId,
          name: column.name,
          position: cIdx,
        })
        .select("id")
        .single();
      if (colErr || !insertedCol) continue;

      for (let tIdx = 0; tIdx < column.tasks.length; tIdx += 1) {
        const task = column.tasks[tIdx];
        const { data: insertedTask, error: taskErr } = await supabase
          .from("tasks")
          .insert({
            column_id: insertedCol.id,
            user_id: userId,
            title: task.title,
            description: task.description ?? "",
            position: tIdx,
          })
          .select("id")
          .single();
        if (taskErr || !insertedTask) continue;

        if (task.subtasks.length > 0) {
          await supabase.from("subtasks").insert(
            task.subtasks.map((s, sIdx) => ({
              task_id: insertedTask.id,
              user_id: userId,
              title: s.title,
              is_completed: s.isCompleted,
              position: sIdx,
            }))
          );
        }
      }
    }
  }
}
