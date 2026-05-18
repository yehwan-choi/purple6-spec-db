-- RLS 정책 전체 초기화 스크립트
-- 기존 정책을 모두 삭제하고 새로 생성합니다.
-- Supabase SQL Editor에서 전체 선택 후 실행하세요.

-- ── 기존 정책 삭제 ──────────────────────────────────────

DROP POLICY IF EXISTS "anon read"   ON distributor_types;
DROP POLICY IF EXISTS "anon insert" ON distributor_types;
DROP POLICY IF EXISTS "anon update" ON distributor_types;
DROP POLICY IF EXISTS "anon delete" ON distributor_types;

DROP POLICY IF EXISTS "anon read"   ON material_categories;
DROP POLICY IF EXISTS "anon insert" ON material_categories;
DROP POLICY IF EXISTS "anon update" ON material_categories;
DROP POLICY IF EXISTS "anon delete" ON material_categories;

DROP POLICY IF EXISTS "anon read"   ON materials;
DROP POLICY IF EXISTS "anon insert" ON materials;
DROP POLICY IF EXISTS "anon update" ON materials;
DROP POLICY IF EXISTS "anon delete" ON materials;

DROP POLICY IF EXISTS "anon read"   ON distributors;
DROP POLICY IF EXISTS "anon insert" ON distributors;
DROP POLICY IF EXISTS "anon update" ON distributors;
DROP POLICY IF EXISTS "anon delete" ON distributors;

DROP POLICY IF EXISTS "anon read"   ON distributor_contacts;
DROP POLICY IF EXISTS "anon insert" ON distributor_contacts;
DROP POLICY IF EXISTS "anon update" ON distributor_contacts;
DROP POLICY IF EXISTS "anon delete" ON distributor_contacts;

DROP POLICY IF EXISTS "anon read"   ON material_distributor_links;
DROP POLICY IF EXISTS "anon insert" ON material_distributor_links;
DROP POLICY IF EXISTS "anon delete" ON material_distributor_links;

DROP POLICY IF EXISTS "anon read"   ON projects;
DROP POLICY IF EXISTS "anon insert" ON projects;
DROP POLICY IF EXISTS "anon update" ON projects;
DROP POLICY IF EXISTS "anon delete" ON projects;

DROP POLICY IF EXISTS "anon read"   ON project_specs;
DROP POLICY IF EXISTS "anon insert" ON project_specs;
DROP POLICY IF EXISTS "anon update" ON project_specs;
DROP POLICY IF EXISTS "anon delete" ON project_specs;

-- ── RLS 활성화 (이미 켜져 있어도 무해) ─────────────────

ALTER TABLE distributor_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributors               ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_contacts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_distributor_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_specs              ENABLE ROW LEVEL SECURITY;

-- ── SELECT ──────────────────────────────────────────────

CREATE POLICY "anon read" ON distributor_types         FOR SELECT USING (true);
CREATE POLICY "anon read" ON material_categories       FOR SELECT USING (true);
CREATE POLICY "anon read" ON materials                 FOR SELECT USING (true);
CREATE POLICY "anon read" ON distributors              FOR SELECT USING (true);
CREATE POLICY "anon read" ON distributor_contacts      FOR SELECT USING (true);
CREATE POLICY "anon read" ON material_distributor_links FOR SELECT USING (true);
CREATE POLICY "anon read" ON projects                  FOR SELECT USING (true);
CREATE POLICY "anon read" ON project_specs             FOR SELECT USING (true);

-- ── INSERT ──────────────────────────────────────────────

CREATE POLICY "anon insert" ON distributor_types       FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON material_categories     FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON materials               FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON distributors            FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON distributor_contacts    FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON material_distributor_links FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON projects                FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON project_specs           FOR INSERT WITH CHECK (true);

-- ── UPDATE ──────────────────────────────────────────────

CREATE POLICY "anon update" ON distributor_types      FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon update" ON material_categories    FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon update" ON distributor_contacts   FOR UPDATE USING (true) WITH CHECK (true);

-- ── DELETE ──────────────────────────────────────────────

CREATE POLICY "anon delete" ON distributor_types       FOR DELETE USING (true);
CREATE POLICY "anon delete" ON material_categories     FOR DELETE USING (true);
CREATE POLICY "anon delete" ON materials               FOR DELETE USING (true);
CREATE POLICY "anon delete" ON distributors            FOR DELETE USING (true);
CREATE POLICY "anon delete" ON distributor_contacts    FOR DELETE USING (true);
CREATE POLICY "anon delete" ON material_distributor_links FOR DELETE USING (true);
CREATE POLICY "anon delete" ON projects                FOR DELETE USING (true);
CREATE POLICY "anon delete" ON project_specs           FOR DELETE USING (true);
