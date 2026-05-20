-- distributors 테이블에 homepage 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE distributors
  ADD COLUMN IF NOT EXISTS homepage TEXT;
