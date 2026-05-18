import { getDistributors, getDistributorTypes } from "@/lib/data";
import { DistributorsFilter } from "@/components/distributors/DistributorsFilter";

export const metadata = { title: "업체 목록 | 마감재 DB" };

export default async function DistributorsPage() {
  const [distributors, distributorTypes] = await Promise.all([
    getDistributors(),
    getDistributorTypes(),
  ]);

  return (
    <div className="p-8">
      <DistributorsFilter distributors={distributors} distributorTypes={distributorTypes} />
    </div>
  );
}
