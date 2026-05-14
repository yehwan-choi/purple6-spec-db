import { getMaterials, getData } from "@/lib/data";
import { MaterialsFilter } from "@/components/materials/MaterialsFilter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = { title: "마감재 목록 | 마감재 DB" };

export default function MaterialsPage() {
  const materials = getMaterials();
  const data = getData();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">마감재</h1>
          <p className="text-muted-foreground mt-1">등록된 자재 전체 목록 및 상세 정보</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          자재 등록
        </Button>
      </div>

      <MaterialsFilter
        materials={materials}
        brands={data.brands}
      />
    </div>
  );
}
