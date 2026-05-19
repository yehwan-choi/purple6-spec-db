"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProjectSpec } from "@/lib/actions";
import { AddSpecModal } from "./AddSpecModal";
import type {
  ProjectSpec,
  Material,
  MaterialCategory,
  Distributor,
  MaterialDistributorLink,
} from "@/types";

type SpecItem = ProjectSpec & {
  material: (Material & { category: MaterialCategory | null }) | null;
  distributor: Pick<Distributor, "id" | "company_name"> | null;
};

interface Props {
  specItems: SpecItem[];
  projectId: string;
  isDraft: boolean;
  materials: Material[];
  distributors: Distributor[];
  links: MaterialDistributorLink[];
}

export function SpecbookTable({
  specItems,
  projectId,
  isDraft,
  materials,
  distributors,
  links,
}: Props) {
  const router = useRouter();
  const [deletedIds, setDeletedIds] = useState(new Set<string>());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const items = specItems.filter((item) => !deletedIds.has(item.id));

  function handleDelete(specId: string) {
    setDeletingId(specId);
    setDeletedIds((prev) => new Set([...prev, specId]));
    startTransition(async () => {
      await deleteProjectSpec(specId, projectId);
      setDeletingId(null);
      router.refresh();
    });
  }

  return (
    <div>
      {isDraft && (
        <div className="flex justify-end mb-4">
          <AddSpecModal
            projectId={projectId}
            materials={materials}
            distributors={distributors}
            links={links}
            onAdded={() => router.refresh()}
          />
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {isDraft ? "상단 버튼으로 스펙을 추가해주세요." : "등록된 자재 스펙이 없습니다."}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left font-medium text-muted-foreground pb-3 w-8">#</th>
              <th className="text-left font-medium text-muted-foreground pb-3">자재</th>
              <th className="text-left font-medium text-muted-foreground pb-3">카테고리</th>
              <th className="text-left font-medium text-muted-foreground pb-3">공급업체</th>
              <th className="text-left font-medium text-muted-foreground pb-3 pl-6">메모</th>
              <th className="pb-3 w-10" />
              {isDraft && <th className="pb-3 w-10" />}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const { material, distributor } = item;
              const category = material?.category ?? null;
              return (
                <tr key={item.id} className="border-b last:border-0 group">
                  <td className="py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="py-3">
                    <div className="font-medium">{material?.material_item ?? item.material_id}</div>
                    {(material?.material_finish || material?.material_size) && (
                      <div className="text-xs text-muted-foreground">
                        {[material?.material_finish, material?.material_size]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="py-3">
                    {category ? (
                      <div>
                        <div className="text-xs font-medium">{category.category_kor}</div>
                        <div className="text-xs text-muted-foreground">{category.category_eng}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    {distributor ? (
                      <Link
                        href={`/distributors/${distributor.id}`}
                        className="hover:underline"
                      >
                        {distributor.company_name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 pl-6 text-muted-foreground text-xs max-w-xs">
                    {item.memo}
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
                  {isDraft && (
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
