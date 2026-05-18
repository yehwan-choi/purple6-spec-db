"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/actions";

export function DeleteProjectButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      await deleteProject(id);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleClick}
      disabled={pending}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
