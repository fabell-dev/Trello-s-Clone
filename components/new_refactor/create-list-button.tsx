"use client";

import { useState } from "react";
import { createList } from "@/lib/actions/lists";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateListButtonProps {
  boardId: string;
}

export default function CreateListButton({ boardId }: CreateListButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listTitle.trim()) {
      setError("El nombre de la lista es requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createList(boardId, listTitle);

      if (result.error) {
        setError(result.error);
      } else {
        setListTitle("");
        setShowForm(false);
        router.refresh();
      }
    } catch (err) {
      setError("Error al crear la lista");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="bg-slate-600 rounded-lg p-4 w-80 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            placeholder="Enter list title"
            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-500 text-sm"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm py-2 rounded font-medium"
            >
              {loading ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 rounded"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-80 flex-shrink-0 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white py-4 rounded-lg transition font-medium"
    >
      <Plus size={20} />
      Add a list
    </button>
  );
}
