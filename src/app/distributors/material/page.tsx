import { getDistributors, getDistributorTypes, getAllDistributorCategoryLinks, getMaterialCategories } from "@/lib/data";
import { DistributorsFilter } from "@/components/distributors/DistributorsFilter";
import type { MaterialCategory } from "@/types";

export const metadata = { title: "마감재 업체 | 마감재 DB" };

export default async function MaterialDistributorsPage() {
  const [allDistributors, allTypes, categoryLinks, allCategories] = await Promise.all([
    getDistributors(),
    getDistributorTypes(),
    getAllDistributorCategoryLinks(),
    getMaterialCategories(),
  ]);
  const visibleTypes = allTypes.filter((t) => t.is_material);
  const defaultType = visibleTypes[0]?.id ?? "material";

  const categoryLinkMap = new Map<string, MaterialCategory[]>();
  for (const link of categoryLinks) {
    if (!categoryLinkMap.has(link.distributor_id)) categoryLinkMap.set(link.distributor_id, []);
    categoryLinkMap.get(link.distributor_id)!.push(link.category);
  }

  return (
    <div className="p-8">
      <DistributorsFilter
        distributors={allDistributors}
        distributorTypes={visibleTypes}
        defaultType={defaultType}
        lockModal={true}
        categoryLinkMap={categoryLinkMap}
        allCategories={allCategories}
        pageTitle="마감재 업체"
      />
    </div>
  );
}
