"use client";

import { useState, useMemo, useTransition, useRef } from "react";
import Image from "next/image";
import { Search, ImageIcon, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SortIcon } from "@/components/ui/sort-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteMaterial, updateMaterial, updateMaterialDistributor } from "@/lib/actions";
import { useCanWrite } from "@/components/auth/RoleProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Material, MaterialCategory, Distributor } from "@/types";

type SortKey = "category" | "material_item" | "material_finish" | "material_size";
type SortDir = "asc" | "desc";

interface Props {
  materials: Material[];
  categories: MaterialCategory[];
  distributorLinkMap?: Map<string, { id: string; name: string }>;
  distributors?: Distributor[];
}

export function MaterialsFilter({ materials: initialMaterials, categories, distributorLinkMap = new Map(), distributors = [] }: Props) {
  const canWrite = useCanWrite();
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selected, setSelected] = useState<Material | null>(null);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editItem, setEditItem] = useState("");
  const [editFinish, setEditFinish] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editDistributorId, setEditDistributorId] = useState("");
  const [distributorPickerOpen, setDistributorPickerOpen] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("material_item");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories]
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const cat = categoryMap[m.category_id];
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        m.material_item.toLowerCase().includes(q) ||
        (cat?.category_eng ?? "").toLowerCase().includes(q) ||
        (cat?.category_kor ?? "").includes(q);
      const matchCat = selectedCat === "all" || m.category_id === selectedCat;
      return matchSearch && matchCat;
    });
  }, [materials, search, selectedCat, categoryMap]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = "", bv = "";
      if (sortKey === "category") {
        av = categoryMap[a.category_id]?.category_eng ?? "";
        bv = categoryMap[b.category_id]?.category_eng ?? "";
      } else if (sortKey === "material_item") {
        av = a.material_item; bv = b.material_item;
      } else if (sortKey === "material_finish") {
        av = a.material_finish ?? ""; bv = b.material_finish ?? "";
      } else {
        av = a.material_size ?? ""; bv = b.material_size ?? "";
      }
      const cmp = av.localeCompare(bv, "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, categoryMap]);


  function openEdit(m: Material) {
    setSelected(m);
    setEditCategoryId(m.category_id ?? "");
    setEditItem(m.material_item);
    setEditFinish(m.material_finish ?? "");
    setEditSize(m.material_size ?? "");
    setEditDistributorId(distributorLinkMap.get(m.id)?.id ?? "");
    setEditImagePreview(m.material_image ?? null);
    setEditImageFile(null);
    setSaveError(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setSaveError(null);

    const prevDistributorId = distributorLinkMap.get(selected.id)?.id ?? "";
    const [matResult, distResult] = await Promise.all([
      updateMaterial(
        selected.id,
        { category_id: editCategoryId, material_item: editItem, material_finish: editFinish, material_size: editSize },
        editImageFile
      ),
      editDistributorId !== prevDistributorId
        ? updateMaterialDistributor(selected.id, editDistributorId || null)
        : Promise.resolve({ success: true } as { success: boolean; error?: string }),
    ]);

    setSaving(false);
    if (!matResult?.success) { setSaveError(matResult?.error ?? "저장 실패"); return; }
    if (!distResult?.success) { setSaveError(distResult?.error ?? "저장 실패"); return; }

    if (editDistributorId !== prevDistributorId) {
      const newName = distributors.find((d) => d.id === editDistributorId)?.company_name;
      if (newName) distributorLinkMap.set(selected.id, { id: editDistributorId, name: newName });
      else distributorLinkMap.delete(selected.id);
    }

    setMaterials((prev) => prev.map((m) =>
      m.id === selected.id
        ? { ...m, category_id: editCategoryId, material_item: editItem, material_finish: editFinish, material_size: editSize, material_image: editImagePreview }
        : m
    ));
    setSelected(null);
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setDeletingId(null);
    });
  }

  const thClass = "flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full";

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="자재명, 카테고리 검색..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedCat} onValueChange={setSelectedCat}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.category_kor} ({c.category_eng})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {sorted.length}개 결과
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 w-16 text-xs font-medium text-muted-foreground text-center">이미지</th>
              <th className="px-4 py-3 w-36">
                <button onClick={() => toggleSort("category")} className={thClass}>
                  카테고리 <SortIcon active={sortKey === "category"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("material_item")} className={thClass}>
                  자재명 <SortIcon active={sortKey === "material_item"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 w-36 text-center text-xs font-medium text-muted-foreground">공급업체</th>
              <th className="px-4 py-3 w-32">
                <button onClick={() => toggleSort("material_finish")} className={thClass}>
                  FINISH <SortIcon active={sortKey === "material_finish"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 w-36">
                <button onClick={() => toggleSort("material_size")} className={thClass}>
                  SIZE <SortIcon active={sortKey === "material_size"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 w-20 text-center text-xs font-medium text-muted-foreground">수정</th>
              <th className="px-4 py-3 w-12 text-center text-xs font-medium text-muted-foreground">삭제</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-muted-foreground">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((m) => {
                const cat = categoryMap[m.category_id];
                return (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 text-center">
                      <div className="w-14 h-14 mx-auto rounded-md overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                        {m.material_image ? (
                          <Image src={m.material_image} alt={m.material_item} width={56} height={56} unoptimized className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {cat ? (
                        <div>
                          <div className="text-xs font-medium">{cat.category_kor}</div>
                          <div className="text-xs text-muted-foreground">{cat.category_eng}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium text-center">{m.material_item}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      {distributorLinkMap.get(m.id)?.name ?? <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground text-center">{m.material_finish || "-"}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground font-mono text-center">{m.material_size || "-"}</td>
                    <td className="px-4 py-2 text-center">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(m)} disabled={!canWrite}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(m.id)}
                        disabled={!canWrite || deletingId === m.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>자재 수정</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            {/* 이미지 */}
            <div
              className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => fileInputRef.current?.click()}
            >
              {editImagePreview ? (
                <Image src={editImagePreview} alt="미리보기" fill unoptimized className="object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 opacity-30" />
                  <span className="text-xs">클릭하여 이미지 변경</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

            {/* 카테고리 드롭다운 */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">카테고리</label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.category_kor} ({c.category_eng})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 자재명 */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">자재명</label>
              <Input value={editItem} onChange={(e) => setEditItem(e.target.value)} />
            </div>

            {/* 공급업체 */}
            {distributors.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">공급업체</label>
                <Popover open={distributorPickerOpen} onOpenChange={setDistributorPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {editDistributorId
                        ? distributors.find((d) => d.id === editDistributorId)?.company_name
                        : "업체 선택"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                    <Command>
                      <CommandInput placeholder="업체 검색..." />
                      <CommandList>
                        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                        <CommandGroup>
                          {distributors.map((d) => (
                            <CommandItem
                              key={d.id}
                              value={d.company_name}
                              onSelect={() => {
                                setEditDistributorId(d.id === editDistributorId ? "" : d.id);
                                setDistributorPickerOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", editDistributorId === d.id ? "opacity-100" : "opacity-0")} />
                              {d.company_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* FINISH / SIZE */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">FINISH</label>
                <Input value={editFinish} onChange={(e) => setEditFinish(e.target.value)} placeholder="-" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">SIZE</label>
                <Input value={editSize} onChange={(e) => setEditSize(e.target.value)} placeholder="-" className="font-mono" />
              </div>
            </div>

            {saveError && <p className="text-xs text-destructive">{saveError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setSelected(null)}>취소</Button>
              <Button onClick={handleSave} disabled={saving || !editItem.trim()}>
                {saving ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
