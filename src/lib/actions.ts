"use server";

import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";

type ActionState = { success: boolean; error?: string } | null;

export async function createMaterial(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = crypto.randomUUID();

  // 이미지 업로드 (선택 사항)
  const imageFile = formData.get("material_image");
  let material_image: string | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const { error: uploadError } = await supabase.storage
      .from("material-images")
      .upload(`${id}.${ext}`, imageFile, { contentType: imageFile.type });
    if (uploadError) return { success: false, error: `이미지 업로드 실패: ${uploadError.message}` };
    const { data: urlData } = supabase.storage.from("material-images").getPublicUrl(`${id}.${ext}`);
    material_image = urlData.publicUrl;
  }

  const { error } = await supabase.from("materials").insert({
    id,
    category_id: formData.get("category_id") as string,
    material_item: formData.get("material_item") as string,
    material_finish: (formData.get("material_finish") as string) || "-",
    material_size: (formData.get("material_size") as string) || "-",
    material_image,
  });
  if (error) return { success: false, error: error.message };

  const distributorIdsJson = formData.get("distributor_ids") as string;
  if (distributorIdsJson) {
    const distributorIds = JSON.parse(distributorIdsJson) as string[];
    const rows = distributorIds.map((distributor_id) => ({ material_id: id, distributor_id }));
    if (rows.length > 0) {
      const { error: linkErr } = await supabase.from("material_distributor_links").insert(rows);
      if (linkErr) return { success: false, error: linkErr.message };
    }
  }

  revalidatePath("/materials");
  return { success: true };
}

export async function createDistributor(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = (formData.get("id") as string) || crypto.randomUUID();
  const { error } = await supabase.from("distributors").insert({
    id,
    distributor_type: formData.get("distributor_type") as string,
    company_name: formData.get("company_name") as string,
    address: (formData.get("address") as string) || null,
    note: (formData.get("note") as string) || null,
    homepage: (formData.get("homepage") as string) || null,
  });
  if (error) return { success: false, error: error.message };

  const contactsJson = formData.get("contacts") as string;
  if (contactsJson) {
    const contacts = JSON.parse(contactsJson) as { name: string; role: string; phone: string; email: string }[];
    const rows = contacts.filter((c) => c.name.trim()).map((c) => ({
      id: crypto.randomUUID(),
      distributor_id: id,
      name: c.name.trim(),
      role: c.role.trim() || null,
      phone: c.phone.trim() || null,
      email: c.email.trim() || null,
    }));
    if (rows.length > 0) {
      const { error: cErr } = await supabase.from("distributor_contacts").insert(rows);
      if (cErr) return { success: false, error: cErr.message };
    }
  }

  const categoryIdsJson = formData.get("category_ids") as string;
  if (categoryIdsJson) {
    const categoryIds = JSON.parse(categoryIdsJson) as string[];
    const rows = categoryIds.map((category_id) => ({ distributor_id: id, category_id }));
    if (rows.length > 0) {
      const { error: catErr } = await supabase.from("distributor_category_links").insert(rows);
      if (catErr) return { success: false, error: catErr.message };
    }
  }

  revalidatePath("/distributors/material");
  revalidatePath("/distributors/other");
  return { success: true };
}

