import { getProjects, getAllProjectSpecs } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AddProjectModal } from "@/components/projects/AddProjectModal";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";

export const metadata = { title: "프로젝트 | 마감재 DB" };

export default async function ProjectsPage() {
  const [projects, allSpecs] = await Promise.all([getProjects(), getAllProjectSpecs()]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">프로젝트</h1>
          <p className="text-muted-foreground mt-1">스펙북 단위 프로젝트 관리</p>
        </div>
        <AddProjectModal />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_80px_60px_40px_36px] items-center bg-muted/40 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>프로젝트명</span>
          <span>클라이언트</span>
          <span className="text-center">연도</span>
          <span className="text-center">자재</span>
          <span />
          <span />
        </div>

        <div className="divide-y">
          {projects.map((project) => {
            const specCount = allSpecs.filter(
              (s) => s.project_id === project.id
            ).length;

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
                <span className="text-muted-foreground truncate pr-4">
                  {project.project_client}
                </span>
                <span className="text-center text-muted-foreground tabular-nums">
                  {project.project_year}
                </span>
                <span className="flex justify-center">
                  <Badge variant="secondary">{specCount}개</Badge>
                </span>
                <span className="flex justify-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </span>
                <span className="flex justify-center">
                  <DeleteProjectButton id={project.id} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
