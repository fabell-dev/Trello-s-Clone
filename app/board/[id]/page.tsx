import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BoardHeader from "@/components/new_refactor/board-header";
import ListsContainer from "@/components/new_refactor/lists-container";
import CreateListButton from "@/components/new_refactor/create-list-button";

interface Props {
  params: Promise<{ id: string }>;
}

async function BoardContent({ boardId }: { boardId: string }) {
  const supabase = await createClient();

  // Obtener el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Obtener el board
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .single();

  if (boardError || !board) {
    notFound();
  }

  // Obtener las listas del board
  const { data: lists } = await supabase
    .from("lists")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  // Verificar si el usuario es propietario o miembro con rol owner
  let isOwner = user?.id === board.owner_id;

  if (!isOwner && user?.id) {
    const { data: memberAsOwner } = await supabase
      .from("board_members")
      .select("id")
      .eq("board_id", boardId)
      .eq("user_id", user.id)
      .eq("role", "owner")
      .single();

    isOwner = !!memberAsOwner;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-800">
      <BoardHeader board={board} isOwner={isOwner} />
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4">
          <ListsContainer lists={lists || []} boardId={boardId} />
          <CreateListButton boardId={boardId} />
        </div>
      </div>
    </div>
  );
}

async function BoardPageWrapper({ params }: Props) {
  const { id } = await params;
  return <BoardContent boardId={id} />;
}

export default function BoardPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="text-white">Cargando board...</div>}>
      <BoardPageWrapper params={params} />
    </Suspense>
  );
}
