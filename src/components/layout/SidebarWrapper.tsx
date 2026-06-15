import { getDistributorTypes } from "@/lib/data";
import { Sidebar } from "./Sidebar";

export async function SidebarWrapper() {
  const types = await getDistributorTypes();
  const professionalTypes = types.filter((t) => !t.is_material);
  return <Sidebar professionalTypes={professionalTypes} />;
}
