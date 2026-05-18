import { getProjects, getAllProjectSpecs } from "@/lib/data";
import { AddProjectModal } from "@/components/projects/AddProjectModal";
import { ProjectsList } from "@/components/projects/ProjectsList";

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

      <ProjectsList projects={projects} allSpecs={allSpecs} />
    </div>
  );
}
