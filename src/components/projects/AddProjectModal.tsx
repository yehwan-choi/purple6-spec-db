"use client";

import { useTransition, useState } from "react";
import { createProject } from "@/lib/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useCanWrite } from "@/components/auth/RoleProvider";

export function AddProjectModal() {
  const canWrite = useCanWrite();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProject(null, formData);
      if (result?.success) {
        setOpen(false);
      } else {
        setError(result?.error ?? "오류가 발생했습니다.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={!canWrite}>
          <Plus className="h-4 w-4" />
          프로젝트 생성
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로젝트 생성</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 px-6 pb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">프로젝트명 *</label>
            <Input name="project_name" placeholder="프로젝트명 입력" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">클라이언트</label>
              <Input name="project_client" placeholder="클라이언트명" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">연도</label>
              <Input
                name="project_year"
                type="number"
                defaultValue={new Date().getFullYear()}
                min={2000}
                max={2100}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "생성 중..." : "생성"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
