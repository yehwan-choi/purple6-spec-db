import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProjectById,
  getProjectSpecsWithDetails,
  getMaterials,
  getMaterialCategories,
  getDistributors,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectStatusToggle } from "@/components/projects/ProjectStatusToggle";
import { SpecbookTable } from "@/components/projects/SpecbookTable";
import { ArrowLeft, FileText } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const [project, specItems, materials, categories, distributors] = await Promise.all([
    getProjectById(id),
    getProjectSpecsWithDetails(id),
    getMaterials(),
    getMaterialCategories(),
    getDistributors(),
  ]);
  if (!project) notFound();

  const isDraft = project.status === "draft";
  const backHref = isDraft ? "/projects/draft" : "/projects/completed";
  const backLabel = isDraft ? "신규 프로젝트 목록으로" : "준공 프로젝트 목록으로";

  return (
    <div className="p-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2 text-muted-foreground" asChild>
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{project.project_year}</p>
          <h1 className="text-2xl font-bold tracking-tight">{project.project_name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{project.project_client}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            스펙북 출력
          </Button>
          <ProjectStatusToggle project={project} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            스펙북 ({specItems.length}개 자재)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpecbookTable
            specItems={specItems}
            projectId={id}
            isDraft={isDraft}
            materials={materials}
            categories={categories}
            distributors={distributors}
          />
        </CardContent>
      </Card>
    </div>
  );
}
