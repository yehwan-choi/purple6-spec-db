import { getDistributorTypes } from "@/lib/data";
import { DistributorTypesManager } from "@/components/distributors/DistributorTypesManager";

export const metadata = { title: "업체 구분 관리 | 마감재 DB" };

export default async function DistributorTypesPage() {
  const types = await getDistributorTypes();
  return (
    <div className="p-8">
      <DistributorTypesManager initialTypes={types} />
    </div>
  );
}
