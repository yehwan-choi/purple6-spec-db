import { getAppSettings } from "@/lib/data";
import { PasswordManager } from "@/components/settings/PasswordManager";

export default async function PasswordsPage() {
  const settings = await getAppSettings();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">비밀번호 관리</h1>
        <p className="text-muted-foreground mt-1">PURPLE6 및 ADMIN 비밀번호를 변경합니다</p>
      </div>
      <PasswordManager
        purple6Password={settings.purple6_password}
        adminPassword={settings.admin_password}
      />
    </div>
  );
}
