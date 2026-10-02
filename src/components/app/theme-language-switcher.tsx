"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor, Globe } from "lucide-react";

type Theme = "system" | "light" | "dark";

export function ThemeLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("mykait-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("mykait-theme", theme);
  }, [theme, mounted]);

  function switchLanguage() {
    const newLocale = locale === "id" ? "en" : "id";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }

  if (!mounted) {
    return <div className="h-9 w-20" />;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Language switcher */}
      <button
        onClick={switchLanguage}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.05em] rounded-full border border-border-ink bg-white/[0.03] backdrop-blur hover:border-border-strong hover:bg-white/[0.07] transition-all duration-200 cursor-pointer"
      >
        <Globe size={14} />
        {locale.toUpperCase()}
      </button>

      {/* Theme switcher */}
      <div className="flex items-center p-1 rounded-full border border-border-ink bg-white/[0.03] backdrop-blur">
        <ThemeButton icon={Monitor} active={theme === "system"} onClick={() => setTheme("system")} />
        <ThemeButton icon={Sun} active={theme === "light"} onClick={() => setTheme("light")} />
        <ThemeButton icon={Moon} active={theme === "dark"} onClick={() => setTheme("dark")} />
      </div>
    </div>
  );
}

function ThemeButton({
  icon: Icon,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-full transition-all duration-200 cursor-pointer",
        active
          ? "bg-gradient-to-r from-accent to-accent-2 text-white shadow-[0_0_10px_rgba(122,158,126,0.45)]"
          : "text-fg-secondary hover:text-fg hover:bg-white/[0.06]",
      )}
    >
      <Icon size={14} />
    </button>
  );
}
