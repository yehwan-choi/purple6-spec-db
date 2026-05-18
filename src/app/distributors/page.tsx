import { getDistributors } from "@/lib/data";
import { DistributorsFilter } from "@/components/distributors/DistributorsFilter";
import { AddDistributorModal } from "@/components/distributors/AddDistributorModal";

export const metadata = { title: "업체 목록 | 마감재 DB" };

export default async function DistributorsPage() {
  const distributors = await getDistributors();
  const specialties = [...new Set(distributors.map((v) => v.specialty))].sort();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">업체</h1>
          <p className="text-muted-foreground mt-1">자재 공급 및 시공 협력 업체 관리</p>
        </div>
        <AddDistributorModal />
      </div>

      <DistributorsFilter distributors={distributors} specialties={specialties} />
    </div>
  );
}
