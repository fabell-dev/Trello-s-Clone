"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";

// Generar código de invitación único
function generateInvitationCode() {
  return nanoid(8);
}

// Verificar si el usuario tiene permiso para editar en un board
export async function checkEditPermission(boardId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { hasPermission: false, error: "No autenticado" };
  }

  // Verificar si es propietario del board
  const { data: boardOwner } = await supabase
    .from("boards")
    .select("id")
    .eq("id", boardId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (boardOwner) {
    return { hasPermission: true };
  }

  // Verificar si es miembro con rol editor u owner
  const { data: members } = await supabase
    .from("board_members")
    .select("role")
    .eq("board_id", boardId)
    .eq("user_id", user.id);

  if (members && members.length > 0) {
    const member = members[0];
    if (member.role === "editor" || member.role === "owner") {
      return { hasPermission: true };
    }
  }

  return {
    hasPermission: false,
    error: "No tienes permiso para editar este board (eres viewer)",
  };
}

// Verificar si el usuario es propietario del board (solo para delete y administración)
export async function checkOwnerPermission(boardId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { hasPermission: false, error: "No autenticado" };
  }

  // Verificar si es propietario del board
  const { data: boardOwner } = await supabase
    .from("boards")
    .select("id")
    .eq("id", boardId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (boardOwner) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    error: "Solo el propietario puede eliminar este board",
  };
}

export async function createBoardInvitation(
  boardId: string,
  role: "viewer" | "editor" | "owner" = "editor",
  expiresIn?: number, // horas
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "No autenticado" };
    }

    // Verificar que el usuario es dueño del board
    const { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("id", boardId)
      .eq("owner_id", user.id)
      .single();

    if (!board) {
      return { error: "No tienes permiso para compartir este board" };
    }

    const code = generateInvitationCode();
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from("board_invitations")
      .insert({
        board_id: boardId,
        code,
        created_by: user.id,
        expires_at: expiresAt,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invitation:", error);
      return { error: error.message };
    }

    return { success: true, invitation: data, code };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return { error: "Error al crear invitación" };
  }
}

export async function acceptBoardInvitation(invitationCode: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "No autenticado" };
    }

    // Obtener la invitación
    const { data: invitation, error: invError } = await supabase
      .from("board_invitations")
      .select("id, board_id, expires_at, is_active, uses_count, role")
      .eq("code", invitationCode)
      .single();

    if (invError || !invitation) {
      return { error: "Invitación no válida" };
    }

    // Verificar que la invitación está activa
    if (!invitation.is_active) {
      return { error: "Esta invitación ha sido revocada" };
    }

    // Verificar que no ha expirado
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { error: "Esta invitación ha expirado" };
    }

    // Agregar usuario a board_members con su email y role de la invitación
    const { data: member, error: memberError } = await supabase
      .from("board_members")
      .upsert(
        {
          board_id: invitation.board_id,
          user_id: user.id,
          email: user.email,
          role: invitation.role,
        },
        { onConflict: "board_id,user_id" },
      )
      .select()
      .single();

    if (memberError) {
      console.error("Error adding member:", memberError);
      return { error: memberError.message };
    }

    // Actualizar contador de usos
    await supabase
      .from("board_invitations")
      .update({
        uses_count: invitation.uses_count + 1,
      })
      .eq("id", invitation.id);

    revalidatePath("/dashboard");

    return {
      success: true,
      boardId: invitation.board_id,
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { error: "Error al aceptar invitación" };
  }
}

export async function revokeBoardInvitation(invitationId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "No autenticado" };
    }

    // Verificar que el usuario es dueño del board
    const { data: invitation } = await supabase
      .from("board_invitations")
      .select("board_id")
      .eq("id", invitationId)
      .single();

    if (!invitation) {
      return { error: "Invitación no encontrada" };
    }

    const { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("id", invitation.board_id)
      .eq("owner_id", user.id)
      .single();

    if (!board) {
      return { error: "No tienes permiso para revocar esta invitación" };
    }

    const { error } = await supabase
      .from("board_invitations")
      .update({ is_active: false })
      .eq("id", invitationId);

    if (error) {
      console.error("Error revoking invitation:", error);
      return { error: error.message };
    }

    revalidatePath(`/board/${invitation.board_id}`);

    return { success: true };
  } catch (error) {
    console.error("Error revoking invitation:", error);
    return { error: "Error al revocar invitación" };
  }
}

export async function getBoardInvitations(boardId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "No autenticado" };
    }

    // Verificar que el usuario es dueño del board
    const { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("id", boardId)
      .eq("owner_id", user.id)
      .single();

    if (!board) {
      return { error: "No tienes permiso para ver invitaciones" };
    }

    const { data, error } = await supabase
      .from("board_invitations")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invitations:", error);
      return { error: error.message };
    }

    return { success: true, invitations: data };
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return { error: "Error al obtener invitaciones" };
  }
}

export async function getBoardMembers(boardId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "No autenticado" };
    }

    // Verificar que el usuario tiene acceso al board
    const { data: hasAccess } = await supabase
      .from("boards")
      .select("id")
      .eq("id", boardId)
      .eq("owner_id", user.id)
      .single();

    if (!hasAccess) {
      const { data: isMember } = await supabase
        .from("board_members")
        .select("id")
        .eq("board_id", boardId)
        .eq("user_id", user.id)
        .single();

      if (!isMember) {
        return { error: "No tienes permiso para ver miembros" };
      }
    }

    // Obtener miembros simplemente
    const { data: members, error } = await supabase
      .from("board_members")
      .select("*")
      .eq("board_id", boardId);

    if (error) {
      console.error("Error fetching members:", error);
      return { error: error.message };
    }

    return { success: true, members };
  } catch (error) {
    console.error("Error fetching members:", error);
    return { error: "Error al obtener miembros" };
  }
}

export async function removeBoardMember(boardId: string, userId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "No autenticado" };
    }

    // Verificar que el usuario es dueño del board
    const { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("id", boardId)
      .eq("owner_id", user.id)
      .single();

    if (!board) {
      return { error: "No tienes permiso para eliminar miembros" };
    }

    const { error } = await supabase
      .from("board_members")
      .delete()
      .eq("board_id", boardId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing member:", error);
      return { error: error.message };
    }

    revalidatePath(`/board/${boardId}`);

    return { success: true };
  } catch (error) {
    console.error("Error removing member:", error);
    return { error: "Error al eliminar miembro" };
  }
}
