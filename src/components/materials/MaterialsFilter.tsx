"use client";

import { useState, useMemo, useTransition } from "react";
import { Search, ImageIcon, Trash2 } from "lucide-react";
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
import { deleteMaterial } from "@/lib/actions";
import type { Material, MaterialCategory } from "@/types";

type SortKey = "category" | "material_item" | "material_finish" | "material_size";
type SortDir = "asc" | "desc";

interface Props {
  materials: Material[];
  categories: MaterialCategory[];
}

export function MaterialsFilter({ materials: initialMaterials, categories }: Props) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [selected, setSelected] = useState<Material | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("material_item");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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
        m.material_code.toLowerCase().includes(q) ||
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

  const selectedCat2 = selected ? categoryMap[selected.category_id] : null;

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setDeletingId(null);
    });
  }

  const thClass = "flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="자재명, 코드, 카테고리 검색..."
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
              <th className="px-4 py-3 w-20 text-center text-xs font-medium text-muted-foreground">상세보기</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-muted-foreground">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((m) => {
                const cat = categoryMap[m.category_id];
                return (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      {cat ? (
                        <div>
                          <div className="text-xs font-medium">{cat.category_kor}</div>
                          <div className="text-xs text-muted-foreground">{cat.category_eng}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{m.material_item}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{m.material_finish || "-"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{m.material_size || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setSelected(m)}>
                        상세
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
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

      {/* Detail Modal */}
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.material_item}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-5">
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center border">
              {selected?.material_image ? (
                <img src={selected.material_image} alt={selected.material_item} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 opacity-30" />
                  <span className="text-xs">이미지 없음</span>
                </div>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">카테고리</dt>
                <dd className="font-medium">
                  {selectedCat2 ? `${selectedCat2.category_kor} (${selectedCat2.category_eng})` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">FINISH</dt>
                <dd className="font-medium">{selected?.material_finish || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground mb-0.5">SIZE</dt>
                <dd className="font-mono font-medium">{selected?.material_size || "-"}</dd>
              </div>
            </dl>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
