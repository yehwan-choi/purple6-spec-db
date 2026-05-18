import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMaterialById,
  getMaterialCategoryById,
  getDistributorTypes,
  getDistributorsForMaterial,
  getProjectSpecsWithProjectForMaterial,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MaterialDetailTabs } from "@/components/materials/MaterialDetailTabs";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MaterialDetailPage({ params }: Props) {
  const { id } = await params;
  const [material, distributors, specRows, distributorTypes] = await Promise.all([
    getMaterialById(id),
    getDistributorsForMaterial(id),
    getProjectSpecsWithProjectForMaterial(id),
    getDistributorTypes(),
  ]);
  if (!material) notFound();

  const category = (await getMaterialCategoryById(material.category_id)) ?? undefined;

  const relatedProjects = specRows
    .filter((r) => r.project !== null)
    .map((r) => ({ spec: r, project: r.project! }));

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2 text-muted-foreground" asChild>
        <Link href="/materials">
          <ArrowLeft className="h-4 w-4" />
          마감재 목록으로
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <>
                <span className="inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                  {category.category_kor}
                </span>
                <span className="text-xs text-muted-foreground">{category.category_eng}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{material.material_item}</h1>
        </div>
      </div>

      {/* Tabs */}
      <MaterialDetailTabs
        material={material}
        category={category}
        distributors={distributors}
        relatedProjects={relatedProjects}
        distributorTypes={distributorTypes}
      />
    </div>
  );
}
