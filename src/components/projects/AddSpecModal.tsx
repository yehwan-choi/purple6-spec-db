"use client";

import { useState, useRef, useTransition } from "react";
import { Check, Search } from "lucide-react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { addProjectSpec } from "@/lib/actions";
import type { Material, MaterialCategory, Distributor } from "@/types";

interface Props {
  projectId: string;
  materials: Material[];
  categories: MaterialCategory[];
  distributors: Distributor[];
  onAdded: () => void;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value || "-"}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="h-8 text-sm"
      />
    </div>
  );
}

function SearchCombobox({
  value,
  placeholder,
  searchPlaceholder,
  items,
  onSelect,
  displayValue,
  disabled,
}: {
  value: string | null;
  placeholder: string;
  searchPlaceholder: string;
  items: { id: string; label: string; sub?: string }[];
  onSelect: (id: string) => void;
  displayValue: string | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter((item) =>
    `${item.label} ${item.sub ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/5"
        )}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span className={cn(displayValue ? "text-foreground" : "text-muted-foreground")}>
          {displayValue ?? placeholder}
        </span>
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-md border bg-popover shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">검색 결과가 없습니다.</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(item.id); }}
                >
                  <Check className={cn("h-4 w-4 shrink-0", value === item.id ? "opacity-100" : "opacity-0")} />
                  <div className="text-left">
                    <div>{item.label}</div>
                    {item.sub && <div className="text-xs text-muted-foreground">{item.sub}</div>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AddSpecModal({
  projectId,
  materials,
  categories,
  distributors,
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);
  const [codeSuffix, setCodeSuffix] = useState("");
  const [quantity, setQuantity] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("");
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
    setMaterialId(null);
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

  function handleSubmit() {
    if (!materialId) { setError("자재를 선택해주세요."); return; }
    if (!distributorId) { setError("업체를 선택해주세요."); return; }
    setError(null);
    startTransition(async () => {
      const result = await addProjectSpec(projectId, {
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
        resetForm();
        setOpen(false);
        onAdded();
      } else {
        setError(result?.error ?? "오류가 발생했습니다.");
      }
    });
  }

  function resetForm() {
    setCategoryId(null);
    setMaterialId(null);
    setDistributorId(null);
    setContactId(null);
    setCodeSuffix("");
    setQuantity("");
    setArea("");
    setLocation("");
    setDescription("");
    setPrice("");
    setDelivery("");
    setError(null);
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          마감재 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>스펙 추가 입력</DialogTitle>
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
                value={materialId}
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
              value={distributorId}
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={pending || !materialId || !distributorId}
            >
              {pending ? "추가 중..." : "추가"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
