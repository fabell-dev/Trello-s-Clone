"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { AvatarDropdown } from "./new_refactor/AvatarDropdown";
import { useAuth } from "@/lib/auth-context";
import { motion } from "motion/react";

type Props = {
  Type: string;
};

export function AuthButton({ Type }: Props) {
  const { user } = useAuth();

  return user ? (
    <div className="flex items-center gap-4">
      {Type === "Hero" ? <></> : <AvatarDropdown />}
    </div>
  ) : (
    <>
      {Type === "Navbar" ? (
        <></>
      ) : (
        <div className="flex gap-2">
          <Button asChild size="lg" variant={"outline"}>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant={"default"}>
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      )}
    </>
  );
}
