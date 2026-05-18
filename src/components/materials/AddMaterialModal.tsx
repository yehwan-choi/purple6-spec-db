"use client";

import { useActionState, useEffect, useState } from "react";
import { createMaterial } from "@/lib/actions";
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
import { Plus } from "lucide-react";
import type { MaterialCategory } from "@/types";

export function AddMaterialModal({ categories }: { categories: MaterialCategory[] }) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [state, formAction, pending] = useActionState(createMaterial, null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setCategoryId("");
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          자재 등록
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>마감재 등록</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 px-6 pb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">카테고리 *</label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
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
            <input type="hidden" name="category_id" value={categoryId} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">자재 코드 *</label>
              <Input name="material_code" placeholder="예: PA-01" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">마감 처리</label>
              <Input name="material_finish" placeholder="예: 무광" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">자재명 *</label>
            <Input name="material_item" placeholder="자재명 입력" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">크기</label>
            <Input name="material_size" placeholder="예: 600x600mm" />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={pending || !categoryId}>
              {pending ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
