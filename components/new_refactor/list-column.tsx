"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import CardItem from "./card-item";
import CreateCardButton from "./create-card-button";
import { MoreVertical } from "lucide-react";
import ListOptionsMenu from "./list-options-menu";

interface ListColumnProps {
  list: {
    id: string;
    board_id: string;
    title: string;
    position: number;
  };
  boardId: string;
}

interface Card {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
}

export default function ListColumn({ list, boardId }: ListColumnProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [list.id]);

  const fetchCards = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("cards")
      .select("*")
      .eq("list_id", list.id)
      .order("position", { ascending: true });

    setCards(data || []);
    setLoading(false);
  };

  const handleCardCreated = () => {
    fetchCards();
  };

  const handleCardDeleted = () => {
    fetchCards();
  };

  const handleCardUpdated = (updatedCard: any) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === updatedCard.id
          ? { ...card, title: updatedCard.title }
          : card,
      ),
    );
  };

  return (
    <div className="bg-slate-600 rounded-lg p-4 w-80 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">{list.title}</h2>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="hover:bg-slate-500 p-1 rounded"
          >
            <MoreVertical size={16} />
          </button>
          {showOptions && (
            <ListOptionsMenu
              list={list}
              onClose={() => setShowOptions(false)}
            />
          )}
        </div>
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="text-gray-400 text-sm">Cargando...</div>
        ) : cards.length === 0 ? (
          <div className="text-gray-400 text-sm">Sin tarjetas</div>
        ) : (
          cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              listId={list.id}
              boardId={boardId}
              onCardDeleted={handleCardDeleted}
              onCardUpdated={handleCardUpdated}
            />
          ))
        )}
      </div>
      <CreateCardButton listId={list.id} onCardCreated={handleCardCreated} />
    </div>
  );
}
