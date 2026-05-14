"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Building2,
  FolderOpen,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "마감재 DB",
    href: "/materials",
    icon: Layers,
    description: "자재 DB 관리",
  },
  {
    label: "업체 DB",
    href: "/vendors",
    icon: Building2,
    description: "업체 & 담당자",
  },
  {
    label: "스펙북 작성",
    href: "/specbook",
    icon: BookOpen,
    description: "스펙북 작성",
  },
  {
    label: "프로젝트 스펙 정보",
    href: "/projects",
    icon: FolderOpen,
    description: "스펙북 관리",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 z-40 h-[calc(100vh-56px)] w-72 border-r bg-card flex flex-col">
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 font-medium whitespace-nowrap">{item.label}</span>
              {item.description && !isActive && (
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-6 py-4">
        <p className="text-[11px] text-muted-foreground">
          PRD v1.3 · Dummy Data Mode
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[11px] text-muted-foreground">Supabase 연동 전</span>
        </div>
      </div>
    </aside>
  );
}
