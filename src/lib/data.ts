import { supabase } from "./supabase";
import type { Material, MaterialCategory, Distributor, DistributorTypeRecord, Project, ProjectSpec, MaterialDistributorLink } from "@/types";

export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase.from("materials").select("*").order("material_item");
  if (error) throw error;
  return data;
}

export async function getMaterialById(id: string): Promise<Material | null> {
  const { data, error } = await supabase.from("materials").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getMaterialCategories(): Promise<MaterialCategory[]> {
  const { data, error } = await supabase.from("material_categories").select("*").order("category_eng");
  if (error) throw error;
  return data;
}

export async function getMaterialCategoryById(id: string): Promise<MaterialCategory | null> {
  const { data, error } = await supabase.from("material_categories").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getDistributorTypes(): Promise<DistributorTypeRecord[]> {
  const { data, error } = await supabase.from("distributor_types").select("*").order("sort_order");
  if (error) throw error;
  return data as DistributorTypeRecord[];
}

export async function getDistributors(): Promise<Distributor[]> {
  const { data, error } = await supabase
    .from("distributors")
    .select("*, contacts:distributor_contacts(*)")
    .order("company_name");
  if (error) throw error;
  return data as Distributor[];
}

export async function getDistributorById(id: string): Promise<Distributor | null> {
  const { data, error } = await supabase
    .from("distributors")
    .select("*, contacts:distributor_contacts(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Distributor;
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("project_year", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProjectsByStatus(status: "draft" | "completed"): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", status)
    .order("project_year", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getDistributorsForMaterial(materialId: string): Promise<Distributor[]> {
  const { data, error } = await supabase
    .from("material_distributor_links")
    .select("distributor:distributors(*, contacts:distributor_contacts(*))")
    .eq("material_id", materialId);
  if (error) throw error;
  return (data.map((row) => row.distributor).filter(Boolean)) as unknown as Distributor[];
}

export async function getMaterialsForDistributor(distributorId: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from("material_distributor_links")
    .select("material:materials(*)")
    .eq("distributor_id", distributorId);
  if (error) throw error;
  return (data.map((row) => row.material).filter(Boolean)) as unknown as Material[];
}

export async function getMaterialDistributorLinks(): Promise<MaterialDistributorLink[]> {
  const { data, error } = await supabase.from("material_distributor_links").select("*");
  if (error) throw error;
  return data;
}

export async function getAllProjectSpecs(): Promise<ProjectSpec[]> {
  const { data, error } = await supabase.from("project_specs").select("*");
  if (error) throw error;
  return data;
}

// 프로젝트 상세 페이지: specs + 중첩된 material(category 포함) + distributor를 한 번에 조회
export async function getProjectSpecsWithDetails(projectId: string) {
  const { data, error } = await supabase
    .from("project_specs")
    .select(`
      *,
      material:materials(*, category:material_categories(*)),
      distributor:distributors(id, company_name)
    `)
    .eq("project_id", projectId);
  if (error) throw error;
  return data as Array<
    ProjectSpec & {
      material: (Material & { category: MaterialCategory | null }) | null;
      distributor: Pick<Distributor, "id" | "company_name"> | null;
    }
  >;
}

// 마감재 상세 페이지: 연관 프로젝트 조회
export async function getProjectSpecsWithProjectForMaterial(materialId: string) {
  const { data, error } = await supabase
    .from("project_specs")
    .select("*, project:projects(*)")
    .eq("material_id", materialId);
  if (error) throw error;
  return data as Array<ProjectSpec & { project: Project | null }>;
}

// 업체 상세 페이지: 연관 프로젝트 조회 (중복 제거)
export async function getRelatedProjectsForDistributor(distributorId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("project_specs")
    .select("project:projects(*)")
    .eq("distributor_id", distributorId);
  if (error) throw error;
  const seen = new Set<string>();
  return (data.map((row) => row.project).filter(Boolean) as unknown as Project[]).filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}
