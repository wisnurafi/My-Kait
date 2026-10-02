"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { HookLogo } from "@/components/hook-logo";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeLanguageSwitcher } from "@/components/app/theme-language-switcher";
import { LogOut, Home, Pencil, Link2, FileText, History, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, key: "dashboard" },
  { href: "/editor", icon: Pencil, key: "editor" },
  { href: "/webhooks", icon: Link2, key: "webhooks" },
  { href: "/templates", icon: FileText, key: "templates" },
  { href: "/logs", icon: History, key: "logs" },
  { href: "/settings", icon: Settings, key: "settings" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar — glass panel */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 hidden md:flex flex-col backdrop-blur-xl bg-surface/70 border-r border-border-ink">
        <div className="p-6 border-b border-border-ink">
          <Link href="/" className="flex items-center gap-2 no-underline group">
            <span className="transition-transform duration-300 group-hover:rotate-[-8deg]">
              <HookLogo size={36} />
            </span>
            <span className="font-display text-xl gradient-text">MY KAIT</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.05em] no-underline rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-accent to-accent-2 text-white shadow-[0_0_18px_rgba(88,101,242,0.5)]"
                    : "text-fg-secondary hover:text-fg hover:bg-white/[0.05] hover:translate-x-1",
                )}
              >
                <item.icon size={18} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border-ink space-y-3">
          <ThemeLanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3"
            onClick={() => signOut({ redirectTo: "/" })}
          >
            <LogOut size={18} />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile bottom nav — glass bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-stretch justify-around px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl bg-surface/80 border-t border-border-ink">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.05em] no-underline transition-colors duration-200",
                isActive ? "text-accent-2" : "text-fg-secondary",
              )}
            >
              <span
                className={cn(
                  "rounded-full p-1.5 transition-all duration-200",
                  isActive &&
                    "bg-gradient-to-r from-accent to-accent-2 text-white shadow-[0_0_14px_rgba(88,101,242,0.55)]",
                )}
              >
                <item.icon size={18} />
              </span>
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
