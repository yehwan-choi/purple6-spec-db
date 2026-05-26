export interface MaterialCategory {
  id: string;
  category_eng: string;
  category_kor: string;
  code_prefix: string;
}

export interface Material {
  id: string;
  category_id: string;
  material_item: string;
  material_finish: string;
  material_size: string;
  material_image: string | null;
}

export interface DistributorContact {
  id: string;
  distributor_id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export type DistributorType = string;

export interface DistributorTypeRecord {
  id: string;
  label_kor: string;
  sort_order: number;
  is_material: boolean;
}

export interface Distributor {
  id: string;
  distributor_type: string;
  company_name: string;
  address: string;
  note: string;
  homepage: string | null;
  contacts: DistributorContact[];
}

export interface MaterialDistributorLink {
  material_id: string;
  distributor_id: string;
}

export interface DistributorCategoryLink {
  distributor_id: string;
  category_id: string;
}

export interface Project {
  id: string;
  project_name: string;
  project_client: string;
  project_year: number;
  status: "draft" | "completed";
}

export interface ProjectSpec {
  id: string;
  project_id: string;
  material_id: string;
  distributor_id: string;
  memo: string;
  code_suffix: string;
  contact_id: string | null;
  quantity: string;
  area: string;
  location: string;
  description: string;
  price: string;
  delivery: string;
}
