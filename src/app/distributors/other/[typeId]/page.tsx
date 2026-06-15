import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDistributors, getDistributorTypes } from "@/lib/data";
import { DistributorsFilter } from "@/components/distributors/DistributorsFilter";

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
  const [allDistributors, allTypes] = await Promise.all([
    getDistributors(),
    getDistributorTypes(),
  ]);

  const currentType = allTypes.find((t) => t.id === typeId && !t.is_material);
  if (!currentType) notFound();

  return (
    <div className="p-8">
      <DistributorsFilter
        distributors={allDistributors}
        distributorTypes={[currentType]}
        defaultType={typeId}
        lockModal={true}
        pageTitle={currentType.label_kor}
      />
    </div>
  );
}
