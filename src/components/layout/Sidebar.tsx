"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Building2,
  FolderOpen,
  ChevronDown,
  Tag,
  Package,
  UserSearch,
  UserStar,
  Wrench,
  Settings2,
  FilePlus,
  Archive,
  Lightbulb,
  Toilet,
  Bolt,
  ShelvingUnit,
  Armchair,
  Leaf,
  Volume2,
  Baseline,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DistributorTypeRecord } from "@/types";

const PROFESSIONAL_ICONS: Record<string, React.ElementType> = {
  조명: Lightbulb,
  위생도기: Toilet,
  하드웨어: Bolt,
  제작가구: ShelvingUnit,
  이동가구: Armchair,
  조경: Leaf,
  "AV/음향": Volume2,
  사인: Baseline,
  기타: MoreHorizontal,
};

function NavLink({
  icon: Icon,
  label,
  href,
  isActive,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="font-medium whitespace-nowrap">{label}</span>
    </Link>
  );
}

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

export function Sidebar({ professionalTypes = [] }: { professionalTypes?: DistributorTypeRecord[] }) {
  const pathname = usePathname();
  const [materialsOpenPref, setMaterialsOpenPref] = useState(true);
  const [professionalOpenPref, setProfessionalOpenPref] = useState(true);
  const [projectsOpenPref, setProjectsOpenPref] = useState(true);
  const [masterOpenPref, setMasterOpenPref] = useState(true);

  const onMaterialsPath = pathname.startsWith("/materials") && !pathname.startsWith("/materials/categories");
  const onMaterialDistributorsPath = pathname.startsWith("/distributors/material");
  const onProfessionalPath = pathname.startsWith("/distributors/other");
  const onProjectsPath = pathname.startsWith("/projects");
  const onMasterPath = pathname.startsWith("/materials/categories") || pathname.startsWith("/distributors/types");

  const materialsOpen = materialsOpenPref || onMaterialsPath;
  const professionalOpen = professionalOpenPref || onProfessionalPath;
  const projectsOpen = projectsOpenPref || onProjectsPath;
  const masterOpen = masterOpenPref || onMasterPath;

  const materialSubItems = [
    { label: "마감재 라이브러리", href: "/materials", icon: Package, exact: true },
  ];

  const professionalSubItems = professionalTypes.map((t) => ({
    label: t.label_kor,
    href: `/distributors/other/${t.id}`,
    icon: PROFESSIONAL_ICONS[t.label_kor] ?? Wrench,
    exact: true,
  }));

  const projectSubItems = [
    { label: "신규 프로젝트 SPEC 작성", href: "/projects/draft", icon: FilePlus },
    { label: "준공 프로젝트 SPEC 정보", href: "/projects/completed", icon: Archive },
  ];

  const masterSubItems = [
    { label: "카테고리 관리", href: "/materials/categories", icon: Tag },
    { label: "업체 구분 관리", href: "/distributors/types", icon: Building2 },
  ];

  return (
    <aside className="sticky top-14 h-[calc(100vh-56px)] w-72 shrink-0 border-r bg-card flex flex-col">
      <nav className="flex-1 px-3 py-4 space-y-1">
        <CollapsibleMenu
          icon={Layers}
          label="마감재 라이브러리"
          isActive={onMaterialsPath}
          isOpen={materialsOpen}
          onToggle={() => setMaterialsOpenPref((v) => !v)}
          subItems={materialSubItems}
          pathname={pathname}
        />
        <NavLink
          icon={UserSearch}
          label="마감재 업체"
          href="/distributors/material"
          isActive={onMaterialDistributorsPath}
        />
        <CollapsibleMenu
          icon={UserStar}
          label="전문 업체"
          isActive={onProfessionalPath}
          isOpen={professionalOpen}
          onToggle={() => setProfessionalOpenPref((v) => !v)}
          subItems={professionalSubItems}
          pathname={pathname}
        />
        <CollapsibleMenu
          icon={FolderOpen}
          label="프로젝트 SPEC 관리"
          isActive={onProjectsPath}
          isOpen={projectsOpen}
          onToggle={() => setProjectsOpenPref((v) => !v)}
          subItems={projectSubItems}
          pathname={pathname}
        />
      </nav>

      {/* 기준정보 관리 — 하단 고정 */}
      <div className="border-t px-3 py-3">
        <CollapsibleMenu
          icon={Settings2}
          label="기준정보 관리"
          isActive={onMasterPath}
          isOpen={masterOpen}
          onToggle={() => setMasterOpenPref((v) => !v)}
          subItems={masterSubItems}
          pathname={pathname}
        />
      </div>
    </aside>
  );
}
