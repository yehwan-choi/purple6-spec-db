-- INSERT 권한 추가 (anon 키로 데이터 등록 허용)
-- Supabase SQL Editor에서 실행하세요.

CREATE POLICY "anon insert" ON material_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON materials           FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON distributors        FOR INSERT WITH CHECK (true);
CREATE POLICY "anon insert" ON projects            FOR INSERT WITH CHECK (true);

-- DELETE 권한
CREATE POLICY "anon delete" ON material_categories FOR DELETE USING (true);
CREATE POLICY "anon delete" ON materials           FOR DELETE USING (true);
CREATE POLICY "anon delete" ON distributors        FOR DELETE USING (true);
CREATE POLICY "anon delete" ON projects            FOR DELETE USING (true);
