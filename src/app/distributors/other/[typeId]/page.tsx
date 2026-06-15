import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getDistributors,
  getDistributorTypes,
  getAllDistributorCategoryLinks,
  getMaterialCategories,
} from "@/lib/data";
import { DistributorsFilter } from "@/components/distributors/DistributorsFilter";
import type { MaterialCategory } from "@/types";

interface Props {
  params: Promise<{ typeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { typeId } = await params;
  const types = await getDistributorTypes();
  const type = types.find((t) => t.id === typeId && !t.is_material);
  return { title: `${type?.label_kor ?? "전문 업체"} | 마감재 DB` };
}

export default async function OtherDistributorTypePage({ params }: Props) {
  const { typeId } = await params;
  const [allDistributors, allTypes, categoryLinks, allCategories] = await Promise.all([
    getDistributors(),
    getDistributorTypes(),
    getAllDistributorCategoryLinks(),
    getMaterialCategories(),
  ]);

  const currentType = allTypes.find((t) => t.id === typeId && !t.is_material);
  if (!currentType) notFound();

  const categoryLinkMap = new Map<string, MaterialCategory[]>();
  for (const link of categoryLinks) {
    if (!categoryLinkMap.has(link.distributor_id)) categoryLinkMap.set(link.distributor_id, []);
    categoryLinkMap.get(link.distributor_id)!.push(link.category);
  }

  return (
    <div className="p-8">
      <DistributorsFilter
        distributors={allDistributors}
        distributorTypes={[currentType]}
        defaultType={typeId}
        lockModal={false}
        categoryLinkMap={categoryLinkMap}
        allCategories={allCategories}
      />
    </div>
  );
}
