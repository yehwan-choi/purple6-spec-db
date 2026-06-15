"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProjectStatus } from "@/lib/actions";
import type { Project } from "@/types";
import { useCanWrite } from "@/components/auth/RoleProvider";

interface Props {
  project: Pick<Project, "id" | "status">;
}

export function ProjectStatusToggle({ project }: Props) {
  const canWrite = useCanWrite();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isDraft = project.status === "draft";

  function handleToggle() {
    const nextStatus = isDraft ? "completed" : "draft";
    setError(null);
    startTransition(async () => {
      const result = await updateProjectStatus(project.id, nextStatus);
      if (result && !result.success) {
        setError(result.error ?? "상태 변경에 실패했습니다.");
        return;
      }
      router.push(nextStatus === "completed" ? "/projects/completed" : "/projects/draft");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={isDraft ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={handleToggle}
        disabled={!canWrite || isPending}
      >
        {isDraft ? (
          <>
            <CheckCircle className="h-4 w-4" />
            준공 처리
          </>
        ) : (
          <>
            <RotateCcw className="h-4 w-4" />
            신규로 되돌리기
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
