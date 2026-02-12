"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkEditPermission } from "./invitations";

export async function createList(boardId: string, title: string) {
  try {
    // Verificar permisos
    const { hasPermission, error: permissionError } =
      await checkEditPermission(boardId);
    if (!hasPermission) {
      return {
        error: permissionError || "No tienes permiso para crear listas",
      };
    }

    const supabase = await createClient();

    // Obtener la posición máxima actual
    const { data: lastList } = await supabase
      .from("lists")
      .select("position")
      .eq("board_id", boardId)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (lastList?.position || -1) + 1;

    // Insertar la nueva lista
    const { data, error } = await supabase
      .from("lists")
      .insert({
        board_id: boardId,
        title,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting list:", error);
      return { error: error.message };
    }

    revalidatePath(`/board/${boardId}`);
    return { success: true, list: data };
  } catch (error) {
    console.error("Error creating list:", error);
    return { error: "Error al crear la lista" };
  }
}

export async function updateList(
  listId: string,
  title: string,
  boardId: string,
) {
  try {
    // Verificar permisos
    const { hasPermission, error: permissionError } =
      await checkEditPermission(boardId);
    if (!hasPermission) {
      return {
        error: permissionError || "No tienes permiso para editar listas",
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lists")
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listId)
      .select()
      .single();

    if (error) {
      console.error("Error updating list:", error);
      return { error: error.message };
    }

    revalidatePath(`/board/${boardId}`);
    return { success: true, list: data };
  } catch (error) {
    console.error("Error updating list:", error);
    return { error: "Error al actualizar la lista" };
  }
}

export async function deleteList(listId: string, boardId: string) {
  try {
    // Verificar permisos
    const { hasPermission, error: permissionError } =
      await checkEditPermission(boardId);
    if (!hasPermission) {
      return {
        error: permissionError || "No tienes permiso para eliminar listas",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("lists").delete().eq("id", listId);

    if (error) {
      console.error("Error deleting list:", error);
      return { error: error.message };
    }

    revalidatePath(`/board/${boardId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting list:", error);
    return { error: "Error al eliminar la lista" };
  }
}
