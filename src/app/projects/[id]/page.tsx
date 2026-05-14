import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProjectById,
  getMaterialById,
  getVendorById,
  getBrandById,
} from "@/lib/data";
import { getData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  CalendarDays,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { ProjectStatus } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<ProjectStatus, { label: string; variant: "success" | "info" | "warning" }> = {
  completed: { label: "완료", variant: "success" },
  in_progress: { label: "진행중", variant: "info" },
  pending: { label: "예정", variant: "warning" },
};

const cat1Colors: Record<string, string> = {
  Material: "bg-blue-50 text-blue-700 border-blue-200",
  Sanitary: "bg-purple-50 text-purple-700 border-purple-200",
  Lighting: "bg-amber-50 text-amber-700 border-amber-200",
  Hardware: "bg-green-50 text-green-700 border-green-200",
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const data = getData();
  const specs = data.project_specs.filter((s) => s.project_id === id);

  const specItems = specs.map((spec) => ({
    spec,
    material: getMaterialById(spec.material_id),
    vendor: getVendorById(spec.vendor_id),
  }));

  const cfg = statusConfig[project.status];

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2 text-muted-foreground" asChild>
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4" />
          프로젝트 목록으로
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.project_name}</h1>
          <p className="text-muted-foreground text-sm mt-1">{project.client_name}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          스펙북 출력
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">주소</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">{project.address}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Maximize2 className="h-4 w-4" />
              <span className="text-xs">면적</span>
            </div>
            <p className="text-sm font-medium">{project.area_sqm}㎡</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs">일정</span>
            </div>
            <p className="text-sm font-medium">{project.start_date}</p>
            <p className="text-xs text-muted-foreground">~ {project.end_date}</p>
          </CardContent>
        </Card>
      </div>

      {/* Spec book */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>스펙북 ({specs.length}개 자재)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {specItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              등록된 자재 스펙이 없습니다.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium text-muted-foreground pb-3 w-8">#</th>
                  <th className="text-left font-medium text-muted-foreground pb-3">자재</th>
                  <th className="text-left font-medium text-muted-foreground pb-3">카테고리</th>
                  <th className="text-left font-medium text-muted-foreground pb-3">공급업체</th>
                  <th className="text-right font-medium text-muted-foreground pb-3">단가</th>
                  <th className="text-left font-medium text-muted-foreground pb-3 pl-6">메모</th>
                  <th className="pb-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {specItems.map(({ spec, material, vendor }, idx) => (
                  <tr key={spec.id} className="border-b last:border-0">
                    <td className="py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3">
                      <div className="font-medium">{material?.name ?? spec.material_id}</div>
                      {material && (
                        <div className="text-xs text-muted-foreground font-mono">{material.model_number}</div>
                      )}
                      {material && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {getBrandById(material.brand_id)?.brand_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {material && (
                        <>
                          <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${cat1Colors[material.cat_1] ?? ""}`}>
                            {material.cat_1}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">{material.cat_2}</span>
                        </>
                      )}
                    </td>
                    <td className="py-3">
                      {vendor ? (
                        <Link href={`/vendors/${vendor.id}`} className="hover:underline">
                          {vendor.company_name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-medium tabular-nums">
                      {material ? formatPrice(material.price_per_unit) : "-"}
                    </td>
                    <td className="py-3 pl-6 text-muted-foreground text-xs max-w-xs">
                      {spec.memo}
                    </td>
                    <td className="py-3">
                      {material && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link href={`/materials/${material.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
