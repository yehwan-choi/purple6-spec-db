import { notFound } from "next/navigation";
import {
  getDistributorById,
  getDistributorTypes,
  getMaterialsForDistributor,
  getMaterialCategories,
  getRelatedProjectsForDistributor,
  getMaterials,
} from "@/lib/data";
import { DistributorDetail } from "@/components/distributors/DistributorDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DistributorDetailPage({ params }: Props) {
  const { id } = await params;
  const [distributor, materials, relatedProjects, categories, allMaterials, distributorTypes] =
    await Promise.all([
      getDistributorById(id),
      getMaterialsForDistributor(id),
      getRelatedProjectsForDistributor(id),
      getMaterialCategories(),
      getMaterials(),
      getDistributorTypes(),
    ]);
  if (!distributor) notFound();

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <DistributorDetail
      distributor={distributor}
      initialMaterials={materials}
      initialProjects={relatedProjects}
      allMaterials={allMaterials}
      categoryMap={categoryMap}
      distributorTypes={distributorTypes}
    />
  );
}
