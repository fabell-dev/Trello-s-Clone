"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BoardOptionsMenu from "./board-options-menu";
import BoardMembers from "./board-members";

interface BoardHeaderProps {
  board: {
    id: string;
    name: string;
    visibility: "private" | "public";
    owner_id: string;
  };
  isOwner?: boolean;
}

export default function BoardHeader({
  board,
  isOwner = false,
}: BoardHeaderProps) {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="bg-slate-700 border-b border-slate-600 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="hover:bg-slate-600 p-2 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{board.name}</h1>
          <p className="text-xs text-gray-400">
            {board.visibility === "private" ? "🔒 Private" : "🌐 Public"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <BoardMembers boardId={board.id} isOwner={isOwner} />
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="hover:bg-slate-600 p-2 rounded"
          >
            <MoreVertical size={20} />
          </button>
          {showOptions && (
            <BoardOptionsMenu
              board={board}
              onClose={() => setShowOptions(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
