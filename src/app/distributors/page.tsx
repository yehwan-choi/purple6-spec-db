import { getDistributors } from "@/lib/data";
import { DistributorsFilter } from "@/components/distributors/DistributorsFilter";

export const metadata = { title: "업체 목록 | 마감재 DB" };

export default async function DistributorsPage() {
  const distributors = await getDistributors();
  const specialties = [...new Set(distributors.map((v) => v.specialty).filter(Boolean))].sort();

  return (
    <div className="p-8">
      <DistributorsFilter distributors={distributors} specialties={specialties} />
    </div>
  );
}
