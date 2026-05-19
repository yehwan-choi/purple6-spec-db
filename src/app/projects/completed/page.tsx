import { getProjectsByStatus } from "@/lib/data";
import { ProjectsList } from "@/components/projects/ProjectsList";

export const metadata = { title: "준공 프로젝트 SPEC 정보 | 마감재 DB" };

export default async function CompletedProjectsPage() {
  const projects = await getProjectsByStatus("completed");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">준공 프로젝트 SPEC 정보</h1>
          <p className="text-muted-foreground mt-1">준공 완료된 프로젝트의 확정 스펙북</p>
        </div>
      </div>

      <ProjectsList projects={projects} />
    </div>
  );
}
