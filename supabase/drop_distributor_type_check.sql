-- distributor_type 체크 제약 제거
-- 기존: CHECK (distributor_type IN ('material', 'other'))
-- 변경: distributor_types 테이블의 UUID를 직접 저장하도록 제약 없이 TEXT 유지
ALTER TABLE distributors DROP CONSTRAINT vendors_vendor_type_check;
