"use client";

import { useState } from "react";
import { Edit2, Trash2, Lock, Globe, Share2 } from "lucide-react";
import { deleteBoard, updateBoardVisibility } from "@/lib/actions/boards";
import EditBoardModal from "./edit-board-modal";
import { ShareBoardModal } from "./share-board-modal";
import { useRouter } from "next/navigation";

interface BoardOptionsMenuProps {
  board: {
    id: string;
    name: string;
    visibility: "private" | "public";
    owner_id: string;
  };
  onClose: () => void;
}

export default function BoardOptionsMenu({
  board,
  onClose,
}: BoardOptionsMenuProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingVisibility, setChangingVisibility] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro? Esto eliminará el board y todas sus listas y tarjetas.",
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteBoard(board.id);
      if (result.error) {
        alert("Error al eliminar: " + result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      alert("Error inesperado");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibility = board.visibility === "private" ? "public" : "private";

    setChangingVisibility(true);
    try {
      const result = await updateBoardVisibility(board.id, newVisibility);
      if (result.error) {
        alert("Error: " + result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Error inesperado");
      console.error(error);
    } finally {
      setChangingVisibility(false);
    }
  };

  return (
    <>
      <div className="absolute right-0 mt-2 w-48 bg-slate-600 rounded-lg shadow-lg z-50">
        <button
          onClick={() => setShowEditModal(true)}
          className="w-full text-left px-4 py-2 hover:bg-slate-500 flex items-center gap-2 text-white"
        >
          <Edit2 size={16} />
          Editar
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full text-left px-4 py-2 hover:bg-slate-500 flex items-center gap-2 text-white"
        >
          <Share2 size={16} />
          Compartir
        </button>
        <button
          onClick={handleToggleVisibility}
          disabled={changingVisibility}
          className="w-full text-left px-4 py-2 hover:bg-slate-500 flex items-center gap-2 text-white disabled:opacity-50"
        >
          {board.visibility === "private" ? (
            <>
              <Lock size={16} />
              {changingVisibility ? "Haciendo público..." : "Hacer Público"}
            </>
          ) : (
            <>
              <Globe size={16} />
              {changingVisibility ? "Haciendo privado..." : "Hacer Privado"}
            </>
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full text-left px-4 py-2 hover:bg-slate-500 flex items-center gap-2 text-red-400 disabled:opacity-50"
        >
          <Trash2 size={16} />
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>

      {showEditModal && (
        <EditBoardModal
          board={board}
          onClose={() => {
            setShowEditModal(false);
            onClose();
          }}
        />
      )}

      {showShareModal && (
        <ShareBoardModal
          boardId={board.id}
          onClose={() => {
            setShowShareModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
