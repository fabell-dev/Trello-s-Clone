import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { AuthButton } from "../auth-button";
import { Suspense } from "react";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link className="text-xl" href={"/"}>
            Trello's Clone
          </Link>
          <ThemeSwitcher />
        </div>
        <Suspense fallback="Cargando">
          <AuthButton Type="Navbar" />
        </Suspense>
      </div>
    </nav>
  );
}
