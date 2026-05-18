"use client";

import { useActionState, useEffect, useState } from "react";
import { createDistributor } from "@/lib/actions";
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

export function AddDistributorModal() {
  const [open, setOpen] = useState(false);
  const [distributorType, setDistributorType] = useState<string>("");
  const [state, formAction, pending] = useActionState(createDistributor, null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setDistributorType("");
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          업체 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>업체 등록</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">업체 구분 *</label>
              <Select
                value={distributorType}
                onValueChange={setDistributorType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="구분 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">마감재 업체</SelectItem>
                  <SelectItem value="other">기타 업체</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="distributor_type" value={distributorType} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">전문 분야</label>
              <Input name="specialty" placeholder="예: Paint, Tile" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">업체명 *</label>
            <Input name="company_name" placeholder="업체명 입력" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">주소</label>
            <Input name="address" placeholder="주소 입력" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">전화</label>
              <Input name="phone" placeholder="02-0000-0000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">이메일</label>
              <Input name="email" type="email" placeholder="example@co.kr" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">메모</label>
            <textarea
              name="note"
              placeholder="업체 특이사항, 시공 분야 등"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none h-20"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={pending || !distributorType}>
              {pending ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
