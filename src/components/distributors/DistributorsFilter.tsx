"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Search, Phone, Mail, Users, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteDistributor } from "@/lib/actions";
import type { Distributor } from "@/types";

interface Props {
  distributors: Distributor[];
  specialties: string[];
}

export function DistributorsFilter({ distributors: initialDistributors, specialties }: Props) {
  const [distributors, setDistributors] = useState<Distributor[]>(initialDistributors);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deleteDistributor(id);
      setDistributors((prev) => prev.filter((v) => v.id !== id));
      setDeletingId(null);
    });
  }

  const filtered = useMemo(() => {
    return distributors.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.company_name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q) ||
        v.contacts.some(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.role.toLowerCase().includes(q)
        );
      const matchSpec = specialty === "all" || v.specialty === specialty;
      return matchSearch && matchSpec;
    });
  }, [distributors, search, specialty]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="업체명, 주소, 담당자 검색..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="전문 분야" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 분야</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length}개 업체
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        ) : (
          filtered.map((v) => (
            <div
              key={v.id}
              className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link
                    href={`/distributors/${v.id}`}
                    className="font-semibold hover:underline"
                  >
                    {v.company_name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{v.specialty}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {v.note && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                  {v.note}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />{v.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />{v.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>담당자 {v.contacts.length}명</span>
                  <span className="text-muted-foreground/50">·</span>
                  {v.contacts.slice(0, 2).map((c) => (
                    <span key={c.id} className="text-foreground">{c.name}({c.role})</span>
                  ))}
                  {v.contacts.length > 2 && (
                    <span>외 {v.contacts.length - 2}명</span>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
                  <Link href={`/distributors/${v.id}`}>
                    상세보기 <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
