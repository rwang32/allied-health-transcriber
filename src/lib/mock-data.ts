// Mock data used in place of real Supabase queries until auth + DB are wired up.
// Replace calls to these with real server-side Supabase queries when ready.

import type { User } from "@/types/user";
import type { Patient, PatientWithLastSession } from "@/types/patient";
import type { Session, SessionWithPatient, Note } from "@/types/session";

export const MOCK_USER: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "sarah.chen@westcoastphysio.ca",
  fullName: "Sarah Chen",
  clinicName: "West Coast Physiotherapy",
  createdAt: "2025-09-01T08:00:00Z",
  updatedAt: "2025-09-01T08:00:00Z",
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "pat_001",
    userId: MOCK_USER.id,
    firstName: "James",
    lastName: "Okonkwo",
    dateOfBirth: "1985-03-14",
    email: "james.okonkwo@email.com",
    phone: "604-555-0101",
    notes: "History of lower back pain. Responds well to soft tissue work.",
    createdAt: "2025-09-05T09:00:00Z",
    updatedAt: "2025-09-05T09:00:00Z",
  },
  {
    id: "pat_002",
    userId: MOCK_USER.id,
    firstName: "Maria",
    lastName: "Reyes",
    dateOfBirth: "1972-11-28",
    email: "m.reyes@email.com",
    phone: "604-555-0102",
    notes: "Post-surgical rehab, right knee ACL repair (Feb 2025).",
    createdAt: "2025-09-10T10:00:00Z",
    updatedAt: "2025-09-10T10:00:00Z",
  },
  {
    id: "pat_003",
    userId: MOCK_USER.id,
    firstName: "Liam",
    lastName: "Nguyen",
    dateOfBirth: "1998-07-02",
    email: "liam.n@email.com",
    phone: "604-555-0103",
    notes: "Recreational runner, recurring IT band syndrome.",
    createdAt: "2025-10-01T11:00:00Z",
    updatedAt: "2025-10-01T11:00:00Z",
  },
  {
    id: "pat_004",
    userId: MOCK_USER.id,
    firstName: "Priya",
    lastName: "Sharma",
    dateOfBirth: "1965-01-19",
    email: "priya.sharma@email.com",
    phone: "604-555-0104",
    notes: null,
    createdAt: "2025-10-15T09:30:00Z",
    updatedAt: "2025-10-15T09:30:00Z",
  },
  {
    id: "pat_005",
    userId: MOCK_USER.id,
    firstName: "Derek",
    lastName: "Walsh",
    dateOfBirth: "1990-05-30",
    email: null,
    phone: "604-555-0105",
    notes: "Neck and shoulder tension, office worker. Prefers morning appointments.",
    createdAt: "2026-01-08T08:00:00Z",
    updatedAt: "2026-01-08T08:00:00Z",
  },
];

