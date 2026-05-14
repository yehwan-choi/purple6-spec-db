export interface Brand {
  id: string;
  brand_name: string;
  website: string;
}

export interface Material {
  id: string;
  brand_id: string;
  name: string;
  model_number: string;
  cat_1: "Material" | "Sanitary" | "Lighting" | "Hardware";
  cat_2: string;
  thumb_url: string | null;
  color: string;
  finish: string;
  unit: string;
  price_per_unit: number;
  vendors: string[];
}

export interface VendorContact {
  id: string;
  vendor_id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface Vendor {
  id: string;
  company_name: string;
  specialty: string;
  address: string;
  phone: string;
  email: string;
  note: string;
  contacts: VendorContact[];
}

export interface MaterialVendorLink {
  material_id: string;
  vendor_id: string;
}

export type ProjectStatus = "pending" | "in_progress" | "completed";

export interface Project {
  id: string;
  project_name: string;
  client_name: string;
  status: ProjectStatus;
  address: string;
  area_sqm: number;
  start_date: string;
  end_date: string;
}

export interface ProjectSpec {
  id: string;
  project_id: string;
  material_id: string;
  vendor_id: string;
  memo: string;
}

export interface DummyData {
  brands: Brand[];
  materials: Material[];
  vendors: Vendor[];
  material_vendor_links: MaterialVendorLink[];
  projects: Project[];
  project_specs: ProjectSpec[];
}

export const CAT1_LIST = ["Material", "Sanitary", "Lighting", "Hardware"] as const;
export const CAT2_MAP: Record<string, string[]> = {
  Material: ["Paint", "Tile", "Floor", "Wallpaper"],
  Sanitary: ["Toilet", "Bathtub", "Basin", "Shower"],
  Lighting: ["Downlight", "Pendant", "Wall", "Track"],
  Hardware: ["Door", "Handle", "Hinge", "Lock"],
};
