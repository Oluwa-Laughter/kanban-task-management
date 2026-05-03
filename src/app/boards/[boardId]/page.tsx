import { notFound } from "next/navigation";
import { listBoards, getBoardWithChildren } from "@/lib/queries";
import { AppShell } from "@/components/app-shell";
import { BoardView } from "@/components/board-view";

type Props = { params: Promise<{ boardId: string }> };

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params;
  const [boards, board] = await Promise.all([
    listBoards(),
    getBoardWithChildren(boardId),
  ]);
  if (!board) notFound();

  return (
    <AppShell boards={boards} board={board}>
      <BoardView board={board} />
    </AppShell>
  );
}
