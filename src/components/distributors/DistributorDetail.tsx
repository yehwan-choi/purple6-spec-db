"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Phone, Mail, ExternalLink,
  Pencil, Check, X, Plus, Trash2, Search,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem,
} from "@/components/ui/command";
import {
  createDistributorContact,
  updateDistributorContact,
  deleteDistributorContact,
  addMaterialToDistributor,
  removeMaterialFromDistributor,
  addProjectToDistributor,
  removeProjectFromDistributor,
  updateDistributorInfo,
} from "@/lib/actions";
import type { Distributor, DistributorContact, DistributorTypeRecord, Material, MaterialCategory, Project } from "@/types";

const PAGE_SIZE = 5;

interface Props {
  distributor: Distributor;
  initialMaterials: Material[];
  initialProjects: Project[];
  allMaterials: Material[];
  allProjects: Project[];
  categoryMap: Map<string, MaterialCategory>;
  distributorTypes: DistributorTypeRecord[];
}

export function DistributorDetail({
  distributor,
  initialMaterials,
  initialProjects,
  allMaterials,
  allProjects,
  categoryMap,
  distributorTypes,
}: Props) {
  const [, startTransition] = useTransition();
  const [isPendingInfo, startInfoTransition] = useTransition();

  // ── 비고 / 홈페이지 ──────────────────────────────────
  const [note, setNote] = useState(distributor.note ?? "");
  const [homepage, setHomepage] = useState(distributor.homepage ?? "");
  const [editingInfo, setEditingInfo] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [homepageInput, setHomepageInput] = useState("");
  const [infoError, setInfoError] = useState<string | null>(null);

  function startEditInfo() {
    setNoteInput(note);
    setHomepageInput(homepage);
    setInfoError(null);
    setEditingInfo(true);
  }

  function handleSaveInfo() {
    setInfoError(null);
    startInfoTransition(async () => {
      const result = await updateDistributorInfo(distributor.id, { note: noteInput, homepage: homepageInput });
      if (result?.success) {
        setNote(noteInput);
        setHomepage(homepageInput);
        setEditingInfo(false);
      } else {
        setInfoError(result?.error ?? "저장에 실패했습니다.");
      }
    });
  }

  // ── 담당자 ───────────────────────────────────────────
  const [contacts, setContacts] = useState<DistributorContact[]>(distributor.contacts);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", phone: "", email: "" });
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", role: "", phone: "", email: "" });

  function closeAddingContact() {
    setAddingContact(false);
    setNewContact({ name: "", role: "", phone: "", email: "" });
  }

  // ── 마감재 ───────────────────────────────────────────
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialPage, setMaterialPage] = useState(0);
  const [materialPickerOpen, setMaterialPickerOpen] = useState(false);

  // ── 프로젝트 ─────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectPage, setProjectPage] = useState(0);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);

  // ── 담당자 handlers ──────────────────────────────────
  function startEditContact(c: DistributorContact) {
    setEditingContactId(c.id);
    setEditForm({ name: c.name, role: c.role ?? "", phone: c.phone ?? "", email: c.email ?? "" });
  }

  function handleSaveContact(id: string) {
    startTransition(async () => {
      const result = await updateDistributorContact(id, editForm);
      if (result?.success) {
        setContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...editForm } : c));
        setEditingContactId(null);
      }
    });
  }

  function handleDeleteContact(id: string) {
    startTransition(async () => {
      const result = await deleteDistributorContact(id);
      if (result?.success) setContacts((prev) => prev.filter((c) => c.id !== id));
    });
  }

  function handleAddContact() {
    if (!newContact.name.trim()) return;
    const id = crypto.randomUUID();
    startTransition(async () => {
      const result = await createDistributorContact(distributor.id, id, newContact);
      if (result?.success) {
        setContacts((prev) => [...prev, { id, distributor_id: distributor.id, ...newContact }]);
        setNewContact({ name: "", role: "", phone: "", email: "" });
        setAddingContact(false);
      }
    });
  }

  // ── 마감재 helpers & handlers ────────────────────────
  const linkedMaterialIds = useMemo(() => new Set(materials.map((m) => m.id)), [materials]);

  const filteredMaterials = useMemo(() => {
    const q = materialSearch.toLowerCase();
    return materials.filter((m) => !q || m.material_item.toLowerCase().includes(q));
  }, [materials, materialSearch]);

  const totalMaterialPages = Math.ceil(filteredMaterials.length / PAGE_SIZE) || 1;
  const pagedMaterials = filteredMaterials.slice(materialPage * PAGE_SIZE, (materialPage + 1) * PAGE_SIZE);

  const availableMaterials = useMemo(
    () => allMaterials.filter((m) => !linkedMaterialIds.has(m.id)),
    [allMaterials, linkedMaterialIds]
  );

  function handleAddMaterial(m: Material) {
    startTransition(async () => {
      const result = await addMaterialToDistributor(distributor.id, m.id);
      if (result?.success) {
        setMaterials((prev) => [...prev, m]);
        setMaterialPickerOpen(false);
      }
    });
  }

  function handleRemoveMaterial(materialId: string) {
    startTransition(async () => {
      const result = await removeMaterialFromDistributor(distributor.id, materialId);
      if (result?.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== materialId));
        setMaterialPage((p) => {
          const newFiltered = filteredMaterials.filter((m) => m.id !== materialId);
          const maxPage = Math.max(0, Math.ceil(newFiltered.length / PAGE_SIZE) - 1);
          return Math.min(p, maxPage);
        });
      }
    });
  }

  // ── 프로젝트 helpers & handlers ──────────────────────
  const linkedProjectIds = useMemo(() => new Set(projects.map((p) => p.id)), [projects]);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.toLowerCase();
    return projects.filter(
      (p) => !q || p.project_name.toLowerCase().includes(q) || (p.project_client ?? "").toLowerCase().includes(q)
    );
  }, [projects, projectSearch]);

  const totalProjectPages = Math.ceil(filteredProjects.length / PAGE_SIZE) || 1;
  const pagedProjects = filteredProjects.slice(projectPage * PAGE_SIZE, (projectPage + 1) * PAGE_SIZE);

  const availableProjects = useMemo(
    () => allProjects.filter((p) => !linkedProjectIds.has(p.id)),
    [allProjects, linkedProjectIds]
  );

  function handleAddProject(p: Project) {
    startTransition(async () => {
      const result = await addProjectToDistributor(distributor.id, p.id);
      if (result?.success) {
        setProjects((prev) => [...prev, p]);
        setProjectPickerOpen(false);
      }
    });
  }

  function handleRemoveProject(projectId: string) {
    startTransition(async () => {
      const result = await removeProjectFromDistributor(distributor.id, projectId);
      if (result?.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setProjectPage((p) => {
          const newFiltered = filteredProjects.filter((pr) => pr.id !== projectId);
          const maxPage = Math.max(0, Math.ceil(newFiltered.length / PAGE_SIZE) - 1);
          return Math.min(p, maxPage);
        });
      }
    });
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className="p-8 space-y-10">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" className="-ml-2 gap-2 text-muted-foreground" asChild>
        <Link href="/distributors">
          <ArrowLeft className="h-4 w-4" />
          업체 목록으로
        </Link>
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline">
            {distributorTypes.find((t) => t.id === distributor.distributor_type)?.label_kor ?? distributor.distributor_type}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{distributor.company_name}</h1>
        {distributor.address && (
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {distributor.address}
          </p>
        )}
      </div>

      {/* ── 비고 / 홈페이지 ──────────────────────────────── */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">정보</h2>
          {!editingInfo ? (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={startEditInfo}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary" onClick={handleSaveInfo} disabled={isPendingInfo}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => { setEditingInfo(false); setInfoError(null); }} disabled={isPendingInfo}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* 비고 */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">비고</label>
          {editingInfo ? (
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="업체 특이사항, 시공 분야 등"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none h-20"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{note || "-"}</p>
          )}
        </div>

        {/* 홈페이지 */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">홈페이지</label>
          {editingInfo ? (
            <Input
              value={homepageInput}
              onChange={(e) => setHomepageInput(e.target.value)}
              placeholder="https://example.com"
              className="h-8 text-sm"
            />
          ) : homepage ? (
            <a
              href={homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {homepage}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">-</p>
          )}
        </div>

        {infoError && <p className="text-xs text-destructive">{infoError}</p>}
        {isPendingInfo && <p className="text-xs text-muted-foreground">저장 중...</p>}
      </div>

      {/* ── 담당자 ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            담당자 ({contacts.length}명)
          </h2>
          <div className="flex gap-2">
            {!addingContact ? (
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => setAddingContact(true)}>
                <Plus className="h-3 w-3" /> 담당자 추가
              </Button>
            ) : (
              <Button variant="default" size="sm" className="h-7 text-xs" onClick={closeAddingContact}>
                완료
              </Button>
            )}
          </div>
        </div>
        <div className="border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">이름</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">직함</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">전화</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">이메일</th>
                <th className="px-3 py-2 w-20 text-right text-xs font-medium text-muted-foreground">수정/삭제</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 && !addingContact && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-sm text-muted-foreground">
                    등록된 담당자가 없습니다.
                  </td>
                </tr>
              )}
              {contacts.map((c) => {
                const isEditing = editingContactId === c.id;
                return (
                  <tr key={c.id} className={`border-b last:border-0 transition-colors ${isEditing ? "bg-muted/20" : "hover:bg-muted/20"}`}>
                    <td className="px-3 py-2">
                      {isEditing
                        ? <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="h-7 text-xs" />
                        : <span className="font-medium">{c.name}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? <Input value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} className="h-7 text-xs" />
                        : <span className="text-muted-foreground">{c.role || "-"}</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? <PhoneInput value={editForm.phone} onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))} compact />
                        : c.phone
                          ? <span className="flex items-center gap-1 text-muted-foreground text-xs"><Phone className="h-3.5 w-3.5 shrink-0" />{c.phone}</span>
                          : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? <Input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className="h-7 text-xs" />
                        : c.email
                          ? <span className="flex items-center gap-1 text-muted-foreground text-xs"><Mail className="h-3.5 w-3.5 shrink-0" />{c.email}</span>
                          : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary" onClick={() => handleSaveContact(c.id)}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingContactId(null)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => startEditContact(c)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteContact(c.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* 추가 행 */}
              {addingContact && (
                <tr className="border-t bg-muted/10">
                  <td className="px-3 py-2">
                    <Input value={newContact.name} onChange={(e) => setNewContact((f) => ({ ...f, name: e.target.value }))} placeholder="이름 *" className="h-7 text-xs" />
                  </td>
                  <td className="px-3 py-2">
                    <Input value={newContact.role} onChange={(e) => setNewContact((f) => ({ ...f, role: e.target.value }))} placeholder="역할" className="h-7 text-xs" />
                  </td>
                  <td className="px-3 py-2">
                    <PhoneInput value={newContact.phone} onChange={(v) => setNewContact((f) => ({ ...f, phone: v }))} compact />
                  </td>
                  <td className="px-3 py-2">
                    <Input value={newContact.email} onChange={(e) => setNewContact((f) => ({ ...f, email: e.target.value }))} placeholder="이메일" className="h-7 text-xs" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary" onClick={handleAddContact}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={closeAddingContact}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 취급 마감재 ──────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            취급 마감재 ({materials.length}개)
          </h2>
          <Popover open={materialPickerOpen} onOpenChange={setMaterialPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <Plus className="h-3 w-3" /> 마감재 추가
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <Command>
                <CommandInput placeholder="마감재 검색..." />
                <CommandList>
                  <CommandEmpty>검색 결과 없음</CommandEmpty>
                  <CommandGroup>
                    {availableMaterials.map((m) => (
                      <CommandItem
                        key={m.id}
                        value={`${m.material_item} ${m.material_finish ?? ""}`}
                        onSelect={() => handleAddMaterial(m)}
                      >
                        <span>{m.material_item}</span>
                        {m.material_finish && (
                          <span className="ml-1 text-muted-foreground text-xs">({m.material_finish})</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="자재명 검색..."
            className="pl-8 h-8 text-sm"
            value={materialSearch}
            onChange={(e) => { setMaterialSearch(e.target.value); setMaterialPage(0); }}
          />
        </div>

        <div className="border-t">
          {filteredMaterials.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              {materials.length === 0 ? "연결된 마감재가 없습니다." : "검색 결과가 없습니다."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">자재명</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">카테고리</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">마감</th>
                  <th className="px-3 py-2 w-20 text-right text-xs font-medium text-muted-foreground">링크/삭제</th>
                </tr>
              </thead>
              <tbody>
                {pagedMaterials.map((m) => {
                  const cat = categoryMap.get(m.category_id);
                  return (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2.5 font-medium">{m.material_item}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">
                        {cat ? `${cat.category_kor} (${cat.category_eng})` : "-"}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{m.material_finish || "-"}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <Link href={`/materials/${m.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveMaterial(m.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalMaterialPages > 1 && (
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{materialPage + 1} / {totalMaterialPages} 페이지 ({filteredMaterials.length}개)</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-6 w-6" disabled={materialPage === 0} onClick={() => setMaterialPage((p) => p - 1)}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="h-6 w-6" disabled={materialPage >= totalMaterialPages - 1} onClick={() => setMaterialPage((p) => p + 1)}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 참여 프로젝트 ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            참여 프로젝트 ({projects.length})
          </h2>
          <Popover open={projectPickerOpen} onOpenChange={setProjectPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <Plus className="h-3 w-3" /> 프로젝트 추가
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <Command>
                <CommandInput placeholder="프로젝트 검색..." />
                <CommandList>
                  <CommandEmpty>검색 결과 없음</CommandEmpty>
                  <CommandGroup>
                    {availableProjects.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={`${p.project_name} ${p.project_client ?? ""} ${p.project_year ?? ""}`}
                        onSelect={() => handleAddProject(p)}
                      >
                        <span>{p.project_name}</span>
                        {p.project_year && (
                          <span className="ml-1 text-muted-foreground text-xs">{p.project_year}</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="프로젝트명, 클라이언트 검색..."
            className="pl-8 h-8 text-sm"
            value={projectSearch}
            onChange={(e) => { setProjectSearch(e.target.value); setProjectPage(0); }}
          />
        </div>

        <div className="border-t">
          {filteredProjects.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              {projects.length === 0 ? "참여한 프로젝트가 없습니다." : "검색 결과가 없습니다."}
            </p>
          ) : (
            <div>
              {pagedProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2.5 border-b last:border-0 hover:bg-muted/20 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{p.project_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{p.project_client} · {p.project_year}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <Link href={`/projects/${p.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveProject(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalProjectPages > 1 && (
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{projectPage + 1} / {totalProjectPages} 페이지 ({filteredProjects.length}개)</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-6 w-6" disabled={projectPage === 0} onClick={() => setProjectPage((p) => p - 1)}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="h-6 w-6" disabled={projectPage >= totalProjectPages - 1} onClick={() => setProjectPage((p) => p + 1)}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
