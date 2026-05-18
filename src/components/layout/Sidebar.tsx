"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Building2,
  FolderOpen,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Tag,
  Package,
  Truck,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

function CollapsibleMenu({
  icon: Icon,
  label,
  isActive,
  isOpen,
  onToggle,
  subItems,
  pathname,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  subItems: { label: string; href: string; icon: React.ElementType; exact?: boolean }[];
  pathname: string;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 font-medium whitespace-nowrap text-left">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-1 ml-4 pl-3 border-l border-border space-y-0.5">
          {subItems.map((item) => {
            const ItemIcon = item.icon;
            const isItemActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isItemActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [materialsOpenPref, setMaterialsOpenPref] = useState(false);
  const [distributorsOpenPref, setDistributorsOpenPref] = useState(false);

  const onMaterialsPath = pathname.startsWith("/materials");
  const onDistributorsPath = pathname.startsWith("/distributors");
  const materialsOpen = materialsOpenPref || onMaterialsPath;
  const distributorsOpen = distributorsOpenPref || onDistributorsPath;

  const materialSubItems = [
    { label: "카테고리 관리", href: "/materials/categories", icon: Tag },
    { label: "마감재 등록", href: "/materials", icon: Package, exact: true },
  ];

  const distributorSubItems = [
    { label: "마감재 업체", href: "/distributors/material", icon: Truck },
    { label: "기타 업체", href: "/distributors/other", icon: Wrench },
    { label: "업체 구분 관리", href: "/distributors/types", icon: Tag },
  ];

  const bottomNavItems = [
    { label: "스펙북 작성", href: "/specbook", icon: BookOpen },
    { label: "프로젝트 스펙 정보", href: "/projects", icon: FolderOpen },
  ];

  return (
    <aside className="sticky top-14 h-[calc(100vh-56px)] w-72 shrink-0 border-r bg-card flex flex-col">
      <nav className="flex-1 px-3 py-4 space-y-1">
        <CollapsibleMenu
          icon={Layers}
          label="마감재 DB"
          isActive={onMaterialsPath}
          isOpen={materialsOpen}
          onToggle={() => setMaterialsOpenPref((v) => !v)}
          subItems={materialSubItems}
          pathname={pathname}
        />
        <CollapsibleMenu
          icon={Building2}
          label="업체 DB"
          isActive={onDistributorsPath}
          isOpen={distributorsOpen}
          onToggle={() => setDistributorsOpenPref((v) => !v)}
          subItems={distributorSubItems}
          pathname={pathname}
        />
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
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
              {!isActive && (
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
          <span className="text-[11px] text-muted-foreground">Supabase 연동 중</span>
        </div>
      </div>
    </aside>
  );
}
