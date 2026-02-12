"use client";

import { Suspense } from "react";
import ListColumn from "./list-column";

interface ListsContainerProps {
  lists: Array<{
    id: string;
    board_id: string;
    title: string;
    position: number;
  }>;
  boardId: string;
}

export default function ListsContainer({
  lists,
  boardId,
}: ListsContainerProps) {
  if (!lists || lists.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No lists yet. Create one to get started!
      </div>
    );
  }

  return (
    <>
      {lists.map((list) => (
        <Suspense key={list.id} fallback={<div>Cargando...</div>}>
          <ListColumn list={list} boardId={boardId} />
        </Suspense>
      ))}
    </>
  );
}
