import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getVendorById,
  getMaterialsForVendor,
  getBrandById,
  getData,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Layers,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import type { ProjectStatus } from "@/types";

const statusConfig: Record<ProjectStatus, { label: string; variant: "success" | "info" | "warning" }> = {
  completed: { label: "완료", variant: "success" },
  in_progress: { label: "진행중", variant: "info" },
  pending: { label: "예정", variant: "warning" },
};

interface Props {
  params: Promise<{ id: string }>;
}

const cat1Colors: Record<string, string> = {
  Material: "bg-blue-50 text-blue-700 border-blue-200",
  Sanitary: "bg-purple-50 text-purple-700 border-purple-200",
  Lighting: "bg-amber-50 text-amber-700 border-amber-200",
  Hardware: "bg-green-50 text-green-700 border-green-200",
};

export default async function VendorDetailPage({ params }: Props) {
  const { id } = await params;
  const vendor = getVendorById(id);
  if (!vendor) notFound();

  const materials = getMaterialsForVendor(id);
  const data = getData();

  const relatedProjectIds = [
    ...new Set(
      data.project_specs
        .filter((s) => s.vendor_id === id)
        .map((s) => s.project_id)
    ),
  ];
  const relatedProjects = relatedProjectIds
    .map((pid) => data.projects.find((p) => p.id === pid))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2 text-muted-foreground" asChild>
        <Link href="/vendors">
          <ArrowLeft className="h-4 w-4" />
          공급업체 목록으로
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{vendor.specialty}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{vendor.company_name}</h1>
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {vendor.address}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Phone className="h-3.5 w-3.5" />
            {vendor.phone}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left */}
        <div className="col-span-2 space-y-6">
          {/* Note */}
          {vendor.note && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed">{vendor.note}</p>
              </CardContent>
            </Card>
          )}

          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                담당자 ({vendor.contacts.length}명)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 담당자가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {vendor.contacts.map((c, idx) => (
                    <div key={c.id}>
                      {idx > 0 && <Separator className="mb-3" />}
                      <div className="flex items-center gap-6">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {c.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{c.name}</span>
                            <Badge variant="secondary" className="text-xs">{c.role}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5">
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />{c.phone}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />{c.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" />
                취급 마감재 ({materials.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {materials.length === 0 ? (
                <p className="text-sm text-muted-foreground">연결된 마감재가 없습니다.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium text-muted-foreground pb-2">자재명</th>
                      <th className="text-left font-medium text-muted-foreground pb-2">카테고리</th>
                      <th className="text-left font-medium text-muted-foreground pb-2">제조사</th>
                      <th className="text-right font-medium text-muted-foreground pb-2">단가</th>
                      <th className="pb-2 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m) => {
                      const brand = getBrandById(m.brand_id);
                      return (
                        <tr key={m.id} className="border-b last:border-0">
                          <td className="py-2.5">
                            <div className="font-medium">{m.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{m.model_number}</div>
                          </td>
                          <td className="py-2.5">
                            <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${cat1Colors[m.cat_1] ?? ""}`}>
                              {m.cat_1}
                            </span>
                            <span className="block text-xs text-muted-foreground mt-0.5">{m.cat_2}</span>
                          </td>
                          <td className="py-2.5 text-sm">{brand?.brand_name ?? "-"}</td>
                          <td className="py-2.5 text-right font-medium tabular-nums">
                            {formatPrice(m.price_per_unit)}
                          </td>
                          <td className="py-2.5">
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                              <Link href={`/materials/${m.id}`}>
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Contact info + Projects */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">연락처</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{vendor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="break-all">{vendor.email}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{vendor.address}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                참여 프로젝트 ({relatedProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">참여한 프로젝트가 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {relatedProjects.map((project) => {
                    const cfg = statusConfig[project.status];
                    return (
                      <li key={project.id}>
                        <Link
                          href={`/projects/${project.id}`}
                          className="flex items-start gap-2 group rounded-md hover:bg-accent px-2 py-1.5 -mx-2 transition-colors"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0 group-hover:bg-primary transition-colors" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium group-hover:underline leading-snug block truncate">
                              {project.project_name}
                            </span>
                            <span className="text-xs text-muted-foreground">{project.client_name}</span>
                          </div>
                          <Badge variant={cfg.variant} className="shrink-0 mt-0.5">{cfg.label}</Badge>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