// Sessions sorted newest-first
export const MOCK_SESSIONS: Session[] = [
  {
    id: "ses_001",
    userId: MOCK_USER.id,
    patientId: "pat_001",
    sessionDate: "2026-03-28T09:00:00Z",
    durationMinutes: 50,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-03-28T10:00:00Z",
  },
  {
    id: "ses_002",
    userId: MOCK_USER.id,
    patientId: "pat_003",
    sessionDate: "2026-03-27T14:00:00Z",
    durationMinutes: 45,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-27T14:00:00Z",
    updatedAt: "2026-03-27T15:00:00Z",
  },
  {
    id: "ses_003",
    userId: MOCK_USER.id,
    patientId: "pat_002",
    sessionDate: "2026-03-26T10:30:00Z",
    durationMinutes: 60,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-26T10:30:00Z",
    updatedAt: "2026-03-26T11:30:00Z",
  },
  {
    id: "ses_004",
    userId: MOCK_USER.id,
    patientId: "pat_005",
    sessionDate: "2026-03-25T08:00:00Z",
    durationMinutes: 45,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-25T08:00:00Z",
    updatedAt: "2026-03-25T09:00:00Z",
  },
  {
    id: "ses_005",
    userId: MOCK_USER.id,
    patientId: "pat_004",
    sessionDate: "2026-03-24T13:00:00Z",
    durationMinutes: 55,
    audioUrl: null,
    transcript: null,
    status: "error",
    errorMessage: "Transcription failed: audio file corrupted.",
    createdAt: "2026-03-24T13:00:00Z",
    updatedAt: "2026-03-24T14:00:00Z",
  },
  {
    id: "ses_006",
    userId: MOCK_USER.id,
    patientId: "pat_001",
    sessionDate: "2026-03-21T09:00:00Z",
    durationMinutes: 50,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-21T09:00:00Z",
    updatedAt: "2026-03-21T10:00:00Z",
  },
  {
    id: "ses_007",
    userId: MOCK_USER.id,
    patientId: "pat_002",
    sessionDate: "2026-03-19T11:00:00Z",
    durationMinutes: 60,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-19T11:00:00Z",
    updatedAt: "2026-03-19T12:00:00Z",
  },
  {
    id: "ses_008",
    userId: MOCK_USER.id,
    patientId: "pat_003",
    sessionDate: "2026-03-17T15:30:00Z",
    durationMinutes: 45,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-17T15:30:00Z",
    updatedAt: "2026-03-17T16:15:00Z",
  },
  {
    id: "ses_009",
    userId: MOCK_USER.id,
    patientId: "pat_005",
    sessionDate: "2026-03-14T08:00:00Z",
    durationMinutes: 45,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-14T08:00:00Z",
    updatedAt: "2026-03-14T09:00:00Z",
  },
  {
    id: "ses_010",
    userId: MOCK_USER.id,
    patientId: "pat_004",
    sessionDate: "2026-03-12T13:30:00Z",
    durationMinutes: 50,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-12T13:30:00Z",
    updatedAt: "2026-03-12T14:30:00Z",
  },
];

