import type { DummyData, Material, Vendor, Brand, Project } from "@/types";
import rawData from "@/data/dummy.json";

const data = rawData as DummyData;

export function getData(): DummyData {
  return data;
}

export function getMaterials(): Material[] {
  return data.materials;
}

export function getMaterialById(id: string): Material | undefined {
  return data.materials.find((m) => m.id === id);
}

export function getVendors(): Vendor[] {
  return data.vendors;
}

export function getVendorById(id: string): Vendor | undefined {
  return data.vendors.find((v) => v.id === id);
}

export function getBrandById(id: string): Brand | undefined {
  return data.brands.find((b) => b.id === id);
}

export function getProjects(): Project[] {
  return data.projects;
}

export function getProjectById(id: string): Project | undefined {
  return data.projects.find((p) => p.id === id);
}

export function getVendorsForMaterial(materialId: string): Vendor[] {
  const links = data.material_vendor_links.filter(
    (l) => l.material_id === materialId
  );
  return links
    .map((l) => data.vendors.find((v) => v.id === l.vendor_id))
    .filter((v): v is Vendor => v !== undefined);
}

export function getMaterialsForVendor(vendorId: string): Material[] {
  const links = data.material_vendor_links.filter(
    (l) => l.vendor_id === vendorId
  );
  return links
    .map((l) => data.materials.find((m) => m.id === l.material_id))
    .filter((m): m is Material => m !== undefined);
}
