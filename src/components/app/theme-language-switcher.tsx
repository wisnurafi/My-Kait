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
  const [theme, setTheme] = useState<Theme>("system");
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.05em] border-2 border-border-ink hover:bg-sunken transition-colors duration-100 cursor-pointer"
      >
        <Globe size={14} />
        {locale.toUpperCase()}
      </button>

      {/* Theme switcher */}
      <div className="flex items-center gap-0 p-0.5 border-2 border-border-ink">
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
        "p-1.5 transition-colors duration-100 cursor-pointer",
        active ? "bg-fg text-bg" : "hover:bg-sunken text-fg-secondary",
      )}
    >
      <Icon size={14} />
    </button>
  );
}
