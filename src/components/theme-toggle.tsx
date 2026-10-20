"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Icon } from "./icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // next-themes' documented hydration workaround — we render only after mount so
  // the SSR HTML matches the client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-center gap-4 rounded-md bg-light-grey px-6 py-3 dark:bg-very-dark-grey">
      <Icon name="icon-light-theme" alt="" />
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark mode"
        disabled={!mounted}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative h-8 w-14 rounded-full bg-purple transition-colors hover:bg-purple-hover disabled:opacity-50"
      >
        <span
          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white transition-all ${isDark ? "left-[30px]" : "left-[6px]"}`}
        />
      </button>
      <Icon name="icon-dark-theme" alt="" />
    </div>
  );
}