// Full structured clinical notes keyed by session ID — simulates the notes table
export const MOCK_NOTES: Record<string, Note> = {
  ses_001: {
    id: "note_001",
    sessionId: "ses_001",
    clinicalSummary: `**Chief Complaint**
Patient presents with chronic lower back pain radiating to the left buttock, rated 4/10 at rest and 7/10 with prolonged sitting. Reports increased stiffness in mornings over the past week.

**History**
Known L4-L5 disc herniation confirmed by MRI (January 2025). Completed initial physiotherapy course in February 2025 with moderate improvement. Works as a software developer — seated 8+ hours daily. No new mechanism of injury reported.

**Findings**
Lumbar flexion restricted to approximately 60% ROM, pain-limited. Extension near full with mild discomfort at end range. Left straight leg raise (SLR) positive at 50°. Bilateral paraspinal muscle guarding noted, more pronounced on left side. Palpation reveals tenderness at L4-L5 and left quadratus lumborum attachment. No neurological deficits reported in lower extremities.

**Treatment Provided**
Soft tissue massage applied to bilateral paraspinal muscles and left quadratus lumborum (15 minutes). SNAG mobilisation performed at L4-L5 level, 3 sets of 6 repetitions. Neural mobilisation — sciatic nerve glides, 10 repetitions bilateral. Moist heat applied post-treatment for 10 minutes.

**Patient Response**
Immediate post-treatment: patient reported approximately 40% reduction in left buttock pain. Lumbar flexion reassessed and improved to approximately 80% ROM. Patient tolerated all techniques well with no adverse response. Left SLR reassessed, positive at 65° (improvement from 50°).

**Recommendations**
Continue home exercise program: hip hinge 3 sets daily, cat-cow 2 sets each morning. Hip hinge technique reviewed and corrected — patient was initiating with lumbar flexion rather than hip joint. Advised to set a timer for standing breaks every 45 minutes at workstation. Review in 1 week. Consider referral back to GP if radicular symptoms worsen.`,
    editedSummary: null,
    aiModel: "claude-sonnet-4-20250514",
    aiPromptVersion: "v1.0",
    confidenceFlags: [
      { text: "positive at 50°", reason: "Practitioner may have said 15° or 50° — audio unclear at this point" },
    ],
    createdAt: "2026-03-28T10:05:00Z",
    updatedAt: "2026-03-28T10:05:00Z",
  },
  ses_002: {
    id: "note_002",
    sessionId: "ses_002",
    clinicalSummary: `**Chief Complaint**
Patient presents with right lateral knee pain consistent with iliotibial band syndrome, worsening over the past 2 weeks of increased training load. Pain rated 6/10 during running, 2/10 at rest.

**History**
Recreational runner, training for a half marathon (race date in 6 weeks). IT band syndrome first episode 8 months ago, self-resolved with rest. Current flare-up coincided with increasing weekly mileage from 30km to 50km over 3 weeks. No prior physiotherapy for this presentation.

**Findings**
Ober's test positive right side. Lateral hip and gluteal muscle tightness on palpation, right greater than left. Noble compression test positive at 30° knee flexion. Hip abductor strength 4/5 right, 5/5 left. Single-leg squat: right hip drops into adduction, indicating weak gluteus medius. No joint line tenderness. Full knee ROM.

**Treatment Provided**
Soft tissue release to right TFL and lateral quadriceps (10 minutes). Dry needling to right gluteus medius and TFL trigger points (3 needles, 10-minute retention). Corrected foam rolling technique — patient was applying pressure directly over lateral knee which is contraindicated. Demonstrated correct proximal technique over lateral thigh only.

**Patient Response**
Post-treatment Ober's test showed mild improvement. Tenderness on Noble compression reduced from 8/10 to 5/10. Patient reported immediate reduction in lateral hip tightness. No adverse response to dry needling.

**Recommendations**
Updated home program: clamshell exercise 3 × 15 reps daily, lateral band walk 3 × 20 steps. Correct foam rolling technique reinforced. Running plan: reduce current week's mileage by 30%, maintain at reduced load for 2 weeks before gradual build. 5km easy run cleared this weekend with 10-minute warm-up walk. Return in 1 week for reassessment.`,
    editedSummary: null,
    aiModel: "claude-sonnet-4-20250514",
    aiPromptVersion: "v1.0",
    confidenceFlags: [],
    createdAt: "2026-03-27T15:05:00Z",
    updatedAt: "2026-03-27T15:05:00Z",
  },
  ses_003: {
    id: "note_003",
    sessionId: "ses_003",
    clinicalSummary: `**Chief Complaint**
Post-surgical rehabilitation following right knee ACL reconstruction (patellar tendon graft, February 6 2026). Patient is at week 8 post-op. Reports mild anterior knee discomfort with stair descent, 2/10.

**History**
ACL injury sustained during recreational soccer, confirmed on MRI. Surgery performed by Dr. Hartmann at Vancouver General. Pre-surgical physiotherapy completed (6 sessions). Patient is a high school teacher, keen to return to recreational sport. No complications reported post-surgery.

**Findings**
Knee effusion: trace, improved from last visit. ROM: flexion 125° (up from 110°), extension full. Quadriceps strength on single-leg press: 78% of contralateral side. Single-leg squat: able to perform with mild valgus collapse at depth — cued and improved with verbal feedback. Patellar mobility: adequate. No joint line tenderness. Gait pattern: near normal, mild quad avoidance pattern noted on stairs.

**Treatment Provided**
Quadriceps strengthening: leg press bilateral progressed to single-leg, 4 × 10 at 60% 1RM. Introduced single-leg squat off step progression (2-inch step), 3 × 8 with manual cuing for knee alignment. Hip strengthening: Romanian deadlift 3 × 10, lateral band walk 3 × 20. Neuromuscular control: perturbation training on BOSU, 3 × 30 seconds.

**Patient Response**
Tolerated all exercises well. Single-leg squat technique improved significantly with cueing — minimal valgus at session end. Reported anterior knee discomfort 2/10 during step-down, not worsening. No increase in effusion post-exercise.

**Recommendations**
Progress home program: add single-leg squat off step (bodyweight), 3 × 8 daily. Continue cycling for cardiovascular fitness. No impact activities yet. Return-to-sport timeline remains on track for approximately week 14 (early May). Next session: introduce lateral agility drills if strength criteria met. Reassess in 1 week.`,
    editedSummary: null,
    aiModel: "claude-sonnet-4-20250514",
    aiPromptVersion: "v1.0",
    confidenceFlags: [
      { text: "Dr. Hartmann", reason: "Surgeon's name may have been mispronounced — verify spelling with patient file" },
    ],
    createdAt: "2026-03-26T11:35:00Z",
    updatedAt: "2026-03-26T11:35:00Z",
  },
  ses_004: {
    id: "note_004",
    sessionId: "ses_004",
    clinicalSummary: `**Chief Complaint**
Patient presents with bilateral cervical and upper trapezius tension, with associated tension-type headaches occurring 2–3 times per week. Neck stiffness rated 5/10, headaches 4/10 at onset.

**History**
Office worker, 8–10 hours at computer daily. Onset of symptoms approximately 4 months ago following a change in workstation setup (new monitor, higher desk). Previous episode of similar symptoms 2 years ago resolved with massage therapy. No trauma, no radiating symptoms to upper extremities, no dizziness.

**Findings**
Cervical flexion: 70% ROM. Rotation: right 60°, left 55°. Extension restricted to 50%. Palpation: significant trigger points in bilateral upper trapezius, right levator scapulae, and suboccipital muscles. Cervical AROM: restricted in all planes with reproduction of familiar tension at end range. Thoracic posture: marked forward head posture with increased thoracic kyphosis. Shoulder elevation: full, pain-free.

**Treatment Provided**
Trigger point release: bilateral upper trapezius and right levator scapulae (manual pressure, 60–90 seconds per point). Joint mobilisation: cervical C4-C6 posteroanterior glides, grade III, 3 × 60 seconds bilateral. Soft tissue: suboccipital release technique, 5 minutes. Postural taping: kinesiotape applied to thoracic region to facilitate upright posture.

**Patient Response**
Post-treatment cervical rotation improved: right 75°, left 70°. Patient reported immediate reduction in upper trapezius tension and headache pressure. Forward head posture visibly reduced post-taping. Patient tolerated all techniques well.

**Recommendations**
Ergonomic workstation review completed during session: monitor raised by approximately 8cm using a stand (patient to source), keyboard repositioned. Home exercise: chin tucks 3 × 10 hourly, thoracic extension over foam roller 2 × 1 minute daily. Advised to remove kinesiotape after 3 days. Follow-up in 1 week. If headache frequency does not reduce within 2 weeks, consider GP referral to rule out other causes.`,
    editedSummary: null,
    aiModel: "claude-sonnet-4-20250514",
    aiPromptVersion: "v1.0",
    confidenceFlags: [],
    createdAt: "2026-03-25T09:05:00Z",
    updatedAt: "2026-03-25T09:05:00Z",
  },
};

