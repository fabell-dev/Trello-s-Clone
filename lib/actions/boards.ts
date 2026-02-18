"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkEditPermission, checkOwnerPermission } from "./invitations";

export async function createBoard(
  name: string,
  visibility: "private" | "public",
) {
  try {
    const supabase = await createClient();

    // Obtener el usuario actual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "No autenticado" };
    }

    // Insertar el board
    const { data, error } = await supabase
      .from("boards")
      .insert({
        name,
        visibility,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting board:", error);
      return { error: error.message };
    }

    // Revalidar el dashboard
    revalidatePath("/dashboard");

    return { success: true, board: data };
  } catch (error) {
    console.error("Error creating board:", error);
    return { error: "Error al crear el board" };
  }
}

export async function updateBoard(boardId: string, name: string) {
  try {
    // Verificar permisos de edición
    const permissionCheck = await checkEditPermission(boardId);
    if (!permissionCheck.hasPermission) {
      return {
        error: permissionCheck.error || "No tienes permiso para editar",
      };
    }

    const supabase = await createClient();

    // Hacer el update
    const { data: updateData, error: updateError } = await supabase
      .from("boards")
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", boardId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error updating board:", updateError);
      return { error: updateError.message };
    }

    if (!updateData) {
      return { error: "No se pudo actualizar el board" };
    }

    revalidatePath(`/board/${boardId}`);
    revalidatePath("/dashboard");

    return { success: true, board: updateData };
  } catch (error) {
    console.error("Error updating board:", error);
    return { error: "Error al actualizar el board" };
  }
}

export async function deleteBoard(boardId: string) {
  try {
    // Solo el owner puede eliminar
    const permissionCheck = await checkOwnerPermission(boardId);
    if (!permissionCheck.hasPermission) {
      return {
        error: permissionCheck.error || "No tienes permiso para eliminar",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("boards").delete().eq("id", boardId);

    if (error) {
      console.error("Error deleting board:", error);
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting board:", error);
    return { error: "Error al eliminar el board" };
  }
}

export async function updateBoardVisibility(
  boardId: string,
  visibility: "private" | "public",
) {
  try {
    // Solo el owner puede cambiar visibilidad
    const permissionCheck = await checkOwnerPermission(boardId);
    if (!permissionCheck.hasPermission) {
      return {
        error:
          permissionCheck.error || "No tienes permiso para cambiar visibilidad",
      };
    }

    const supabase = await createClient();

    // Primero hacer el update
    const { error: updateError } = await supabase
      .from("boards")
      .update({
        visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("id", boardId);

    if (updateError) {
      console.error("Error updating board visibility:", updateError);
      return { error: updateError.message };
    }

    // Luego traer el board actualizado
    const { data, error: selectError } = await supabase
      .from("boards")
      .select()
      .eq("id", boardId)
      .maybeSingle();

    if (selectError) {
      console.error("Error fetching updated board:", selectError);
      return { error: selectError.message };
    }

    revalidatePath(`/board/${boardId}`);
    revalidatePath("/dashboard");

    return { success: true, board: data };
  } catch (error) {
    console.error("Error updating board visibility:", error);
    return { error: "Error al cambiar visibilidad" };
  }
}
