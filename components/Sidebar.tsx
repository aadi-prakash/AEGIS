"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  NotebookPen,
  CalendarDays,
  Dumbbell,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { name, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-surface-border bg-white/[0.02] backdrop-blur-glass">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-muted text-accent">
          <Shield size={20} />
        </span>
        <div>
          <p className="text-base font-bold leading-none tracking-tight text-white">
            AEGIS
          </p>
          <p className="mt-1 text-[11px] text-white/40">command center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-accent-muted text-white"
                  : "text-white/55 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "transition-colors",
                  active ? "text-accent" : "text-white/45 group-hover:text-white"
                )}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-[10px] px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan text-xs font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="text-[11px] text-white/40">signed in</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
