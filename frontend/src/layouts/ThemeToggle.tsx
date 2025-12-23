import { useRef } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Theme } from "@/providers/contexts/ThemeContext";

const themes = [
  { label: "System", value: "system" as const, icon: Monitor },
  { label: "Light", value: "light" as const, icon: Sun },
  { label: "Dark", value: "dark" as const, icon: Moon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const supportsViewTransitions = () =>
    typeof document !== "undefined" && "startViewTransition" in document;

  function applyThemeWithAnimation(newTheme: Theme) {
    if (!supportsViewTransitions() || !buttonRef.current) {
      setTheme(newTheme);
      return;
    }

    try {
      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;

      document.documentElement.style.setProperty("--x", `${x}px`);
      document.documentElement.style.setProperty("--y", `${y}px`);

      const transition = (document as any).startViewTransition(() => {
        setTheme(newTheme);
      });

      transition.ready.catch(() => {
        setTheme(newTheme);
      });
    } catch {
      setTheme(newTheme);
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={buttonRef}
          variant='ghost'
          size='icon'
          className={cn(
            "size-9 rounded-full text-muted-foreground hover:text-foreground cursor-pointer",
            className
          )}
        >
          <Sun className='size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='min-w-[150px] bg-popover border-border backdrop-blur-xl text-popover-foreground'
      >
        {themes.map(({ label, value, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => applyThemeWithAnimation(value)}
            className={cn(
              "flex cursor-pointer items-center gap-2 focus:bg-accent focus:text-accent-foreground",
              theme === value && "text-primary font-medium"
            )}
          >
            <Icon className='size-4' />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
