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
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r-[3px] border-border-ink bg-surface z-40 hidden md:flex flex-col">
        <div className="p-6 border-b-[3px] border-border-ink">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <HookLogo size={36} />
            <span className="font-display text-xl text-fg">MY KAIT</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-0">
          {navItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-[0.05em] transition-colors duration-100 no-underline",
                  isActive
                    ? "bg-fg text-bg border-l-[5px] border-fg"
                    : "text-fg-secondary border-l-[5px] border-transparent hover:text-fg hover:bg-surface-hover",
                )}
              >
                <item.icon size={18} />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t-[3px] border-border-ink space-y-3">
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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t-[3px] border-border-ink bg-surface z-40 md:hidden flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.05em] no-underline",
                isActive ? "text-fg" : "text-fg-secondary",
              )}
            >
              <item.icon size={20} />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
