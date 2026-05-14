import { notFound } from "next/navigation";
import Link from "next/link";
import { getMaterialById, getBrandById, getVendorsForMaterial, getData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { MaterialDetailTabs } from "@/components/materials/MaterialDetailTabs";

interface Props {
  params: Promise<{ id: string }>;
}

const cat1Colors: Record<string, string> = {
  Material: "bg-blue-50 text-blue-700 border-blue-200",
  Sanitary: "bg-purple-50 text-purple-700 border-purple-200",
  Lighting: "bg-amber-50 text-amber-700 border-amber-200",
  Hardware: "bg-green-50 text-green-700 border-green-200",
};

export default async function MaterialDetailPage({ params }: Props) {
  const { id } = await params;
  const material = getMaterialById(id);
  if (!material) notFound();

  const brand = getBrandById(material.brand_id);
  const vendors = getVendorsForMaterial(id);
  const data = getData();

  const relatedProjects = data.project_specs
    .filter((s) => s.material_id === id)
    .map((spec) => ({ spec, project: data.projects.find((p) => p.id === spec.project_id) }))
    .filter((r): r is { spec: typeof r.spec; project: NonNullable<typeof r.project> } => r.project !== undefined);

  return (
    <div className="p-8 max-w-3xl">
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
            <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cat1Colors[material.cat_1] ?? ""}`}>
              {material.cat_1}
            </span>
            <span className="text-xs text-muted-foreground">/ {material.cat_2}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{material.name}</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">{material.model_number}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">단가</p>
          <p className="text-2xl font-bold tabular-nums">{formatPrice(material.price_per_unit)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">/ {material.unit}</p>
        </div>
      </div>

      {/* Tabs */}
      <MaterialDetailTabs
        material={material}
        brand={brand}
        vendors={vendors}
        relatedProjects={relatedProjects}
      />
    </div>
  );
}
