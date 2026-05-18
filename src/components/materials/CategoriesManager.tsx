"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MaterialCategory } from "@/types";

interface Props {
  initialCategories: MaterialCategory[];
}

export function CategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<MaterialCategory[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code_prefix: "", category_eng: "", category_kor: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const newCat: MaterialCategory = {
      id: `mc_${Date.now()}`,
      code_prefix: form.code_prefix.toUpperCase().trim(),
      category_eng: form.category_eng.toUpperCase().trim(),
      category_kor: form.category_kor.trim(),
    };
    setCategories((prev) => [...prev, newCat]);
    setForm({ code_prefix: "", category_eng: "", category_kor: "" });
    setErrors({});
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

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

      {/* Add form */}
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
                {errors.code_prefix && (
                  <p className="text-xs text-destructive mt-1">{errors.code_prefix}</p>
                )}
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
                {errors.category_eng && (
                  <p className="text-xs text-destructive mt-1">{errors.category_eng}</p>
                )}
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
                {errors.category_kor && (
                  <p className="text-xs text-destructive mt-1">{errors.category_kor}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>추가</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setErrors({}); }}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-28">코드 접두사</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">영문명</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">한글명</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted-foreground">
                  등록된 카테고리가 없습니다.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
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
