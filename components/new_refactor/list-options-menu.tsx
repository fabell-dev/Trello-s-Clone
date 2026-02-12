"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { deleteList } from "@/lib/actions/lists";
import EditListModal from "./edit-list-modal";
import { useRouter } from "next/navigation";

interface ListOptionsMenuProps {
  list: {
    id: string;
    board_id: string;
    title: string;
    position: number;
  };
  onClose: () => void;
}

export default function ListOptionsMenu({
  list,
  onClose,
}: ListOptionsMenuProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm("¿Estás seguro? Esto eliminará la lista y todas sus tarjetas.")
    ) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteList(list.id, list.board_id);
      if (result.error) {
        alert("Error al eliminar: " + result.error);
      } else {
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
        <EditListModal
          list={list}
          onClose={() => {
            setShowEditModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
