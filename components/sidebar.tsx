"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Ícones SVG inline ──────────────────────────────────────────────────────

function IconHome({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ─── Nav items ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: IconHome },
  { href: "/conta", label: "Conta", Icon: IconUser },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={[
        "relative flex h-screen flex-col border-r border-white/10 bg-[#070d0b] transition-all duration-300 ease-in-out",
        expanded ? "w-52" : "w-[60px]",
      ].join(" ")}
    >
      {/* Gradiente decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(76,245,143,0.08),transparent_60%)]" />

      {/* Logo / branding */}
      <div
        className={[
          "relative flex h-[60px] shrink-0 items-center border-b border-white/10",
          expanded ? "justify-between px-4" : "justify-center",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0d2b1c] text-[#58ec9d]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          {expanded && (
            <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9ef6c8]">
              Finanças
            </span>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="relative flex flex-1 flex-col gap-1 px-2 py-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <div key={href} className="group relative">
              <Link
                href={href}
                className={[
                  "flex h-10 items-center rounded-xl px-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#0d2b1c] text-[#7cffb2]"
                    : "text-[#8ec9aa] hover:bg-white/5 hover:text-[#cefae2]",
                  expanded ? "gap-3" : "justify-center",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {expanded && <span className="truncate">{label}</span>}
              </Link>

              {/* Tooltip no modo collapsed */}
              {!expanded && (
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0b1f16] px-2.5 py-1.5 text-xs text-[#cefae2] opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                  {label}
                  <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-white/10 bg-[#0b1f16]" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="relative border-t border-white/10 px-2 py-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? "Recolher menu" : "Expandir menu"}
          className={[
            "flex h-10 w-full items-center rounded-xl px-3 text-[#8ec9aa] transition-all duration-200 hover:bg-white/5 hover:text-[#cefae2]",
            expanded ? "gap-3" : "justify-center",
          ].join(" ")}
        >
          <IconChevronLeft
            className={[
              "h-4 w-4 shrink-0 transition-transform duration-300",
              expanded ? "" : "rotate-180",
            ].join(" ")}
          />
          {expanded && (
            <span className="truncate text-sm font-medium">Recolher</span>
          )}
        </button>
      </div>
    </aside>
  );
}
