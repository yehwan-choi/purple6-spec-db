-- app_settings: 앱 전역 설정 키-값 저장소 (비밀번호 등)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 초기 비밀번호 데이터
INSERT INTO app_settings (key, value) VALUES
  ('purple6_password', '6666'),
  ('admin_password', '1234')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read"   ON app_settings FOR SELECT USING (true);
CREATE POLICY "anon_update" ON app_settings FOR UPDATE USING (true);
CREATE POLICY "anon_insert" ON app_settings FOR INSERT WITH CHECK (true);
