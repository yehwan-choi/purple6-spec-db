"use client";

import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addProjectSpec } from "@/lib/actions";
import type { Material, Distributor, MaterialDistributorLink } from "@/types";

interface Props {
  projectId: string;
  materials: Material[];
  distributors: Distributor[];
  links: MaterialDistributorLink[];
  onAdded: () => void;
}

export function AddSpecModal({ projectId, materials, distributors, links, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedMaterial = materials.find((m) => m.id === materialId);

  const linkedDistributorIds = links
    .filter((l) => l.material_id === materialId)
    .map((l) => l.distributor_id);
  const linkedDistributors = distributors.filter((d) =>
    linkedDistributorIds.includes(d.id)
  );

  function handleMaterialSelect(id: string) {
    setMaterialId(id);
    setDistributorId(null);
    setComboOpen(false);
  }

  function handleSubmit() {
    if (!materialId) { setError("자재를 선택해주세요."); return; }
    if (!distributorId) { setError("업체를 선택해주세요."); return; }
    setError(null);
    startTransition(async () => {
      const result = await addProjectSpec(projectId, {
        material_id: materialId,
        distributor_id: distributorId,
        memo,
      });
      if (result?.success) {
        resetForm();
        setOpen(false);
        onAdded();
      } else {
        setError(result?.error ?? "오류가 발생했습니다.");
      }
    });
  }

  function resetForm() {
    setMaterialId(null);
    setDistributorId(null);
    setMemo("");
    setError(null);
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          스펙 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>스펙 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">자재 *</label>
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedMaterial ? selectedMaterial.material_item : "자재를 검색하세요"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="자재명 검색..." />
                  <CommandList>
                    <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                    <CommandGroup>
                      {materials.map((m) => (
                        <CommandItem
                          key={m.id}
                          value={`${m.material_item} ${m.material_finish ?? ""} ${m.material_size ?? ""}`}
                          onSelect={() => handleMaterialSelect(m.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              materialId === m.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <div className="font-medium">{m.material_item}</div>
                            <div className="text-xs text-muted-foreground">
                              {[m.material_finish, m.material_size].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">업체 *</label>
            {!materialId ? (
              <p className="text-sm text-muted-foreground py-1.5">자재를 먼저 선택해주세요.</p>
            ) : linkedDistributors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-1.5">연결된 업체가 없습니다. 마감재 DB에서 업체를 연결해주세요.</p>
            ) : (
              <Select value={distributorId ?? ""} onValueChange={setDistributorId}>
                <SelectTrigger>
                  <SelectValue placeholder="업체를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {linkedDistributors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">메모</label>
            <Input
              placeholder="메모 입력 (선택사항)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={pending || !materialId || !distributorId}
            >
              {pending ? "추가 중..." : "추가"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
