import { getMaterials, getDistributors, getProjects } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Building2, FolderOpen } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const [materials, distributors, projects] = await Promise.all([
    getMaterials(),
    getDistributors(),
    getProjects(),
  ]);
  const totalMaterials = materials.length;
  const totalDistributors = distributors.length;
  const totalProjects = projects.length;

  return (
    <div className="p-8">
      <div className="mb-8 rounded-xl px-6 py-5" style={{ backgroundColor: "#00001a" }}>
        <h1 className="text-2xl font-bold tracking-tight text-white">HOME</h1>
        <p className="text-white/50 mt-1">인테리어 마감재 &amp; 업체 등록 현황</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Link href="/materials">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">마감재</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMaterials}</div>
              <p className="text-xs text-muted-foreground mt-1">등록된 자재 수</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/distributors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">업체</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalDistributors}</div>
              <p className="text-xs text-muted-foreground mt-1">등록된 업체 수</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/projects">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">프로젝트</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">등록된 프로젝트 수</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
