-- =========================================================================
-- DOLE LDNPFO GIP DOCUMENT MONITORING SYSTEM - SUPABASE SQL SETUP SCRIPT
-- Copy and paste this complete script into your Supabase SQL Editor and click "Run".
-- Project URL: https://gprkzegwymkufrbmzakd.supabase.co
-- =========================================================================

-- 1. Create GIP DTR & AR Table
CREATE TABLE IF NOT EXISTS gip_dtr_ar_records (
  id TEXT PRIMARY KEY,
  gip_name TEXT NOT NULL,
  month TEXT,
  quincena TEXT,
  dtr_ar_date_received TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Transmittal Monitoring Table
CREATE TABLE IF NOT EXISTS transmittal_records (
  id TEXT PRIMARY KEY,
  particulars TEXT NOT NULL,
  prepared_by TEXT,
  date_transmitted TEXT,
  regional_date_received TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Recycle Bin Table for 30-Day Retention
CREATE TABLE IF NOT EXISTS recycled_records (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  original_id TEXT,
  original_record JSONB,
  deleted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create GIP Contacts Directory Table
CREATE TABLE IF NOT EXISTS gip_contacts (
  id TEXT PRIMARY KEY,
  gip_name TEXT NOT NULL,
  assignment TEXT,
  contact_number TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create GIP Salary & Payroll Tracking Table
CREATE TABLE IF NOT EXISTS gip_salary_records (
  id TEXT PRIMARY KEY,
  gip_name TEXT NOT NULL,
  periods JSONB,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Ensure all columns exist (Migration fix for existing tables)
ALTER TABLE transmittal_records ADD COLUMN IF NOT EXISTS prepared_by TEXT;
ALTER TABLE transmittal_records ADD COLUMN IF NOT EXISTS particulars TEXT;
ALTER TABLE transmittal_records ADD COLUMN IF NOT EXISTS date_transmitted TEXT;
ALTER TABLE transmittal_records ADD COLUMN IF NOT EXISTS regional_date_received TEXT;
ALTER TABLE transmittal_records ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE transmittal_records ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE gip_dtr_ar_records ADD COLUMN IF NOT EXISTS gip_name TEXT;
ALTER TABLE gip_dtr_ar_records ADD COLUMN IF NOT EXISTS month TEXT;
ALTER TABLE gip_dtr_ar_records ADD COLUMN IF NOT EXISTS quincena TEXT;
ALTER TABLE gip_dtr_ar_records ADD COLUMN IF NOT EXISTS dtr_ar_date_received TEXT;
ALTER TABLE gip_dtr_ar_records ADD COLUMN IF NOT EXISTS remarks TEXT;

ALTER TABLE gip_contacts ADD COLUMN IF NOT EXISTS gip_name TEXT;
ALTER TABLE gip_contacts ADD COLUMN IF NOT EXISTS assignment TEXT;
ALTER TABLE gip_contacts ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE gip_contacts ADD COLUMN IF NOT EXISTS remarks TEXT;

ALTER TABLE gip_salary_records ADD COLUMN IF NOT EXISTS gip_name TEXT;
ALTER TABLE gip_salary_records ADD COLUMN IF NOT EXISTS periods JSONB;
ALTER TABLE gip_salary_records ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 7. Enable Row Level Security (RLS)
ALTER TABLE gip_dtr_ar_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transmittal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycled_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gip_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gip_salary_records ENABLE ROW LEVEL SECURITY;

-- 8. Enable Public Read & Write Access Policies
DROP POLICY IF EXISTS "Public full access on gip_dtr_ar_records" ON gip_dtr_ar_records;
CREATE POLICY "Public full access on gip_dtr_ar_records" 
  ON gip_dtr_ar_records FOR ALL 
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on transmittal_records" ON transmittal_records;
CREATE POLICY "Public full access on transmittal_records" 
  ON transmittal_records FOR ALL 
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on recycled_records" ON recycled_records;
CREATE POLICY "Public full access on recycled_records" 
  ON recycled_records FOR ALL 
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on gip_contacts" ON gip_contacts;
CREATE POLICY "Public full access on gip_contacts" 
  ON gip_contacts FOR ALL 
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on gip_salary_records" ON gip_salary_records;
CREATE POLICY "Public full access on gip_salary_records" 
  ON gip_salary_records FOR ALL 
  USING (true) WITH CHECK (true);

-- 9. Enable Realtime Publications for Realtime Multi-device Sync
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE gip_dtr_ar_records, transmittal_records, recycled_records, gip_contacts, gip_salary_records;
COMMIT;
