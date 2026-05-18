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
    material_finish: (formData.get("material_finish") as string) || null,
    material_size: (formData.get("material_size") as string) || null,
    material_image,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/materials");
  return { success: true };
}

export async function createDistributor(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { error } = await supabase.from("distributors").insert({
    id: (formData.get("id") as string) || crypto.randomUUID(),
    distributor_type: formData.get("distributor_type") as string,
    company_name: formData.get("company_name") as string,
    specialty: (formData.get("specialty") as string) || null,
    address: (formData.get("address") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    note: (formData.get("note") as string) || null,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/distributors");
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

export async function deleteMaterial(id: string): Promise<ActionState> {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/materials");
  return { success: true };
}

export async function deleteDistributor(id: string): Promise<ActionState> {
  const { error } = await supabase.from("distributors").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/distributors");
  revalidatePath("/distributors/material");
  revalidatePath("/distributors/other");
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionState> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/projects");
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
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/projects");
  return { success: true };
}
