"use client";

import { useState } from "react";
import { createCard } from "@/lib/actions/cards";
import { Plus } from "lucide-react";

interface CreateCardButtonProps {
  listId: string;
  onCardCreated: () => void;
}

export default function CreateCardButton({
  listId,
  onCardCreated,
}: CreateCardButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardTitle.trim()) {
      setError("El nombre de la tarjeta es requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createCard(listId, cardTitle);

      if (result.error) {
        setError(result.error);
      } else {
        setCardTitle("");
        setShowForm(false);
        onCardCreated();
      }
    } catch (err) {
      setError("Error al crear la tarjeta");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <form onSubmit={handleSubmit} className="mt-2">
        <input
          type="text"
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          placeholder="Enter card title"
          className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-500 text-sm"
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm py-1 rounded font-medium"
          >
            {loading ? "Adding..." : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setError(null);
            }}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm py-1 rounded"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full mt-2 flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:bg-slate-700 py-2 rounded transition text-sm"
    >
      <Plus size={16} />
      Add a card
    </button>
  );
}
