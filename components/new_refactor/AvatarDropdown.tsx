"use client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound } from "lucide-react";
import { LogoutButton } from "../logout-button";

export function AvatarDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="scale-125" asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <UserRound className="w-6 h-6 text-black dark:text-white" />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuGroup>
          <DropdownMenuItem>Workspaces</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <LogoutButton />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
