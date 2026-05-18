"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Phone, Mail, FolderOpen, Tag } from "lucide-react";
import type { Material, MaterialCategory, Distributor, DistributorTypeRecord, ProjectSpec, Project } from "@/types";

interface RelatedProject {
  spec: ProjectSpec;
  project: Project;
}

interface Props {
  material: Material;
  category: MaterialCategory | undefined;
  distributors: Distributor[];
  relatedProjects: RelatedProject[];
  distributorTypes: DistributorTypeRecord[];
}

export function MaterialDetailTabs({ material, category, distributors, relatedProjects, distributorTypes }: Props) {
  return (
    <Tabs defaultValue="spec">
      <TabsList variant="line">
        <TabsTrigger value="spec">
          <Tag className="h-4 w-4" />
          자재 스펙
        </TabsTrigger>
        <TabsTrigger value="distributors">
          <Building2 className="h-4 w-4" />
          업체
          <span className="ml-1 rounded-full bg-muted px-1.5 py-px text-[10px] font-semibold text-muted-foreground">
            {distributors.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="projects">
          <FolderOpen className="h-4 w-4" />
          프로젝트
          <span className="ml-1 rounded-full bg-muted px-1.5 py-px text-[10px] font-semibold text-muted-foreground">
            {relatedProjects.length}
          </span>
        </TabsTrigger>
      </TabsList>

      {/* 자재 스펙 */}
      <TabsContent value="spec">
        <Card>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {[
                { label: "카테고리",   value: category ? `${category.category_kor} (${category.category_eng})` : "-" },
                { label: "마감",       value: material.material_finish || "-" },
                { label: "크기",       value: material.material_size || "-" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-muted-foreground mb-0.5">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 업체 */}
      <TabsContent value="distributors">
        <div className="space-y-4">
          {distributors.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">등록된 업체가 없습니다.</p>
          ) : (
            distributors.map((v) => (
              <Card key={v.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link href={`/distributors/${v.id}`} className="font-medium hover:underline">
                        {v.company_name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.address}</p>
                    </div>
                    <Badge variant="outline">{distributorTypes.find((t) => t.id === v.distributor_type)?.label_kor ?? v.distributor_type}</Badge>
                  </div>
                  <Separator className="mb-3" />
                  <div className="space-y-1.5">
                    {v.contacts.map((c) => (
                      <div key={c.id} className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground w-16">{c.name}</span>
                        <span className="w-16">{c.role}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      {/* 프로젝트 */}
      <TabsContent value="projects">
        <div className="space-y-3">
          {relatedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">연결된 프로젝트가 없습니다.</p>
          ) : (
            relatedProjects.map(({ spec, project }) => (
              <Card key={spec.id}>
                <CardContent className="pt-4 pb-4">
                  <Link href={`/projects/${project.id}`} className="font-medium text-sm hover:underline block">
                    {project.project_name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">{project.project_client} · {project.project_year}</p>
                  {spec.memo && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed border-t pt-1.5">
                      {spec.memo}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
