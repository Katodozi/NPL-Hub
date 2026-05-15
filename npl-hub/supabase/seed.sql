-- ============================================================
-- NPL HUB — Admin Setup & Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ─── STEP 1: Create your admin user ─────────────────────────────────────────
-- Go to: Supabase Dashboard → Authentication → Users → Invite user
-- Enter your email and set a password.
-- That user will be able to log into /admin/login

-- ─── STEP 2: Seed Seasons ────────────────────────────────────────────────────
insert into seasons (year, title, title_sponsor, start_date, end_date, total_matches, status) values
  (2024, 'NPL 2024', 'Siddhartha Bank', '2024-01-01', '2024-12-31', 32, 'completed'),
  (2025, 'NPL 2025', 'Siddhartha Bank', '2025-10-01', '2025-11-30', 32, 'completed'),
  (2026, 'NPL 2026', 'Siddhartha Bank', '2026-10-15', '2026-11-30', 32, 'upcoming')
on conflict (year) do nothing;

-- ─── STEP 3: Seed Teams ──────────────────────────────────────────────────────
insert into teams (name, short_code, city, province, primary_color, secondary_color, founded_year, home_venue, slug) values
  ('Biratnagar Kings',      'BK', 'Biratnagar', 'Koshi',          '#C0392B', '#F0D080', 2024, 'Biratnagar Cricket Ground',          'biratnagar-kings'),
  ('Janakpur Bolts',        'JB', 'Janakpur',   'Madhesh',        '#E67E22', '#2C3E50', 2024, 'Janakpur Stadium',                   'janakpur-bolts'),
  ('Kathmandu Goldens',     'KG', 'Kathmandu',  'Bagmati',        '#D4A017', '#1A1A1A', 2024, 'TU Cricket Ground',                  'kathmandu-goldens'),
  ('Lumbini Lions',         'LL', 'Butwal',     'Lumbini',        '#27AE60', '#F39C12', 2024, 'Rupandehi Cricket Stadium',          'lumbini-lions'),
  ('Pokhara Rhinos',        'PR', 'Pokhara',    'Gandaki',        '#2980B9', '#ECF0F1', 2024, 'Pokhara Stadium',                    'pokhara-rhinos'),
  ('Sudurpashchim Royals',  'SR', 'Dhangadhi',  'Sudurpashchim',  '#8E44AD', '#F1C40F', 2024, 'Dhangadhi Premier League Ground',    'sudurpashchim-royals'),
  ('Chitwan Tigers',        'CT', 'Bharatpur',  'Bagmati',        '#E74C3C', '#2C3E50', 2024, 'Bharatpur Cricket Ground',           'chitwan-tigers'),
  ('Karnali Yaks',          'KY', 'Surkhet',    'Karnali',        '#1ABC9C', '#34495E', 2024, 'Birendranagar Cricket Ground',       'karnali-yaks')
on conflict (name) do nothing;

-- ─── STEP 4: After seeding teams, update season champions ───────────────────
-- Run these after the teams are inserted and you have their UUIDs
-- Go to Table Editor → teams, copy UUIDs for Janakpur Bolts and Lumbini Lions

-- update seasons
--   set champion_team_id = '<janakpur-bolts-uuid>'
-- where year = 2024;

-- update seasons
--   set champion_team_id = '<lumbini-lions-uuid>'
-- where year = 2025;

-- ─── STEP 5: Sample Players (optional bootstrap) ─────────────────────────────
insert into players (full_name, short_name, nationality, role, batting_style, bowling_style, is_overseas, slug) values
  ('Rohit Paudel',          'Paudel',      'Nepal',        'batter',         'right-hand', 'right-arm off-break', false, 'rohit-paudel'),
  ('Sandeep Lamichhane',    'Lamichhane',  'Nepal',        'bowler',         'right-hand', 'right-arm leg-break', false, 'sandeep-lamichhane'),
  ('Kushal Bhurtel',        'Bhurtel',     'Nepal',        'batter',         'left-hand',  'none',                false, 'kushal-bhurtel'),
  ('Aasif Sheikh',          'Sheikh',      'Nepal',        'wicket-keeper',  'left-hand',  'none',                false, 'aasif-sheikh'),
  ('Karan KC',              'Karan',       'Nepal',        'bowler',         'right-hand', 'right-arm fast',      false, 'karan-kc'),
  ('Sompal Kami',           'Sompal',      'Nepal',        'bowler',         'left-hand',  'left-arm fast',       false, 'sompal-kami'),
  ('Dipendra Singh Airee',  'Airee',       'Nepal',        'all-rounder',    'right-hand', 'right-arm off-break', false, 'dipendra-singh-airee'),
  ('Binod Bhandari',        'Bhandari',    'Nepal',        'wicket-keeper',  'right-hand', 'none',                false, 'binod-bhandari'),
  ('Faf du Plessis',        'du Plessis',  'South Africa', 'batter',         'right-hand', 'right-arm medium',    true,  'faf-du-plessis'),
  ('Dawid Malan',           'Malan',       'England',      'batter',         'left-hand',  'right-arm leg-break', true,  'dawid-malan'),
  ('Wayne Parnell',         'Parnell',     'South Africa', 'all-rounder',    'left-hand',  'left-arm fast',       true,  'wayne-parnell'),
  ('Adam Rossington',       'Rossington',  'England',      'wicket-keeper',  'right-hand', 'none',                true,  'adam-rossington')
on conflict (slug) do nothing;
