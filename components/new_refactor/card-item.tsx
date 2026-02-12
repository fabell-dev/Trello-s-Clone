"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import CardOptionsMenu from "./card-options-menu";

interface CardItemProps {
  card: {
    id: string;
    list_id: string;
    title: string;
    description?: string;
    position: number;
  };
  listId: string;
  boardId: string;
  onCardDeleted?: () => void;
  onCardUpdated?: (updatedCard: any) => void;
}

export default function CardItem({
  card,
  listId,
  boardId,
  onCardDeleted,
  onCardUpdated,
}: CardItemProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="bg-slate-700 rounded p-3 cursor-pointer hover:bg-slate-750 transition group relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{card.title}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="opacity-0 group-hover:opacity-100 hover:bg-slate-600 p-1 rounded ml-2"
          >
            <MoreVertical size={14} />
          </button>
          {showOptions && (
            <CardOptionsMenu
              card={card}
              listId={listId}
              boardId={boardId}
              onClose={() => setShowOptions(false)}
              onCardDeleted={onCardDeleted}
              onCardUpdated={onCardUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
}
