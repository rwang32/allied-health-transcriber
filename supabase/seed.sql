-- ── Seed: Mock patients + session history ─────────────────────────────────────
-- 1. Find your user UUID in Supabase: Authentication → Users → copy your UUID
-- 2. Replace 'YOUR-AUTH-USER-UUID-HERE' below with that value
-- 3. Run this entire script in the Supabase SQL Editor

DO $$
DECLARE
  v_user_id UUID := 'e9b2ef86-6e8a-41d7-b7bc-88b0f1f82e70';

  -- Patient UUIDs
  v_pat_001 UUID := gen_random_uuid();
  v_pat_002 UUID := gen_random_uuid();
  v_pat_003 UUID := gen_random_uuid();
  v_pat_004 UUID := gen_random_uuid();
  v_pat_005 UUID := gen_random_uuid();

  -- Session UUIDs
  v_ses_001 UUID := gen_random_uuid();
  v_ses_002 UUID := gen_random_uuid();
  v_ses_003 UUID := gen_random_uuid();
  v_ses_004 UUID := gen_random_uuid();
  v_ses_005 UUID := gen_random_uuid();
  v_ses_006 UUID := gen_random_uuid();
  v_ses_007 UUID := gen_random_uuid();
  v_ses_008 UUID := gen_random_uuid();
  v_ses_009 UUID := gen_random_uuid();
  v_ses_010 UUID := gen_random_uuid();

BEGIN

-- ── users row (matches your auth.users entry) ─────────────────────────────────
INSERT INTO users (id, email, full_name, clinic_name)
VALUES (v_user_id, 'sarah.chen@westcoastphysio.ca', 'Sarah Chen', 'West Coast Physiotherapy')
ON CONFLICT (id) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  clinic_name = EXCLUDED.clinic_name;

-- ── Patients ──────────────────────────────────────────────────────────────────
INSERT INTO patients (id, user_id, first_name, last_name, date_of_birth, email, phone, notes, created_at, updated_at) VALUES
  (v_pat_001, v_user_id, 'James',  'Okonkwo', '1985-03-14', 'james.okonkwo@email.com', '604-555-0101', 'History of lower back pain. Responds well to soft tissue work.',                           '2025-09-05T09:00:00Z', '2025-09-05T09:00:00Z'),
  (v_pat_002, v_user_id, 'Maria',  'Reyes',   '1972-11-28', 'm.reyes@email.com',        '604-555-0102', 'Post-surgical rehab, right knee ACL repair (Feb 2025).',                                  '2025-09-10T10:00:00Z', '2025-09-10T10:00:00Z'),
  (v_pat_003, v_user_id, 'Liam',   'Nguyen',  '1998-07-02', 'liam.n@email.com',         '604-555-0103', 'Recreational runner, recurring IT band syndrome.',                                        '2025-10-01T11:00:00Z', '2025-10-01T11:00:00Z'),
  (v_pat_004, v_user_id, 'Priya',  'Sharma',  '1965-01-19', 'priya.sharma@email.com',   '604-555-0104', NULL,                                                                                      '2025-10-15T09:30:00Z', '2025-10-15T09:30:00Z'),
  (v_pat_005, v_user_id, 'Derek',  'Walsh',   '1990-05-30', NULL,                       '604-555-0105', 'Neck and shoulder tension, office worker. Prefers morning appointments.',                 '2026-01-08T08:00:00Z', '2026-01-08T08:00:00Z');

-- ── Sessions ──────────────────────────────────────────────────────────────────
INSERT INTO sessions (id, user_id, patient_id, session_date, duration_minutes, status, error_message, created_at, updated_at) VALUES
  (v_ses_001, v_user_id, v_pat_001, '2026-03-28T09:00:00Z', 50, 'complete', NULL,                                      '2026-03-28T09:00:00Z', '2026-03-28T10:00:00Z'),
  (v_ses_002, v_user_id, v_pat_003, '2026-03-27T14:00:00Z', 45, 'complete', NULL,                                      '2026-03-27T14:00:00Z', '2026-03-27T15:00:00Z'),
  (v_ses_003, v_user_id, v_pat_002, '2026-03-26T10:30:00Z', 60, 'complete', NULL,                                      '2026-03-26T10:30:00Z', '2026-03-26T11:30:00Z'),
  (v_ses_004, v_user_id, v_pat_005, '2026-03-25T08:00:00Z', 45, 'complete', NULL,                                      '2026-03-25T08:00:00Z', '2026-03-25T09:00:00Z'),
  (v_ses_005, v_user_id, v_pat_004, '2026-03-24T13:00:00Z', 55, 'error',    'Transcription failed: audio file corrupted.', '2026-03-24T13:00:00Z', '2026-03-24T14:00:00Z'),
  (v_ses_006, v_user_id, v_pat_001, '2026-03-21T09:00:00Z', 50, 'complete', NULL,                                      '2026-03-21T09:00:00Z', '2026-03-21T10:00:00Z'),
  (v_ses_007, v_user_id, v_pat_002, '2026-03-19T11:00:00Z', 60, 'complete', NULL,                                      '2026-03-19T11:00:00Z', '2026-03-19T12:00:00Z'),
  (v_ses_008, v_user_id, v_pat_003, '2026-03-17T15:30:00Z', 45, 'complete', NULL,                                      '2026-03-17T15:30:00Z', '2026-03-17T16:15:00Z'),
  (v_ses_009, v_user_id, v_pat_005, '2026-03-14T08:00:00Z', 45, 'complete', NULL,                                      '2026-03-14T08:00:00Z', '2026-03-14T09:00:00Z'),
  (v_ses_010, v_user_id, v_pat_004, '2026-03-12T13:30:00Z', 50, 'complete', NULL,                                      '2026-03-12T13:30:00Z', '2026-03-12T14:30:00Z');

-- ── Notes (clinical summaries for complete sessions) ──────────────────────────
INSERT INTO notes (session_id, clinical_summary, ai_model, ai_prompt_version, confidence_flags) VALUES
  (v_ses_001, 'L4-L5 mobility continuing to improve. Soft tissue work to bilateral paraspinal muscles and left QL. Patient reports 30% reduction in morning stiffness. Home exercise compliance good — reviewed hip hinge technique.',
   'claude-sonnet-4-20250514', 'v1', '[]'),
  (v_ses_002, 'Right IT band syndrome. Lateral hip tightness noted on palpation. Corrected foam rolling technique. Added clamshell and lateral band walk exercises to home program. 5km run cleared with modified warm-up protocol.',
   'claude-sonnet-4-20250514', 'v1', '[]'),
  (v_ses_003, 'ACL rehab week 8 post-op. Quadriceps strength at 78% of contralateral side on single-leg press. Introduced single-leg squat progression. Swelling minimal. Return-to-sport timeline on track for 14 weeks.',
   'claude-sonnet-4-20250514', 'v1', '[]'),
  (v_ses_004, 'Cervical and upper trapezius tension, C4-C6 bilateral. Trigger point release performed. Patient reports headaches reduced since last visit. Ergonomic workstation review completed — monitor height adjusted.',
   'claude-sonnet-4-20250514', 'v1', '[]'),
  (v_ses_010, 'Bilateral shoulder mobility assessment. Restricted right external rotation (55°). Joint mobilisation grade III applied. Posture education provided. Patient to continue thoracic extension over foam roller daily.',
   'claude-sonnet-4-20250514', 'v1', '[]');

END $$;
