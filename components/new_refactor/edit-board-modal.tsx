"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updateBoard } from "@/lib/actions/boards";
import { useRouter } from "next/navigation";

interface EditBoardModalProps {
  board: {
    id: string;
    name: string;
    visibility: "private" | "public";
    owner_id: string;
  };
  onClose: () => void;
}

export default function EditBoardModal({
  board,
  onClose,
}: EditBoardModalProps) {
  const router = useRouter();
  const [name, setName] = useState(board.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateBoard(board.id, name);

      if (result.error) {
        setError(result.error);
      } else {
        setLoading(false);
        setTimeout(() => {
          router.refresh();
          onClose();
        }, 100);
      }
    } catch (err) {
      setError("Error inesperado");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Editar Board</h2>
          <button onClick={onClose} className="hover:bg-slate-600 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded font-medium"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
