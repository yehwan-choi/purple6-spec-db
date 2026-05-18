import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getDistributorById,
  getMaterialsForDistributor,
  getMaterialCategories,
  getRelatedProjectsForDistributor,
} from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DistributorDetailPage({ params }: Props) {
  const { id } = await params;
  const [distributor, materials, relatedProjects, categories] = await Promise.all([
    getDistributorById(id),
    getMaterialsForDistributor(id),
    getRelatedProjectsForDistributor(id),
    getMaterialCategories(),
  ]);
  if (!distributor) notFound();

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="p-8 max-w-4xl space-y-8">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" className="-ml-2 gap-2 text-muted-foreground" asChild>
        <Link href="/distributors">
          <ArrowLeft className="h-4 w-4" />
          업체 목록으로
        </Link>
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline">
            {distributor.distributor_type === "material" ? "마감재 업체" : "기타 업체"}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{distributor.company_name}</h1>
        {distributor.address && (
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {distributor.address}
          </p>
        )}
        {distributor.note && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed border-l-2 border-muted pl-3">
            {distributor.note}
          </p>
        )}
      </div>

      {/* 담당자 */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          담당자 ({distributor.contacts.length}명)
        </h2>
        <div className="border-t">
          {distributor.contacts.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">등록된 담당자가 없습니다.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">이름</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">역할</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">전화</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">이메일</th>
                </tr>
              </thead>
              <tbody>
                {distributor.contacts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5 font-medium">{c.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.role || "-"}</td>
                    <td className="px-3 py-2.5">
                      {c.phone ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3" />{c.phone}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-3 py-2.5">
                      {c.email ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3" />{c.email}
                        </span>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 취급 마감재 */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          취급 마감재 ({materials.length}개)
        </h2>
        <div className="border-t">
          {materials.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">연결된 마감재가 없습니다.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">자재명</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">카테고리</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">마감</th>
                  <th className="px-3 py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const category = categoryMap.get(m.category_id);
                  return (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2.5 font-medium">{m.material_item}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">
                        {category ? `${category.category_kor} (${category.category_eng})` : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{m.material_finish || "-"}</td>
                      <td className="px-3 py-2.5">
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
        </div>
      </div>

      {/* 참여 프로젝트 */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          참여 프로젝트 ({relatedProjects.length})
        </h2>
        <div className="border-t">
          {relatedProjects.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">참여한 프로젝트가 없습니다.</p>
          ) : (
            <div>
              {relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between px-3 py-2.5 border-b last:border-0 hover:bg-muted/20 transition-colors group"
                >
                  <div>
                    <span className="text-sm font-medium group-hover:underline">{project.project_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{project.project_client} · {project.project_year}</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
