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

-- 3. Enable Row Level Security (RLS)
ALTER TABLE gip_dtr_ar_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transmittal_records ENABLE ROW LEVEL SECURITY;

-- 4. Enable Public Read & Write Access Policies
DROP POLICY IF EXISTS "Public full access on gip_dtr_ar_records" ON gip_dtr_ar_records;
CREATE POLICY "Public full access on gip_dtr_ar_records" 
  ON gip_dtr_ar_records FOR ALL 
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on transmittal_records" ON transmittal_records;
CREATE POLICY "Public full access on transmittal_records" 
  ON transmittal_records FOR ALL 
  USING (true) WITH CHECK (true);

-- 5. Enable Realtime Publications for Realtime Multi-device Sync
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE gip_dtr_ar_records, transmittal_records;
COMMIT;
