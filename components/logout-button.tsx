"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <DropdownMenuItem onClick={logout} variant="destructive">
      Log out
    </DropdownMenuItem>
  );
}
