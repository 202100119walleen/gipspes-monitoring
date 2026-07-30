-- =========================================================================
-- DOLE LDNPFO GIP DOCUMENT MONITORING SYSTEM - SUPABASE SQL SETUP SCRIPT
-- Paste this script into your Supabase SQL Editor and click "Run".
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
  date_transmitted TEXT,
  regional_date_received TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security & Public Access Policies
ALTER TABLE gip_dtr_ar_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access on gip_dtr_ar_records" 
  ON gip_dtr_ar_records FOR ALL 
  USING (true) WITH CHECK (true);

ALTER TABLE transmittal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access on transmittal_records" 
  ON transmittal_records FOR ALL 
  USING (true) WITH CHECK (true);
