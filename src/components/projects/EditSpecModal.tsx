"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateProjectSpec } from "@/lib/actions";
import { InfoRow, Field, SearchCombobox } from "./spec-form-helpers";
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
  spec: SpecItem;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: Material[];
  categories: MaterialCategory[];
  distributors: Distributor[];
  onSaved: () => void;
}

export function EditSpecModal({
  spec,
  projectId,
  open,
  onOpenChange,
  materials,
  categories,
  distributors,
  onSaved,
}: Props) {
  const initialMaterial = materials.find((m) => m.id === spec.material_id) ?? null;
  const initialCategoryId = initialMaterial?.category_id ?? null;

  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [materialId, setMaterialId] = useState(spec.material_id);
  const [distributorId, setDistributorId] = useState(spec.distributor_id);
  const [contactId, setContactId] = useState<string | null>(spec.contact_id);
  const [codeSuffix, setCodeSuffix] = useState(spec.code_suffix ?? "");
  const [quantity, setQuantity] = useState(spec.quantity ?? "");
  const [area, setArea] = useState(spec.area ?? "");
  const [location, setLocation] = useState(spec.location ?? "");
  const [description, setDescription] = useState(spec.description ?? "");
  const [price, setPrice] = useState(spec.price ?? "");
  const [delivery, setDelivery] = useState(spec.delivery ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;
  const filteredMaterials = categoryId
    ? materials.filter((m) => m.category_id === categoryId)
    : [];
  const selectedMaterial = materials.find((m) => m.id === materialId) ?? null;
  const selectedDistributor = distributors.find((d) => d.id === distributorId) ?? null;

  const categoryItems = categories.map((c) => ({
    id: c.id,
    label: c.category_eng,
    sub: c.category_kor,
  }));

  const materialItems = filteredMaterials.map((m) => ({
    id: m.id,
    label: m.material_item,
    sub: [m.material_finish, m.material_size].filter(Boolean).join(" · "),
  }));

  const distributorItems = distributors.map((d) => ({
    id: d.id,
    label: d.company_name,
  }));

  function handleCategorySelect(id: string) {
    setCategoryId(id);
    setMaterialId("");
    setContactId(null);
  }

  function handleMaterialSelect(id: string) {
    setMaterialId(id);
    setContactId(null);
  }

  function handleDistributorSelect(id: string) {
    setDistributorId(id);
    setContactId(null);
  }

  function handleSave() {
    if (!materialId) { setError("자재를 선택해주세요."); return; }
    if (!distributorId) { setError("업체를 선택해주세요."); return; }
    setError(null);
    startTransition(async () => {
      const result = await updateProjectSpec(spec.id, projectId, {
        material_id: materialId,
        distributor_id: distributorId,
        code_suffix: codeSuffix,
        contact_id: contactId,
        quantity,
        area,
        location,
        description,
        price,
        delivery,
      });
      if (result?.success) {
        onOpenChange(false);
        onSaved();
      } else {
        setError(result?.error ?? "오류가 발생했습니다.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>스펙 수정</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto px-6 pb-6 space-y-5">

          {/* 1단계: 카테고리 선택 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">카테고리 *</label>
            <SearchCombobox
              value={categoryId}
              placeholder="카테고리를 검색하세요"
              searchPlaceholder="카테고리 검색..."
              items={categoryItems}
              onSelect={handleCategorySelect}
              displayValue={selectedCategory ? `${selectedCategory.category_eng} · ${selectedCategory.category_kor}` : null}
            />
          </div>

          {/* 2단계: 자재 선택 */}
          <div className="space-y-1.5">
            <label className={cn("text-sm font-medium", !categoryId && "text-muted-foreground")}>
              자재 *
            </label>
            {!categoryId ? (
              <p className="text-sm text-muted-foreground py-1">카테고리를 먼저 선택해주세요.</p>
            ) : filteredMaterials.length === 0 ? (
              <p className="text-sm text-muted-foreground py-1">해당 카테고리에 등록된 자재가 없습니다.</p>
            ) : (
              <SearchCombobox
                value={materialId || null}
                placeholder="자재를 검색하세요"
                searchPlaceholder="자재명 검색..."
                items={materialItems}
                onSelect={handleMaterialSelect}
                displayValue={selectedMaterial?.material_item ?? null}
              />
            )}
          </div>

          {/* 자재 정보 자동 표시 */}
          {selectedMaterial && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <InfoRow label="MATERIAL" value={selectedCategory?.category_eng} />
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">CODE</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-muted-foreground">
                    {selectedCategory?.code_prefix ?? "??"}
                  </span>
                  <span className="text-xs text-muted-foreground">-</span>
                  <Input
                    value={codeSuffix}
                    onChange={(e) => setCodeSuffix(e.target.value)}
                    placeholder="01"
                    className="h-7 w-20 text-xs font-mono"
                  />
                </div>
              </div>
              <InfoRow label="ITEM" value={selectedMaterial.material_item} />
              <InfoRow label="FINISH" value={selectedMaterial.material_finish} />
              <InfoRow label="SIZE" value={selectedMaterial.material_size} />
            </div>
          )}

          {/* 업체 선택 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">업체 *</label>
            <SearchCombobox
              value={distributorId || null}
              placeholder="업체를 검색하세요"
              searchPlaceholder="업체명 검색..."
              items={distributorItems}
              onSelect={handleDistributorSelect}
              displayValue={selectedDistributor?.company_name ?? null}
            />
          </div>

          {/* 담당자 선택 */}
          {selectedDistributor && selectedDistributor.contacts.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">담당자</label>
              <Select value={contactId ?? ""} onValueChange={(v) => setContactId(v || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="담당자 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDistributor.contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.phone ? ` · ${c.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 추가 정보 */}
          <div className="space-y-3 pt-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">추가 정보</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="QUANTITY" value={quantity} onChange={setQuantity} />
              <Field label="AREA" value={area} onChange={setArea} />
              <Field label="PRICE" value={price} onChange={setPrice} />
              <Field label="DELIVERY" value={delivery} onChange={setDelivery} />
            </div>
            <Field label="LOCATION" value={location} onChange={setLocation} />
            <Field label="DESCRIPTION" value={description} onChange={setDescription} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={pending || !materialId || !distributorId}
            >
              {pending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
