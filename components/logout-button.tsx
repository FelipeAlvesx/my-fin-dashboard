"use client";

import { logout } from "@/app/actions/auth";
import { useTransition } from "react";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-black/20 px-3.5 py-2 text-xs font-medium text-[#cefae2]/80 backdrop-blur transition duration-200 hover:border-red-500/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Saindo…" : "Sair"}
    </button>
  );
}
