"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updateCard } from "@/lib/actions/cards";
import { useRouter } from "next/navigation";

interface EditCardModalProps {
  card: {
    id: string;
    list_id: string;
    title: string;
    description?: string;
    position: number;
  };
  listId: string;
  onClose: () => void;
  onCardUpdated?: (updatedCard: any) => void;
}

export default function EditCardModal({
  card,
  listId,
  onClose,
  onCardUpdated,
}: EditCardModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(card.title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateCard(card.id, listId, title);

      if (result.error) {
        setError(result.error);
      } else {
        onCardUpdated?.(result.card);
        router.refresh();
        onClose();
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
          <h2 className="text-xl font-bold text-white">Editar Tarjeta</h2>
          <button onClick={onClose} className="hover:bg-slate-600 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
