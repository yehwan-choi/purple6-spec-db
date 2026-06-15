"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProjectSpec } from "@/lib/actions";
import { AddSpecModal } from "./AddSpecModal";
import { useCanWrite } from "@/components/auth/RoleProvider";
import { EditSpecModal } from "./EditSpecModal";
import type {
  ProjectSpec,
  Material,
  MaterialCategory,
  DistributorContact,
  Distributor,
} from "@/types";

type SpecItem = ProjectSpec & {
  material: (Material & { category: MaterialCategory | null }) | null;
  distributor: (Pick<Distributor, "id" | "company_name"> & { contacts: DistributorContact[] }) | null;
};

interface Props {
  specItems: SpecItem[];
  projectId: string;
  isDraft: boolean;
  materials: Material[];
  categories: MaterialCategory[];
  distributors: Distributor[];
}

export function SpecbookTable({
  specItems,
  projectId,
  isDraft,
  materials,
  categories,
  distributors,
}: Props) {
  const canWrite = useCanWrite();
  const router = useRouter();
  const [deletedIds, setDeletedIds] = useState(new Set<string>());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSpec, setEditingSpec] = useState<SpecItem | null>(null);
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
      {isDraft && canWrite && (
        <div className="flex justify-end mb-4">
          <AddSpecModal
            projectId={projectId}
            materials={materials}
            categories={categories}
            distributors={distributors}
            onAdded={() => router.refresh()}
          />
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {isDraft ? "상단 버튼으로 스펙을 추가해주세요." : "등록된 자재 스펙이 없습니다."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-center font-bold text-foreground py-3 px-3 whitespace-nowrap bg-primary/10 border border-border">MATERIAL</th>
                <th className="text-center font-bold text-foreground py-3 px-3 whitespace-nowrap bg-primary/10 border border-border">CODE</th>
                <th className="text-center font-bold text-foreground py-3 px-3 whitespace-nowrap bg-primary/10 border border-border">ITEM</th>
                <th className="text-center font-bold text-foreground py-3 px-3 whitespace-nowrap bg-primary/10 border border-border">DISTRIBUTOR</th>
                <th className="text-center font-bold text-foreground py-3 px-3 whitespace-nowrap bg-primary/10 border border-border">CONTACT NO.</th>
                <th className="text-center font-bold text-foreground py-3 px-3 whitespace-nowrap bg-primary/10 border border-border">LOCATION</th>
                <th className="text-center font-bold text-foreground py-3 px-3 whitespace-nowrap bg-muted border border-border">수정</th>
                {isDraft && <th className="text-center font-bold text-foreground py-3 px-3 whitespace-nowrap bg-muted border border-border">삭제</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const { material, distributor } = item;
                const category = material?.category ?? null;
                const contact = item.contact_id
                  ? distributor?.contacts?.find((c) => c.id === item.contact_id) ?? null
                  : null;
                const code = category
                  ? `${category.code_prefix}${item.code_suffix ? `-${item.code_suffix}` : ""}`
                  : item.code_suffix || "-";

                return (
                  <tr key={item.id} className="group">
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap border border-border">
                      <span className="text-xs font-medium">{category?.category_eng ?? "-"}</span>
                    </td>
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap border border-border">
                      <span className="text-xs font-mono">{code}</span>
                    </td>
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap border border-border">
                      <span className="text-xs">{material?.material_item ?? "-"}</span>
                    </td>
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap border border-border">
                      {distributor ? (
                        <span className="text-xs">{distributor.company_name}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap border border-border">
                      {contact ? (
                        <div>
                          <div className="text-xs font-medium">{contact.name}</div>
                          <div className="text-xs text-muted-foreground">{contact.phone}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center align-middle whitespace-nowrap border border-border">
                      <span className="text-xs text-muted-foreground">{item.location || "-"}</span>
                    </td>
                    <td className="py-3 px-3 text-center align-middle bg-muted border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingSpec(item)}
                        disabled={!canWrite}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                    {isDraft && (
                      <td className="py-3 px-3 text-center align-middle bg-muted border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                          disabled={!canWrite || deletingId === item.id}
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
        </div>
      )}

      {editingSpec && (
        <EditSpecModal
          spec={editingSpec}
          projectId={projectId}
          open={!!editingSpec}
          onOpenChange={(open) => { if (!open) setEditingSpec(null); }}
          materials={materials}
          categories={categories}
          distributors={distributors}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}
