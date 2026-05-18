"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SortIcon } from "@/components/ui/sort-icon";
import { ChevronRight, Trash2 } from "lucide-react";
import { deleteProject } from "@/lib/actions";
import type { Project, ProjectSpec } from "@/types";

type SortKey = "project_name" | "project_client" | "project_year" | "spec_count";
type SortDir = "asc" | "desc";

interface Props {
  projects: Project[];
  allSpecs: ProjectSpec[];
}

export function ProjectsList({ projects: initialProjects, allSpecs }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("project_year");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
    });
  }

  const specCountMap = useMemo(
    () =>
      projects.reduce<Record<string, number>>((acc, p) => {
        acc[p.id] = allSpecs.filter((s) => s.project_id === p.id).length;
        return acc;
      }, {}),
    [projects, allSpecs]
  );

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "project_name") cmp = a.project_name.localeCompare(b.project_name, "ko");
      else if (sortKey === "project_client") cmp = (a.project_client ?? "").localeCompare(b.project_client ?? "", "ko");
      else if (sortKey === "project_year") cmp = (a.project_year ?? 0) - (b.project_year ?? 0);
      else cmp = (specCountMap[a.id] ?? 0) - (specCountMap[b.id] ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [projects, sortKey, sortDir, specCountMap]);

  const thClass = "flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_80px_60px_40px_36px] items-center bg-muted/40 border-b px-4 py-3">
        <button onClick={() => toggleSort("project_name")} className={thClass}>
          프로젝트명 <SortIcon active={sortKey === "project_name"} dir={sortDir} />
        </button>
        <button onClick={() => toggleSort("project_client")} className={thClass}>
          클라이언트 <SortIcon active={sortKey === "project_client"} dir={sortDir} />
        </button>
        <button onClick={() => toggleSort("project_year")} className={`${thClass} justify-center`}>
          연도 <SortIcon active={sortKey === "project_year"} dir={sortDir} />
        </button>
        <button onClick={() => toggleSort("spec_count")} className={`${thClass} justify-center`}>
          자재 <SortIcon active={sortKey === "spec_count"} dir={sortDir} />
        </button>
        <div />
        <div />
      </div>

      <div className="divide-y">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            등록된 프로젝트가 없습니다.
          </div>
        ) : (
          sorted.map((project) => {
            const specCount = specCountMap[project.id] ?? 0;
            return (
              <div
                key={project.id}
                className="grid grid-cols-[2fr_1fr_80px_60px_40px_36px] items-center px-4 py-3.5 text-sm hover:bg-muted/30 transition-colors group"
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="font-medium hover:underline underline-offset-4 truncate pr-4"
                >
                  {project.project_name}
                </Link>
                <span className="text-muted-foreground truncate pr-4">{project.project_client}</span>
                <span className="text-center text-muted-foreground tabular-nums">{project.project_year}</span>
                <span className="flex justify-center">
                  <Badge variant="secondary">{specCount}개</Badge>
                </span>
                <span className="flex justify-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </span>
                <span className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
