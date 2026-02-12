"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { deleteCard } from "@/lib/actions/cards";
import EditCardModal from "./edit-card-modal";
import { useRouter } from "next/navigation";

interface CardOptionsMenuProps {
  card: {
    id: string;
    list_id: string;
    title: string;
    description?: string;
    position: number;
  };
  listId: string;
  boardId: string;
  onClose: () => void;
  onCardDeleted?: () => void;
  onCardUpdated?: (updatedCard: any) => void;
}

export default function CardOptionsMenu({
  card,
  listId,
  boardId,
  onClose,
  onCardDeleted,
  onCardUpdated,
}: CardOptionsMenuProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarjeta?")) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteCard(card.id, listId);
      if (result.error) {
        alert("Error al eliminar: " + result.error);
      } else {
        onCardDeleted?.();
        router.refresh();
        onClose();
      }
    } catch (error) {
      alert("Error inesperado");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="absolute right-0 mt-2 w-40 bg-slate-500 rounded-lg shadow-lg z-50">
        <button
          onClick={() => setShowEditModal(true)}
          className="w-full text-left px-4 py-2 hover:bg-slate-400 flex items-center gap-2 text-white text-sm"
        >
          <Edit2 size={14} />
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full text-left px-4 py-2 hover:bg-slate-400 flex items-center gap-2 text-red-400 disabled:opacity-50 text-sm"
        >
          <Trash2 size={14} />
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>

      {showEditModal && (
        <EditCardModal
          card={card}
          listId={listId}
          onClose={() => {
            setShowEditModal(false);
            onClose();
          }}
          onCardUpdated={onCardUpdated}
        />
      )}
    </>
  );
}
