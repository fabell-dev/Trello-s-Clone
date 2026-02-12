"use client";

import { useState, useEffect } from "react";
import { Users, X } from "lucide-react";
import { getBoardMembers, removeBoardMember } from "@/lib/actions/invitations";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  user_id: string;
  board_id: string;
  role: string;
  email?: string;
}

export default function BoardMembers({
  boardId,
  isOwner,
}: {
  boardId: string;
  isOwner: boolean;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (showMembers) {
      loadMembers();
    }
  }, [showMembers, boardId]);

  async function loadMembers() {
    setLoading(true);
    const result = await getBoardMembers(boardId);
    if (result.success && result.members) {
      setMembers(result.members);
    }
    setLoading(false);
  }

  async function handleRemoveMember(userId: string, email: string) {
    if (!confirm(`¿Deseas eliminar a ${email} del board?`)) return;

    const result = await removeBoardMember(boardId, userId);
    if (result.success) {
      // Eliminar del estado local inmediatamente
      setMembers(members.filter((m) => m.user_id !== userId));
      alert("Miembro eliminado correctamente");
    } else if (result.error) {
      alert("Error: " + result.error);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMembers(!showMembers)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm transition"
      >
        <Users size={16} />
        {members.length > 0 && <span className="ml-1">{members.length}</span>}
      </button>

      {showMembers && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-700 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Miembros</h3>
            <button
              onClick={() => setShowMembers(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Cargando...</p>
          ) : members.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay miembros</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 bg-slate-600 rounded hover:bg-slate-500 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white break-words font-medium">
                      {member.email || member.user_id}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="inline-block px-2 py-1 text-xs font-medium text-white rounded bg-opacity-60"
                        style={{
                          backgroundColor:
                            member.role === "viewer"
                              ? "rgba(59, 130, 246, 0.6)"
                              : member.role === "editor"
                                ? "rgba(34, 197, 94, 0.6)"
                                : "rgba(168, 85, 247, 0.6)",
                        }}
                      >
                        {member.role === "viewer" && "👁️ Ver"}
                        {member.role === "editor" && "✏️ Editar"}
                        {member.role === "owner" && "👑 Owner"}
                      </span>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() =>
                        handleRemoveMember(
                          member.user_id,
                          member.email || member.user_id,
                        )
                      }
                      className="ml-2 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-40 rounded transition flex-shrink-0"
                      title="Eliminar miembro"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