// Helpers used by server components to simulate data fetching

function getPatientById(id: string): Patient | undefined {
  return MOCK_PATIENTS.find((p) => p.id === id);
}

export function getMockRecentSessions(limit = 10): SessionWithPatient[] {
  return MOCK_SESSIONS.slice(0, limit).map((session) => {
    const patient = getPatientById(session.patientId);
    return {
      ...session,
      patientFirstName: patient?.firstName ?? "Unknown",
      patientLastName: patient?.lastName ?? "Patient",
    };
  });
}

export function getMockSessionsThisWeek(): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  // Monday as week start
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(now.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return MOCK_SESSIONS.filter(
    (s) => new Date(s.sessionDate) >= startOfWeek
  ).length;
}

export function getMockTotalPatients(): number {
  return MOCK_PATIENTS.length;
}

export function getMockSessionById(id: string): Session | undefined {
  return MOCK_SESSIONS.find((s) => s.id === id);
}

export function getMockNoteBySessionId(sessionId: string): Note | undefined {
  return MOCK_NOTES[sessionId];
}

export function getMockPatientsWithLastSession(): PatientWithLastSession[] {
  return MOCK_PATIENTS.map((patient) => {
    const lastCompleteSession = MOCK_SESSIONS.find(
      (s) => s.patientId === patient.id && s.status === "complete"
    );
    return {
      ...patient,
      lastSessionDate: lastCompleteSession?.sessionDate ?? null,
      lastSessionSummary: lastCompleteSession
        ? (MOCK_NOTES[lastCompleteSession.id]?.clinicalSummary ?? null)
        : null,
    };
  });
}
