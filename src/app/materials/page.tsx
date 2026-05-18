import { getMaterials, getMaterialCategories } from "@/lib/data";
import { MaterialsFilter } from "@/components/materials/MaterialsFilter";
import { AddMaterialModal } from "@/components/materials/AddMaterialModal";

export const metadata = { title: "마감재 등록 | 마감재 DB" };

export default async function MaterialsPage() {
  const [materials, categories] = await Promise.all([
    getMaterials(),
    getMaterialCategories(),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">마감재 등록</h1>
          <p className="text-muted-foreground mt-1">등록된 자재 전체 목록 및 상세 정보</p>
        </div>
        <AddMaterialModal categories={categories} />
      </div>

      <MaterialsFilter
        materials={materials}
        categories={categories}
      />
    </div>
  );
}
