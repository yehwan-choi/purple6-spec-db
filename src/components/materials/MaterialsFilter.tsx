"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { CAT1_LIST, CAT2_MAP } from "@/types";
import type { Material, Brand } from "@/types";

interface Props {
  materials: Material[];
  brands: Brand[];
}

const cat1Colors: Record<string, string> = {
  Material: "bg-blue-50 text-blue-700 border-blue-200",
  Sanitary: "bg-purple-50 text-purple-700 border-purple-200",
  Lighting: "bg-amber-50 text-amber-700 border-amber-200",
  Hardware: "bg-green-50 text-green-700 border-green-200",
};

export function MaterialsFilter({ materials, brands }: Props) {
  const [search, setSearch] = useState("");
  const [cat1, setCat1] = useState("all");
  const [cat2, setCat2] = useState("all");

  const brandMap = useMemo(
    () => Object.fromEntries(brands.map((b) => [b.id, b])),
    [brands]
  );

  const cat2Options = cat1 !== "all" ? CAT2_MAP[cat1] ?? [] : [];

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.model_number.toLowerCase().includes(q) ||
        (brandMap[m.brand_id]?.brand_name ?? "").toLowerCase().includes(q);
      const matchCat1 = cat1 === "all" || m.cat_1 === cat1;
      const matchCat2 = cat2 === "all" || m.cat_2 === cat2;
      return matchSearch && matchCat1 && matchCat2;
    });
  }, [materials, search, cat1, cat2, brandMap]);

  function handleCat1Change(val: string) {
    setCat1(val);
    setCat2("all");
  }

  return (
    <>
      {/* Category Tabs */}
      <Tabs value={cat1} onValueChange={handleCat1Change} className="mb-0">
        <TabsList variant="line">
          <TabsTrigger value="all">전체</TabsTrigger>
          {CAT1_LIST.map((c) => (
            <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mt-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="자재명, 모델번호, 제조사 검색..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={cat2}
          onValueChange={setCat2}
          disabled={cat1 === "all"}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="소분류" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {cat2Options.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length}개 결과
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-10">#</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">자재명</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">제조사</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">카테고리</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">컬러 / 마감</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">단위</th>
              <th className="text-right font-medium text-muted-foreground px-4 py-3">단가</th>
              <th className="text-center font-medium text-muted-foreground px-4 py-3">업체수</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-muted-foreground">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((m, idx) => {
                const brand = brandMap[m.brand_id];
                const vendorCount = m.vendors.length;
                return (
                  <tr
                    key={m.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{m.model_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{brand?.brand_name ?? "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium w-fit ${cat1Colors[m.cat_1] ?? ""}`}>
                          {m.cat_1}
                        </span>
                        <span className="text-xs text-muted-foreground">{m.cat_2}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{m.color}</div>
                      <div className="text-xs text-muted-foreground">{m.finish}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{m.unit}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {formatPrice(m.price_per_unit)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={vendorCount > 1 ? "info" : "secondary"}>
                        {vendorCount}개사
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/materials/${m.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
