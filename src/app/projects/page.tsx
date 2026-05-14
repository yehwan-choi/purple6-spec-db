import { getProjects, getData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Maximize2, CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ProjectStatus } from "@/types";

export const metadata = { title: "프로젝트 | 마감재 DB" };

const statusConfig: Record<ProjectStatus, { label: string; variant: "success" | "info" | "warning" }> = {
  completed: { label: "완료", variant: "success" },
  in_progress: { label: "진행중", variant: "info" },
  pending: { label: "예정", variant: "warning" },
};

export default function ProjectsPage() {
  const projects = getProjects();
  const data = getData();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">프로젝트</h1>
          <p className="text-muted-foreground mt-1">스펙북 단위 프로젝트 관리</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          프로젝트 생성
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_2fr_80px_200px_60px_80px_40px] items-center bg-muted/40 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>프로젝트명</span>
          <span>클라이언트</span>
          <span>주소</span>
          <span className="text-center">면적</span>
          <span>일정</span>
          <span className="text-center">자재</span>
          <span className="text-center">상태</span>
          <span />
        </div>

        {/* Rows — each row is a full-width Link */}
        <div className="divide-y">
          {projects.map((project) => {
            const cfg = statusConfig[project.status];
            const specCount = data.project_specs.filter(
              (s) => s.project_id === project.id
            ).length;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="grid grid-cols-[2fr_1fr_2fr_80px_200px_60px_80px_40px] items-center px-4 py-3.5 text-sm hover:bg-muted/30 transition-colors group"
              >
                <span className="font-medium group-hover:underline underline-offset-4 truncate pr-4">
                  {project.project_name}
                </span>
                <span className="text-muted-foreground truncate pr-4">
                  {project.client_name}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground truncate pr-4">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{project.address}</span>
                </span>
                <span className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                  {project.area_sqm}㎡
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span className="tabular-nums text-xs">{project.start_date} ~ {project.end_date}</span>
                </span>
                <span className="flex justify-center">
                  <Badge variant="secondary">{specCount}개</Badge>
                </span>
                <span className="flex justify-center">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </span>
                <span className="flex justify-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
