import { redirect } from "next/navigation";
import { getDistributorTypes } from "@/lib/data";

export const metadata = { title: "전문 업체 | 마감재 DB" };

export default async function OtherDistributorsPage() {
  const types = await getDistributorTypes();
  const first = types.find((t) => !t.is_material);
  if (first) redirect(`/distributors/other/${first.id}`);
  return (
    <div className="p-8 text-muted-foreground text-sm">
      등록된 전문 업체 구분이 없습니다.
    </div>
  );
}
