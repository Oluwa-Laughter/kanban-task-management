"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Icon } from "./icons";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // next-themes' documented hydration workaround — we render only after mount so
  // the SSR HTML matches the client.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <div className="flex items-center justify-center gap-6 rounded-md bg-light-grey px-6 py-3.5 dark:bg-very-dark-grey">
      <Icon name="icon-light-theme" alt="" />
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative h-5 w-10 rounded-full bg-purple transition-colors hover:bg-purple-hover"
      >
        <span
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-all ${isDark ? "left-[22px]" : "left-1"}`}
        />
      </button>
      <Icon name="icon-dark-theme" alt="" />
    </div>
  );
}
