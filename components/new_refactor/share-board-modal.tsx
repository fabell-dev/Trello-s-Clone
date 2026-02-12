"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Copy, Trash2, X } from "lucide-react";
import {
  createBoardInvitation,
  getBoardInvitations,
  revokeBoardInvitation,
} from "@/lib/actions/invitations";

type Invitation = {
  id: string;
  code: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  uses_count: number;
  role: "viewer" | "editor" | "owner";
};

export function ShareBoardModal({
  boardId,
  onClose,
}: {
  boardId: string;
  onClose: () => void;
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<
    "viewer" | "editor" | "owner"
  >("editor");

  useEffect(() => {
    loadInvitations();
  }, [boardId]);

  async function loadInvitations() {
    const result = await getBoardInvitations(boardId);
    if (result.success && result.invitations) {
      setInvitations(result.invitations);
    } else if (result.error) {
      setError(result.error);
    }
  }

  async function handleCreateInvitation() {
    setLoading(true);
    setError(null);
    const result = await createBoardInvitation(boardId, selectedRole, 24); // 24 horas
    if (result.success && result.invitation) {
      setInvitations([result.invitation, ...invitations]);
    } else if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  async function handleCopyCode(code: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite/${code}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleRevokeInvitation(invitationId: string) {
    if (!confirm("¿Realmente deseas revocar esta invitación?")) return;

    const result = await revokeBoardInvitation(invitationId);
    if (result.success) {
      loadInvitations();
    } else if (result.error) {
      setError(result.error);
    }
  }

  const activeInvitations = invitations.filter((inv) => inv.is_active);
  const revokedInvitations = invitations.filter((inv) => !inv.is_active);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Compartir Board</h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permiso para el invitado
          </label>
          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as "viewer" | "editor" | "owner")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="viewer">👁️ Solo ver (Viewer)</option>
            <option value="editor">✏️ Editar (Editor)</option>
            <option value="owner">👑 Propietario (Owner)</option>
          </select>
        </div>

        <Button
          onClick={handleCreateInvitation}
          disabled={loading}
          className="w-full mb-6"
        >
          {loading ? "Creando..." : "Generar Link de Invitación"}
        </Button>

        {activeInvitations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Invitaciones Activas
            </h3>
            <div className="space-y-3">
              {activeInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-2 p-3 bg-gray-50 rounded border"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded">
                      {invitation.role === "viewer" && "👁️ Viewer"}
                      {invitation.role === "editor" && "✏️ Editor"}
                      {invitation.role === "owner" && "👑 Owner"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${invitation.code}`}
                      className="text-sm text-gray-900 bg-white"
                    />
                    <button
                      onClick={() => handleCopyCode(invitation.code)}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copied === invitation.code ? (
                        <span className="text-green-600 text-xs">
                          ¡Copiado!
                        </span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleRevokeInvitation(invitation.id)}
                      className="p-2 hover:bg-red-100 rounded transition text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {revokedInvitations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Invitaciones Revocadas ({revokedInvitations.length})
            </h3>
            <p className="text-xs text-gray-400">
              Genera nuevas invitaciones si necesitas compartir este board
            </p>
          </div>
        )}

        {activeInvitations.length === 0 && revokedInvitations.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">
            No tienes invitaciones creadas. ¡Crea una para invitar personas!
          </p>
        )}
      </Card>
    </div>
  );
}
