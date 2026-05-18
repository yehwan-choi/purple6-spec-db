import { notFound } from "next/navigation";
import { getDistributors, getDistributorTypes } from "@/lib/data";
import { DistributorsFilter } from "@/components/distributors/DistributorsFilter";

export const metadata = { title: "업체 | 마감재 DB" };

export default async function DistributorsByTypePage({
  params,
}: {
  params: Promise<{ typeId: string }>;
}) {
  const { typeId } = await params;
  const [allDistributors, allTypes] = await Promise.all([
    getDistributors(),
    getDistributorTypes(),
  ]);

  if (!allTypes.some((t) => t.id === typeId)) notFound();

  const isMaterialPage = allTypes
    .filter((t) => t.is_material)
    .some((t) => t.id === typeId);

  const visibleTypes = isMaterialPage
    ? allTypes.filter((t) => t.is_material)
    : allTypes.filter((t) => !t.is_material);

  return (
    <div className="p-8">
      <DistributorsFilter
        distributors={allDistributors}
        distributorTypes={visibleTypes}
        defaultType={typeId}
        lockModal={isMaterialPage}
      />
    </div>
  );
}
