"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortIcon } from "@/components/ui/sort-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Search, Pencil } from "lucide-react";
import { deleteProject } from "@/lib/actions";
import type { Project } from "@/types";
import { useCanWrite } from "@/components/auth/RoleProvider";

type SortKey = "project_name" | "project_client" | "project_year";
type SortDir = "asc" | "desc";

interface Props {
  projects: Project[];
}

export function ProjectsList({ projects: initialProjects }: Props) {
  const canWrite = useCanWrite();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("project_year");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");

  const years = useMemo(() => {
    const set = new Set(projects.map((p) => p.project_year).filter(Boolean));
    return [...set].sort((a, b) => b - a);
  }, [projects]);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchYear = selectedYear === "all" || String(p.project_year) === selectedYear;
      const matchSearch =
        !q ||
        p.project_name.toLowerCase().includes(q) ||
        (p.project_client ?? "").toLowerCase().includes(q);
      return matchYear && matchSearch;
    });
  }, [projects, search, selectedYear]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "project_name") cmp = a.project_name.localeCompare(b.project_name, "ko");
      else if (sortKey === "project_client") cmp = (a.project_client ?? "").localeCompare(b.project_client ?? "", "ko");
      else cmp = (a.project_year ?? 0) - (b.project_year ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const thClass = "flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="프로젝트명, 클라이언트 검색..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="연도" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 연도</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}년</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {sorted.length}개 결과
        </span>
      </div>

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
            <th className="px-4 py-3 w-24 text-center text-xs font-medium text-muted-foreground">수정</th>
            <th className="px-4 py-3 w-12 text-center text-xs font-medium text-muted-foreground">삭제</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-16 text-muted-foreground">
                {search || selectedYear !== "all" ? "검색 결과가 없습니다." : "등록된 프로젝트가 없습니다."}
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" asChild>
                    <Link href={`/projects/${project.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(project.id)}
                    disabled={!canWrite || deletingId === project.id}
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
    </div>
  );
}
