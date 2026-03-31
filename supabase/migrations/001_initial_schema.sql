-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  clinic_name TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE patients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  date_of_birth  DATE,
  email          TEXT,
  phone          TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_date     TIMESTAMPTZ DEFAULT now(),
  duration_minutes INTEGER,
  audio_url        TEXT,
  transcript       TEXT,
  status           TEXT NOT NULL DEFAULT 'recording',
  error_message    TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  clinical_summary  TEXT,
  edited_summary    TEXT,
  ai_model          TEXT,
  ai_prompt_version TEXT,
  confidence_flags  JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_patients_user_id    ON patients(user_id);
CREATE INDEX idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_status     ON sessions(status);
CREATE INDEX idx_notes_session_id    ON notes(session_id);

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes    ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());

-- patients: scoped to user_id
CREATE POLICY "patients_select_own" ON patients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "patients_insert_own" ON patients FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "patients_update_own" ON patients FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "patients_delete_own" ON patients FOR DELETE USING (user_id = auth.uid());

-- sessions: scoped to user_id
CREATE POLICY "sessions_select_own" ON sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "sessions_insert_own" ON sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sessions_update_own" ON sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "sessions_delete_own" ON sessions FOR DELETE USING (user_id = auth.uid());

-- notes: scoped via session ownership
CREATE POLICY "notes_select_own" ON notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM sessions s WHERE s.id = notes.session_id AND s.user_id = auth.uid()));
CREATE POLICY "notes_insert_own" ON notes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sessions s WHERE s.id = notes.session_id AND s.user_id = auth.uid()));
CREATE POLICY "notes_update_own" ON notes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sessions s WHERE s.id = notes.session_id AND s.user_id = auth.uid()));
CREATE POLICY "notes_delete_own" ON notes FOR DELETE
  USING (EXISTS (SELECT 1 FROM sessions s WHERE s.id = notes.session_id AND s.user_id = auth.uid()));

-- ── Auto-update updated_at ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_notes_updated_at    BEFORE UPDATE ON notes    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Storage RLS (run after creating the session-audio bucket) ─────────────────
-- The first segment of the object path is the user's UUID, e.g. {userId}/{sessionId}.webm

CREATE POLICY "storage_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'session-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'session-audio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'session-audio' AND (storage.foldername(name))[1] = auth.uid()::text);
