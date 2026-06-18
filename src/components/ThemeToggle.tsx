import { useRef, useCallback } from 'react';
import { SunIcon, Moon02Icon } from '@/components/icons';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = useCallback(
    () => {
      const btn = btnRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      // View Transitions API — Chrome 111+, Edge 111+
      if (!('startViewTransition' in document)) {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        return;
      }

      const next = theme === 'dark' ? 'light' : 'dark';

      const transition = document.startViewTransition(() => {
        setTheme(next);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0 at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    },
    [theme, setTheme],
  );

  const isDark = theme === 'dark';

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center size-10 rounded-full border border-border bg-background text-foreground shadow-lg hover:bg-muted transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <SunIcon className="size-4" />
      ) : (
        <Moon02Icon className="size-4" />
      )}
    </button>
  );
}
