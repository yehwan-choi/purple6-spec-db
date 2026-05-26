"use client";

import { useTransition, useState, useRef, useEffect } from "react";
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
import { CategoryCombobox } from "@/components/materials/CategoryCombobox";
import { Plus, ImageIcon } from "lucide-react";
import type { MaterialCategory } from "@/types";

export function AddMaterialModal({ categories }: { categories: MaterialCategory[] }) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  function handleFileSelect(file: File, fromDrop: boolean) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    if (fromDrop) {
      setDroppedFile(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setDroppedFile(null);
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    const inputFile = formData.get("material_image");
    if (droppedFile && (!(inputFile instanceof File) || inputFile.size === 0)) {
      formData.set("material_image", droppedFile);
    }
    startTransition(async () => {
      const result = await createMaterial(null, formData);
      if (result?.success) {
        setOpen(false);
        setCategoryId("");
        setPreviewUrl(null);
        setDroppedFile(null);
        formRef.current?.reset();
      } else {
        setError(result?.error ?? "오류가 발생했습니다.");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCategoryId("");
      setPreviewUrl(null);
      setDroppedFile(null);
      setError(null);
      formRef.current?.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
        <form ref={formRef} action={handleSubmit} className="space-y-4 px-6 pb-6">
          {/* 이미지 — 최상단 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">이미지</label>
            <div
              className={`w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed transition-colors cursor-pointer flex items-center justify-center bg-muted/40 ${
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith("image/")) handleFileSelect(file, true);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground select-none">
                  <ImageIcon className="h-8 w-8 opacity-40" />
                  <span className="text-xs">클릭하거나 이미지를 드래그하세요</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="material_image"
              accept="image/*"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file, false);
                else { setPreviewUrl(null); setDroppedFile(null); }
              }}
            />
          </div>

          {/* 카테고리 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">카테고리 *</label>
            <CategoryCombobox
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>

          {/* 자재명 */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">자재명 *</label>
            <Input name="material_item" placeholder="자재명 입력" required />
          </div>

          {/* FINISH */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">FINISH</label>
            <Input name="material_finish" placeholder="예: 무광 (미입력 시 -)" />
          </div>

          {/* SIZE */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">SIZE</label>
            <Input name="material_size" placeholder="예: 600x600mm (미입력 시 -)" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
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
