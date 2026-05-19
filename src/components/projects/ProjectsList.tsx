"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SortIcon } from "@/components/ui/sort-icon";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/lib/actions";
import type { Project } from "@/types";

type SortKey = "project_name" | "project_client" | "project_year";
type SortDir = "asc" | "desc";

interface Props {
  projects: Project[];
}

export function ProjectsList({ projects: initialProjects }: Props) {
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

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "project_name") cmp = a.project_name.localeCompare(b.project_name, "ko");
      else if (sortKey === "project_client") cmp = (a.project_client ?? "").localeCompare(b.project_client ?? "", "ko");
      else cmp = (a.project_year ?? 0) - (b.project_year ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [projects, sortKey, sortDir]);

  const thClass = "flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 w-24 text-center">
              <button onClick={() => toggleSort("project_year")} className={`${thClass} justify-center w-full`}>
                연도 <SortIcon active={sortKey === "project_year"} dir={sortDir} />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button onClick={() => toggleSort("project_name")} className={thClass}>
                프로젝트명 <SortIcon active={sortKey === "project_name"} dir={sortDir} />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button onClick={() => toggleSort("project_client")} className={thClass}>
                클라이언트 <SortIcon active={sortKey === "project_client"} dir={sortDir} />
              </button>
            </th>
            <th className="px-4 py-3 w-24 text-center text-xs font-medium text-muted-foreground">상세보기</th>
            <th className="px-4 py-3 w-12 text-center text-xs font-medium text-muted-foreground">삭제</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-16 text-muted-foreground">
                등록된 프로젝트가 없습니다.
              </td>
            </tr>
          ) : (
            sorted.map((project) => (
              <tr key={project.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3.5 text-center tabular-nums text-muted-foreground">
                  {project.project_year}
                </td>
                <td className="px-4 py-3.5 font-medium">
                  {project.project_name}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  {project.project_client || "-"}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Button variant="outline" size="sm" className="h-7 text-xs px-3" asChild>
                    <Link href={`/projects/${project.id}`}>상세보기</Link>
                  </Button>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
