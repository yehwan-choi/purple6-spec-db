"use client";

import { useTransition, useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortIcon } from "@/components/ui/sort-icon";
import { createMaterialCategory, deleteMaterialCategory } from "@/lib/actions";
import type { MaterialCategory } from "@/types";

type SortKey = "code_prefix" | "category_eng" | "category_kor";
type SortDir = "asc" | "desc";

interface Props {
  initialCategories: MaterialCategory[];
}

export function CategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<MaterialCategory[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code_prefix: "", category_eng: "", category_kor: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addPending, startAdd] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("code_prefix");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = useMemo(() => {
    return [...categories].sort((a, b) => {
      const cmp = a[sortKey].localeCompare(b[sortKey], "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [categories, sortKey, sortDir]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.code_prefix.trim()) e.code_prefix = "필수 입력";
    if (!form.category_eng.trim()) e.category_eng = "필수 입력";
    if (!form.category_kor.trim()) e.category_kor = "필수 입력";
    if (categories.some((c) => c.code_prefix.toUpperCase() === form.code_prefix.toUpperCase().trim()))
      e.code_prefix = "이미 사용 중인 코드입니다";
    return e;
  }

  function handleAdd() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const formData = new FormData();
    formData.set("code_prefix", form.code_prefix.toUpperCase().trim());
    formData.set("category_eng", form.category_eng.toUpperCase().trim());
    formData.set("category_kor", form.category_kor.trim());

    startAdd(async () => {
      const result = await createMaterialCategory(null, formData);
      if (result?.success) {
        setCategories((prev) => [
          ...prev,
          {
            id: `mc_${Date.now()}`,
            code_prefix: form.code_prefix.toUpperCase().trim(),
            category_eng: form.category_eng.toUpperCase().trim(),
            category_kor: form.category_kor.trim(),
          },
        ]);
        setForm({ code_prefix: "", category_eng: "", category_kor: "" });
        setErrors({});
        setShowForm(false);
      } else {
        setErrors({ _server: result?.error ?? "저장에 실패했습니다." });
      }
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startAdd(async () => {
      const result = await deleteMaterialCategory(id);
      if (result?.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
      setDeletingId(null);
    });
  }

  const thClass = "flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">카테고리 관리</h1>
          <p className="text-muted-foreground mt-1">카테고리 코드와 명칭을 등록·관리합니다</p>
        </div>
        <Button className="gap-2" onClick={() => { setShowForm(true); setErrors({}); }}>
          <Plus className="h-4 w-4" />
          기준 정보 추가
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm">새 카테고리 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  코드 접두사 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="예: PA"
                  value={form.code_prefix}
                  onChange={(e) => setForm((f) => ({ ...f, code_prefix: e.target.value }))}
                  className={errors.code_prefix ? "border-destructive" : ""}
                />
                {errors.code_prefix && <p className="text-xs text-destructive mt-1">{errors.code_prefix}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  영문명 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="예: PAINT"
                  value={form.category_eng}
                  onChange={(e) => setForm((f) => ({ ...f, category_eng: e.target.value }))}
                  className={errors.category_eng ? "border-destructive" : ""}
                />
                {errors.category_eng && <p className="text-xs text-destructive mt-1">{errors.category_eng}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  한글명 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="예: 도장"
                  value={form.category_kor}
                  onChange={(e) => setForm((f) => ({ ...f, category_kor: e.target.value }))}
                  className={errors.category_kor ? "border-destructive" : ""}
                />
                {errors.category_kor && <p className="text-xs text-destructive mt-1">{errors.category_kor}</p>}
              </div>
            </div>
            {errors._server && <p className="text-xs text-destructive mb-3">{errors._server}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={addPending}>
                {addPending ? "저장 중..." : "추가"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setErrors({}); }}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 w-28">
                <button onClick={() => toggleSort("code_prefix")} className={thClass}>
                  코드 접두사 <SortIcon active={sortKey === "code_prefix"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("category_eng")} className={thClass}>
                  영문명 <SortIcon active={sortKey === "category_eng"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("category_kor")} className={thClass}>
                  한글명 <SortIcon active={sortKey === "category_kor"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted-foreground">
                  등록된 카테고리가 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium">{c.code_prefix}</td>
                  <td className="px-4 py-3 font-medium">{c.category_eng}</td>
                  <td className="px-4 py-3">{c.category_kor}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-right">
        총 {categories.length}개 카테고리
      </p>
    </div>
  );
}
