"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DiscordLoginButton({
  callbackUrl,
  children,
}: {
  callbackUrl: string;
  children: React.ReactNode;
}) {
  return (
    <Button className="gap-2" onClick={() => signIn("discord", { callbackUrl })}>
      {children}
    </Button>
  );
}
