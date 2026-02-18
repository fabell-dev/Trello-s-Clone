import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { AvatarDropdown } from "./new_refactor/AvatarDropdown";

type Props = {
  Type: string;
};
export async function AuthButton({ Type }: Props) {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      {Type === "hero" ? (
        <div>
          <Button asChild size="lg" variant={"default"}>
            <Link href="/dashboard" className="text-xl">
              Dashboard
            </Link>
          </Button>
        </div>
      ) : (
        <AvatarDropdown />
      )}
    </div>
  ) : (
    <>
      {Type === "Navbar" ? (
        <></>
      ) : (
        <div className="flex gap-2">
          <Button asChild size="sm" variant={"outline"}>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant={"default"}>
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      )}
    </>
  );
}