export async function createMaterialCategory(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { error } = await supabase.from("material_categories").insert({
    id: crypto.randomUUID(),
    code_prefix: formData.get("code_prefix") as string,
    category_eng: formData.get("category_eng") as string,
    category_kor: formData.get("category_kor") as string,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/materials/categories");
  revalidatePath("/materials");
  return { success: true };
}

export async function deleteMaterialCategory(id: string): Promise<ActionState> {
  const { error } = await supabase
    .from("material_categories")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/materials/categories");
  revalidatePath("/materials");
  return { success: true };
}

export async function updateMaterial(
  id: string,
  data: { category_id: string; material_item: string; material_finish: string; material_size: string },
  imageFile?: File | null
): Promise<ActionState> {
  let material_image: string | undefined;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const { error: uploadError } = await supabase.storage
      .from("material-images")
      .upload(`${id}.${ext}`, imageFile, { contentType: imageFile.type, upsert: true });
    if (uploadError) return { success: false, error: `이미지 업로드 실패: ${uploadError.message}` };
    const { data: urlData } = supabase.storage.from("material-images").getPublicUrl(`${id}.${ext}`);
    material_image = urlData.publicUrl;
  }

  const { error } = await supabase
    .from("materials")
    .update({
      category_id: data.category_id || null,
      material_item: data.material_item,
      material_finish: data.material_finish || null,
      material_size: data.material_size || null,
      ...(material_image !== undefined ? { material_image } : {}),
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/materials");
  return { success: true };
}

export async function deleteMaterial(id: string): Promise<ActionState> {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/materials");
  return { success: true };
}

export async function deleteDistributor(id: string): Promise<ActionState> {
  const { error } = await supabase.from("distributors").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/distributors/material");
  revalidatePath("/distributors/other");
  return { success: true };
}

export async function updateDistributorInfo(
  id: string,
  data: { company_name: string; distributor_type: string; note: string; homepage: string }
): Promise<ActionState> {
  if (!data.company_name.trim()) return { success: false, error: "업체명을 입력해 주세요." };
  const { error } = await supabase
    .from("distributors")
    .update({
      company_name: data.company_name.trim(),
      distributor_type: data.distributor_type,
      note: data.note || null,
      homepage: data.homepage || null,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/distributors/${id}`);
  revalidatePath("/distributors/material");
  revalidatePath("/distributors/other");
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionState> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/projects/draft");
  revalidatePath("/projects/completed");
  return { success: true };
}

export async function updateMaterialCategory(
  id: string,
  data: { code_prefix: string; category_eng: string; category_kor: string }
): Promise<ActionState> {
  const { error } = await supabase
    .from("material_categories")
    .update({
      code_prefix: data.code_prefix.toUpperCase().trim(),
      category_eng: data.category_eng.toUpperCase().trim(),
      category_kor: data.category_kor.trim(),
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/materials/categories");
  revalidatePath("/materials");
  return { success: true };
}

// ── 담당자 CRUD ──────────────────────────────────────────────────────────────

export async function createDistributorContact(
  distributorId: string,
  id: string,
  data: { name: string; role: string; phone: string; email: string }
): Promise<ActionState> {
  const { error } = await supabase.from("distributor_contacts").insert({
    id,
    distributor_id: distributorId,
    name: data.name.trim(),
    role: data.role.trim() || null,
    phone: data.phone.trim() || null,
    email: data.email.trim() || null,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/distributors/${distributorId}`);
  return { success: true };
}

export async function updateDistributorContact(
  id: string,
  distributorId: string,
  data: { name: string; role: string; phone: string; email: string }
): Promise<ActionState> {
  const { error } = await supabase
    .from("distributor_contacts")
    .update({
      name: data.name.trim(),
      role: data.role.trim() || null,
      phone: data.phone.trim() || null,
      email: data.email.trim() || null,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/distributors/${distributorId}`);
  return { success: true };
}

export async function deleteDistributorContact(id: string, distributorId: string): Promise<ActionState> {
  const { error } = await supabase.from("distributor_contacts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/distributors/${distributorId}`);
  return { success: true };
}

// ── 카테고리 ↔ 업체 링크 ─────────────────────────────────────────────────────

export async function addCategoryToDistributor(
  distributorId: string,
  categoryId: string
): Promise<ActionState> {
  const { error } = await supabase
    .from("distributor_category_links")
    .upsert({ distributor_id: distributorId, category_id: categoryId });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/distributors/${distributorId}`);
  revalidatePath("/distributors/material");
  revalidatePath("/distributors/other");
  return { success: true };
}

export async function removeCategoryFromDistributor(
  distributorId: string,
  categoryId: string
): Promise<ActionState> {
  const { error } = await supabase
    .from("distributor_category_links")
    .delete()
    .eq("distributor_id", distributorId)
    .eq("category_id", categoryId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/distributors/${distributorId}`);
  revalidatePath("/distributors/material");
  revalidatePath("/distributors/other");
  return { success: true };
}

// 마감재 리스트에서 공급업체 교체 (1:1)
export async function updateMaterialDistributor(
  materialId: string,
  distributorId: string | null
): Promise<ActionState> {
  const { error: delErr } = await supabase
    .from("material_distributor_links")
    .delete()
    .eq("material_id", materialId);
  if (delErr) return { success: false, error: delErr.message };

  if (distributorId) {
    const { error } = await supabase
      .from("material_distributor_links")
      .insert({ material_id: materialId, distributor_id: distributorId });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/materials");
  return { success: true };
}

// ── 마감재 ↔ 업체 링크 ──────────────────────────────────────────────────────

export async function addMaterialToDistributor(
  distributorId: string,
  materialId: string
): Promise<ActionState> {
  const { error } = await supabase
    .from("material_distributor_links")
    .upsert({ material_id: materialId, distributor_id: distributorId });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function removeMaterialFromDistributor(
  distributorId: string,
  materialId: string
): Promise<ActionState> {
  const { error } = await supabase
    .from("material_distributor_links")
    .delete()
    .eq("material_id", materialId)
    .eq("distributor_id", distributorId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── 프로젝트 스펙 CRUD ────────────────────────────────────────────────────────

export async function addProjectSpec(
  projectId: string,
  data: {
    material_id: string;
    distributor_id: string;
    code_suffix?: string;
    contact_id?: string | null;
    quantity?: string;
    area?: string;
    location?: string;
    description?: string;
    price?: string;
    delivery?: string;
  }
): Promise<ActionState> {
  const { error } = await supabase.from("project_specs").insert({
    id: crypto.randomUUID(),
    project_id: projectId,
    material_id: data.material_id,
    distributor_id: data.distributor_id,
    memo: "",
    code_suffix: data.code_suffix ?? "",
    contact_id: data.contact_id ?? null,
    quantity: data.quantity ?? "",
    area: data.area ?? "",
    location: data.location ?? "",
    description: data.description ?? "",
    price: data.price ?? "",
    delivery: data.delivery ?? "",
  });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function updateProjectSpec(
  specId: string,
  projectId: string,
  data: {
    material_id: string;
    distributor_id: string;
    code_suffix?: string;
    contact_id?: string | null;
    quantity?: string;
    area?: string;
    location?: string;
    description?: string;
    price?: string;
    delivery?: string;
  }
): Promise<ActionState> {
  const { error } = await supabase
    .from("project_specs")
    .update({
      material_id: data.material_id,
      distributor_id: data.distributor_id,
      code_suffix: data.code_suffix ?? "",
      contact_id: data.contact_id ?? null,
      quantity: data.quantity ?? "",
      area: data.area ?? "",
      location: data.location ?? "",
      description: data.description ?? "",
      price: data.price ?? "",
      delivery: data.delivery ?? "",
    })
    .eq("id", specId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteProjectSpec(specId: string, projectId: string): Promise<ActionState> {
  const { error } = await supabase.from("project_specs").delete().eq("id", specId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────

export async function createProject(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { error } = await supabase.from("projects").insert({
    id: crypto.randomUUID(),
    project_name: formData.get("project_name") as string,
    project_client: (formData.get("project_client") as string) || null,
    project_year:
      Number(formData.get("project_year")) || new Date().getFullYear(),
    status: "draft",
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/projects/draft");
  return { success: true };
}

export async function updateProjectStatus(
  id: string,
  status: "draft" | "completed"
): Promise<ActionState> {
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/projects/draft");
  revalidatePath("/projects/completed");
  revalidatePath(`/projects/${id}`);
  return { success: true };
}

// ── 업체 구분(distributor_types) CRUD ────────────────────────────────────────

export async function createDistributorType(data: {
  id: string;
  label_kor: string;
  sort_order: number;
  is_material: boolean;
}): Promise<ActionState> {
  const { error } = await supabase.from("distributor_types").insert(data);
  if (error) return { success: false, error: error.message };
  revalidatePath("/distributors/types");
  revalidatePath("/distributors");
  return { success: true };
}

export async function updateDistributorType(
  id: string,
  data: { label_kor: string; sort_order: number; is_material: boolean }
): Promise<ActionState> {
  const { error } = await supabase.from("distributor_types").update(data).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/distributors/types");
  revalidatePath("/distributors");
  return { success: true };
}

export async function deleteDistributorType(id: string): Promise<ActionState> {
  const { error } = await supabase.from("distributor_types").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/distributors/types");
  revalidatePath("/distributors");
  return { success: true };
}

// ── 앱 설정(비밀번호) ─────────────────────────────────────────────────────────

export async function updateAppPassword(
  key: "purple6_password" | "admin_password",
  value: string
): Promise<ActionState> {
  if (!/^\d{4}$/.test(value)) return { success: false, error: "비밀번호는 숫자 4자리여야 합니다." };
  const { error } = await supabase.from("app_settings").upsert({ key, value });
  if (error) return { success: false, error: error.message };
  revalidatePath("/");
  return { success: true };
}
