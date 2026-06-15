"use client";

import { useTransition, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Trash2, Tag, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/ui/phone-input";
import type { Distributor, DistributorContact, DistributorTypeRecord, MaterialCategory } from "@/types";
import { useCanWrite } from "@/components/auth/RoleProvider";

interface ContactRow {
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface Props {
  onSuccess?: (distributor: Distributor) => void;
  defaultType?: string;
  lockType?: boolean;
  distributorTypes: DistributorTypeRecord[];
  allCategories?: MaterialCategory[];
}

export function AddDistributorModal({ onSuccess, defaultType, lockType, distributorTypes, allCategories = [] }: Props) {
  const canWrite = useCanWrite();
  const [open, setOpen] = useState(false);
  const [distributorType, setDistributorType] = useState<string>(defaultType ?? "");
  const [contacts, setContacts] = useState<ContactRow[]>([{ name: "", role: "", phone: "", email: "" }]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function addContact() {
    setContacts((prev) => [...prev, { name: "", role: "", phone: "", email: "" }]);
  }

  function removeContact(idx: number) {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateContact(idx: number, field: keyof ContactRow, value: string) {
    setContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  function resetForm() {
    setDistributorType(defaultType ?? "");
    setContacts([{ name: "", role: "", phone: "", email: "" }]);
    setSelectedCategories([]);
    setError(null);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    const id = crypto.randomUUID();
    formData.set("id", id);
    formData.set("contacts", JSON.stringify(contacts));
    formData.set("category_ids", JSON.stringify(selectedCategories));
    startTransition(async () => {
      const result = await createDistributor(null, formData);
      if (result?.success) {
        const builtContacts: DistributorContact[] = contacts
          .filter((c) => c.name.trim())
          .map((c) => ({
            id: crypto.randomUUID(),
            distributor_id: id,
            name: c.name,
            role: c.role,
            phone: c.phone,
            email: c.email,
          }));
        onSuccess?.({
          id,
          distributor_type: distributorType,
          company_name: (formData.get("company_name") as string) || "",
          address: (formData.get("address") as string) || "",
          note: (formData.get("note") as string) || "",
          homepage: (formData.get("homepage") as string) || null,
          contacts: builtContacts,
        });
        setOpen(false);
        resetForm();
      } else {
        setError(result?.error ?? "오류가 발생했습니다.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={!canWrite}>
          <Plus className="h-4 w-4" />
          업체 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>업체 등록</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 px-6 pb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">업체 구분 *</label>
            <Select
              value={distributorType}
              onValueChange={setDistributorType}
              disabled={!!lockType}
            >
              <SelectTrigger>
                <SelectValue placeholder="구분 선택" />
              </SelectTrigger>
              <SelectContent>
                {distributorTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label_kor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="distributor_type" value={distributorType} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">업체명 *</label>
            <Input name="company_name" placeholder="업체명 입력" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">주소</label>
            <Input name="address" placeholder="주소 입력" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">홈페이지</label>
            <Input name="homepage" placeholder="https://example.com" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">메모</label>
            <textarea
              name="note"
              placeholder="업체 특이사항, 시공 분야 등"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none h-20"
            />
          </div>

          {/* 카테고리 */}
          {allCategories.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">카테고리</label>
              <div className="flex flex-wrap gap-1">
                {allCategories
                  .filter((c) => selectedCategories.includes(c.id))
                  .map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-px text-[10px] font-medium text-primary"
                    >
                      {cat.category_kor}
                      <button type="button" onClick={() => toggleCategory(cat.id)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                <Popover open={categoryPickerOpen} onOpenChange={setCategoryPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-6 gap-1 text-xs px-2">
                      <Tag className="h-3 w-3" />
                      추가
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-0" align="start">
                    <Command>
                      <CommandInput placeholder="카테고리 검색..." className="h-8 text-xs" />
                      <CommandList>
                        <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">결과 없음</CommandEmpty>
                        <CommandGroup>
                          {allCategories.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              value={cat.category_kor}
                              onSelect={() => toggleCategory(cat.id)}
                              className="text-xs"
                            >
                              <Check className={cn("mr-2 h-3.5 w-3.5", selectedCategories.includes(cat.id) ? "opacity-100" : "opacity-0")} />
                              {cat.category_kor}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* 담당자 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">담당자</label>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={addContact}>
                <Plus className="h-3 w-3" />
                담당자 추가
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
                {contacts.map((c, idx) => (
                  <div key={idx} className="space-y-2">
                    {idx > 0 && <div className="border-t pt-3" />}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">담당자 {idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeContact(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-sm text-muted-foreground">이름 *</span>
                        <Input
                          value={c.name}
                          onChange={(e) => updateContact(idx, "name", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-sm text-muted-foreground">직함</span>
                        <Input
                          value={c.role}
                          onChange={(e) => updateContact(idx, "role", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-sm text-muted-foreground">전화번호</span>
                        <PhoneInput
                          value={c.phone}
                          onChange={(v) => updateContact(idx, "phone", v)}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-sm text-muted-foreground">이메일</span>
                        <Input
                          value={c.email}
                          onChange={(e) => updateContact(idx, "email", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>
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
