"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkEditPermission } from "./invitations";

export async function createCard(listId: string, title: string) {
  try {
    const supabase = await createClient();

    // Obtener el list para saber el board_id
    const { data: list } = await supabase
      .from("lists")
      .select("board_id")
      .eq("id", listId)
      .single();

    if (!list) {
      return { error: "Lista no encontrada" };
    }

    // Verificar permisos
    const { hasPermission, error: permissionError } = await checkEditPermission(
      list.board_id,
    );
    if (!hasPermission) {
      return {
        error: permissionError || "No tienes permiso para crear tarjetas",
      };
    }

    // Obtener la posición máxima actual
    const { data: lastCard } = await supabase
      .from("cards")
      .select("position")
      .eq("list_id", listId)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (lastCard?.position || -1) + 1;

    // Insertar la nueva tarjeta
    const { data, error } = await supabase
      .from("cards")
      .insert({
        list_id: listId,
        title,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting card:", error);
      return { error: error.message };
    }

    revalidatePath(`/board/${list.board_id}`);
    return { success: true, card: data };
  } catch (error) {
    console.error("Error creating card:", error);
    return { error: "Error al crear la tarjeta" };
  }
}

export async function updateCard(
  cardId: string,
  listId: string,
  title: string,
  description?: string,
) {
  try {
    const supabase = await createClient();

    // Obtener el list para saber el board_id
    const { data: list } = await supabase
      .from("lists")
      .select("board_id")
      .eq("id", listId)
      .single();

    if (!list) {
      return { error: "Lista no encontrada" };
    }

    // Verificar permisos
    const { hasPermission, error: permissionError } = await checkEditPermission(
      list.board_id,
    );
    if (!hasPermission) {
      return {
        error: permissionError || "No tienes permiso para editar tarjetas",
      };
    }

    const { data, error } = await supabase
      .from("cards")
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .select()
      .single();

    if (error) {
      console.error("Error updating card:", error);
      return { error: error.message };
    }

    revalidatePath(`/board/${list.board_id}`);
    return { success: true, card: data };
  } catch (error) {
    console.error("Error updating card:", error);
    return { error: "Error al actualizar la tarjeta" };
  }
}

export async function deleteCard(cardId: string, listId: string) {
  try {
    const supabase = await createClient();

    // Obtener el list para saber el board_id
    const { data: list } = await supabase
      .from("lists")
      .select("board_id")
      .eq("id", listId)
      .single();
    if (!list) {
      return { error: "Lista no encontrada" };
    }

    // Verificar permisos
    const { hasPermission, error: permissionError } = await checkEditPermission(
      list.board_id,
    );
    if (!hasPermission) {
      return {
        error: permissionError || "No tienes permiso para eliminar tarjetas",
      };
    }
    const { error } = await supabase.from("cards").delete().eq("id", cardId);

    if (error) {
      console.error("Error deleting card:", error);
      return { error: error.message };
    }

    if (list) {
      revalidatePath(`/board/${list.board_id}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { error: "Error al eliminar la tarjeta" };
  }
}
