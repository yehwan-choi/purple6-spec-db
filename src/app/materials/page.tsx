import { getMaterials, getMaterialCategories, getMaterialTypeDistributors, getMaterialDistributorNameLinks } from "@/lib/data";
import { MaterialsFilter } from "@/components/materials/MaterialsFilter";
import { AddMaterialModal } from "@/components/materials/AddMaterialModal";

export const metadata = { title: "마감재 라이브러리 | 마감재 DB" };

export default async function MaterialsPage() {
  const [materials, categories, distributors, distributorLinks] = await Promise.all([
    getMaterials(),
    getMaterialCategories(),
    getMaterialTypeDistributors(),
    getMaterialDistributorNameLinks(),
  ]);

  const distributorLinkMap = new Map<string, string[]>();
  for (const link of distributorLinks) {
    if (!distributorLinkMap.has(link.material_id)) distributorLinkMap.set(link.material_id, []);
    distributorLinkMap.get(link.material_id)!.push(link.company_name);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">마감재 라이브러리</h1>
          <p className="text-muted-foreground mt-1">마감재를 등록하고 전체 목록과 상세 정보를 조회할 수 있습니다.</p>
        </div>
        <AddMaterialModal categories={categories} distributors={distributors} />
      </div>

      <MaterialsFilter
        materials={materials}
        categories={categories}
        distributorLinkMap={distributorLinkMap}
      />
    </div>
  );
}
