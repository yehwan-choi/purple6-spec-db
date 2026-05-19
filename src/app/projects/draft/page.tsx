import { getProjectsByStatus } from "@/lib/data";
import { AddProjectModal } from "@/components/projects/AddProjectModal";
import { ProjectsList } from "@/components/projects/ProjectsList";

export const metadata = { title: "신규 프로젝트 SPEC 작성 | 마감재 DB" };

export default async function DraftProjectsPage() {
  const projects = await getProjectsByStatus("draft");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">신규 프로젝트 SPEC 작성</h1>
          <p className="text-muted-foreground mt-1">진행 중인 프로젝트의 스펙북 관리</p>
        </div>
        <AddProjectModal />
      </div>

      <ProjectsList projects={projects} />
    </div>
  );
}
