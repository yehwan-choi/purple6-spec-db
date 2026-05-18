"use client";

import { useTransition, useState, useMemo } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortIcon } from "@/components/ui/sort-icon";
import { createDistributorType, deleteDistributorType, updateDistributorType } from "@/lib/actions";
import type { DistributorTypeRecord } from "@/types";

type SortKey = "id" | "label_kor" | "sort_order";
type SortDir = "asc" | "desc";

interface Props {
  initialTypes: DistributorTypeRecord[];
}

export function DistributorTypesManager({ initialTypes }: Props) {
  const [types, setTypes] = useState<DistributorTypeRecord[]>(initialTypes);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: "", label_kor: "", sort_order: "", is_material: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addPending, startAdd] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("sort_order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label_kor: "", sort_order: "", is_material: false });
  const [updatePending, startUpdate] = useTransition();

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = useMemo(() => {
    return [...types].sort((a, b) => {
      let cmp: number;
      if (sortKey === "sort_order") cmp = a.sort_order - b.sort_order;
      else if (sortKey === "id") cmp = a.id.localeCompare(b.id);
      else cmp = a.label_kor.localeCompare(b.label_kor, "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [types, sortKey, sortDir]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.id.trim()) e.id = "필수 입력";
    if (!/^[a-z0-9_]+$/.test(form.id.trim())) e.id = "영문 소문자, 숫자, _ 만 사용 가능";
    if (!form.label_kor.trim()) e.label_kor = "필수 입력";
    if (types.some((t) => t.id === form.id.trim())) e.id = "이미 사용 중인 코드입니다";
    return e;
  }

  function handleAdd() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const data = {
      id: form.id.trim(),
      label_kor: form.label_kor.trim(),
      sort_order: Number(form.sort_order) || (types.length + 1),
      is_material: form.is_material,
    };

    startAdd(async () => {
      const result = await createDistributorType(data);
      if (result?.success) {
        setTypes((prev) => [...prev, data]);
        setForm({ id: "", label_kor: "", sort_order: "", is_material: false });
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
      const result = await deleteDistributorType(id);
      if (result?.success) {
        setTypes((prev) => prev.filter((t) => t.id !== id));
      }
      setDeletingId(null);
    });
  }

  function startEdit(t: DistributorTypeRecord) {
    setEditingId(t.id);
    setEditForm({ label_kor: t.label_kor, sort_order: String(t.sort_order), is_material: t.is_material });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleUpdate(id: string) {
    startUpdate(async () => {
      const data = {
        label_kor: editForm.label_kor.trim(),
        sort_order: Number(editForm.sort_order) || 0,
        is_material: editForm.is_material,
      };
      const result = await updateDistributorType(id, data);
      if (result?.success) {
        setTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
        setEditingId(null);
      }
    });
  }

  const thClass = "flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">업체 구분 관리</h1>
          <p className="text-muted-foreground mt-1">업체 구분 코드와 명칭을 등록·관리합니다</p>
        </div>
        <Button className="gap-2" onClick={() => { setShowForm(true); setErrors({}); }}>
          <Plus className="h-4 w-4" />
          구분 추가
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm">새 업체 구분 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  코드 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="예: construction"
                  value={form.id}
                  onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                  className={errors.id ? "border-destructive" : ""}
                />
                {errors.id && <p className="text-xs text-destructive mt-1">{errors.id}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  한글명 <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="예: 시공업체"
                  value={form.label_kor}
                  onChange={(e) => setForm((f) => ({ ...f, label_kor: e.target.value }))}
                  className={errors.label_kor ? "border-destructive" : ""}
                />
                {errors.label_kor && <p className="text-xs text-destructive mt-1">{errors.label_kor}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">순서</label>
                <Input
                  type="number"
                  placeholder="예: 3"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                />
              </div>
              <div className="flex flex-col justify-center">
                <label className="text-xs text-muted-foreground mb-1.5 block">마감재 업체 여부</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_material}
                    onChange={(e) => setForm((f) => ({ ...f, is_material: e.target.checked }))}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">마감재 업체</span>
                </label>
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
              <th className="px-4 py-3 w-36 text-left">
                <button onClick={() => toggleSort("id")} className={thClass}>
                  코드 <SortIcon active={sortKey === "id"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort("label_kor")} className={thClass}>
                  한글명 <SortIcon active={sortKey === "label_kor"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 w-28 text-center text-xs font-medium text-muted-foreground">
                마감재 업체
              </th>
              <th className="px-4 py-3 w-20 text-center">
                <button onClick={() => toggleSort("sort_order")} className={`${thClass} justify-center`}>
                  순서 <SortIcon active={sortKey === "sort_order"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 w-28 text-right text-xs font-medium text-muted-foreground">
                수정/삭제
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  등록된 업체 구분이 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((t) => {
                const isEditing = editingId === t.id;
                return (
                  <tr key={t.id} className={`border-b last:border-0 transition-colors ${isEditing ? "bg-muted/20" : "hover:bg-muted/30"}`}>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs font-medium">{t.id}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {isEditing ? (
                        <Input
                          value={editForm.label_kor}
                          onChange={(e) => setEditForm((f) => ({ ...f, label_kor: e.target.value }))}
                          className="h-7 text-xs"
                        />
                      ) : (
                        <span className="font-medium">{t.label_kor}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={editForm.is_material}
                          onChange={(e) => setEditForm((f) => ({ ...f, is_material: e.target.checked }))}
                          className="h-4 w-4 rounded"
                        />
                      ) : (
                        <span className={`text-xs ${t.is_material ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {t.is_material ? "✓" : "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.sort_order}
                          onChange={(e) => setEditForm((f) => ({ ...f, sort_order: e.target.value }))}
                          className="h-7 text-xs text-center w-16 mx-auto"
                        />
                      ) : (
                        <span className="text-muted-foreground">{t.sort_order}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-primary hover:text-primary"
                              onClick={() => handleUpdate(t.id)}
                              disabled={updatePending}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground"
                              onClick={cancelEdit}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => startEdit(t)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(t.id)}
                              disabled={deletingId === t.id}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground text-right">
        총 {types.length}개 구분
      </p>
    </>
  );
}
