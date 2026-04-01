-- ── Seed: Mock patients, sessions, and detailed clinical notes ────────────────
--
-- HOW TO USE:
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Copy your user UUID
--   3. Replace the value of v_user_id below with your UUID
--   4. Paste this entire script into the SQL Editor and click Run
--
-- This script is safe to re-run. All inserts use ON CONFLICT to upsert
-- rather than error on duplicates.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- ── Replace this with your Supabase auth user UUID ──────────────────────────
  v_user_id UUID := 'e9b2ef86-6e8a-41d7-b7bc-88b0f1f82e70';

  -- ── Patient UUIDs ────────────────────────────────────────────────────────────
  v_pat_001 UUID := gen_random_uuid();  -- James Okonkwo
  v_pat_002 UUID := gen_random_uuid();  -- Maria Reyes
  v_pat_003 UUID := gen_random_uuid();  -- Liam Nguyen
  v_pat_004 UUID := gen_random_uuid();  -- Priya Sharma
  v_pat_005 UUID := gen_random_uuid();  -- Derek Walsh

  -- ── Session UUIDs ────────────────────────────────────────────────────────────
  v_ses_001 UUID := gen_random_uuid();  -- James #2   Mar 28  complete
  v_ses_002 UUID := gen_random_uuid();  -- Liam  #2   Mar 27  complete
  v_ses_003 UUID := gen_random_uuid();  -- Maria #2   Mar 26  complete
  v_ses_004 UUID := gen_random_uuid();  -- Derek #2   Mar 25  complete
  v_ses_005 UUID := gen_random_uuid();  -- Priya #1   Mar 24  error
  v_ses_006 UUID := gen_random_uuid();  -- James #1   Mar 21  complete
  v_ses_007 UUID := gen_random_uuid();  -- Maria #1   Mar 19  complete
  v_ses_008 UUID := gen_random_uuid();  -- Liam  #1   Mar 17  complete
  v_ses_009 UUID := gen_random_uuid();  -- Derek #1   Mar 14  complete
  v_ses_010 UUID := gen_random_uuid();  -- Priya #2   Mar 12  complete

  -- ── Clinical summary variables ───────────────────────────────────────────────
  v_note_001 TEXT;
  v_note_002 TEXT;
  v_note_003 TEXT;
  v_note_004 TEXT;
  v_note_006 TEXT;
  v_note_007 TEXT;
  v_note_008 TEXT;
  v_note_009 TEXT;
  v_note_010 TEXT;

BEGIN

-- ═════════════════════════════════════════════════════════════════════════════
-- CLINICAL NOTE SUMMARIES
-- ═════════════════════════════════════════════════════════════════════════════

-- ── ses_001 · James Okonkwo · L4-L5 Lower Back · Session 2 (Mar 28) ──────────
v_note_001 := $n$
**Chief Complaint**
Patient James Okonkwo, a 41-year-old software developer, presents for his second physiotherapy session reporting ongoing lower back pain with left-sided radiation into the buttock and posterior thigh. Pain is rated 4/10 at rest and increases to 7/10 with prolonged sitting beyond 30 minutes or with sustained lumbar flexion activities such as loading the dishwasher. He reports a modest improvement since his initial session one week ago, noting approximately 20% reduction in morning stiffness. He continues to experience mild paresthesia along the left L5 dermatomal distribution on waking, which typically resolves within the first hour of activity.

**History**
Known L4-L5 disc herniation with left-sided nerve root involvement confirmed via MRI in January 2025. The herniation is posterolateral with moderate canal compromise noted by the reporting radiologist. James completed a prior course of physiotherapy in February 2025 (6 sessions) with moderate improvement. His occupation requires 8 to 10 hours of seated computer work daily, which continues to be the primary aggravating factor. He commutes 45 minutes each way by car. No bowel or bladder changes have been reported. No history of corticosteroid injections or surgical consultation to date. He has a background of mild hypertension managed with lisinopril; no other relevant medical history.

**Findings**
Active lumbar flexion: improved to approximately 70% of full range of motion compared to 60% at initial assessment, pain rated 4/10 at end range. Lumbar extension: near full range with mild discomfort rated 2/10. Left lateral flexion mildly restricted. Right lateral flexion full and pain-free. Rotation: symmetrical and pain-free. Left straight leg raise (SLR) positive at 55°, provoked left posterior thigh discomfort but no reproduction of foot paresthesia at this angle. Right SLR negative. Slump test: positive on left, reproducing familiar left buttock and posterior thigh symptoms. Palpation: moderate tenderness at L4-L5 interspinous space and left paravertebral musculature at L3-S1 levels. Left quadratus lumborum attachment palpation mildly provocative. Neurological screen: left great toe extension 4+/5 (mild weakness), sensation intact throughout lower extremities bilaterally.

**Treatment Provided**
Soft tissue mobilisation applied to bilateral paraspinal musculature and left quadratus lumborum for 15 minutes, with particular focus on the thoracolumbar junction. Central posteroanterior (PA) mobilisations performed at L4 and L5 levels, grades III-IV, 3 sets of 60 seconds. Unilateral PA mobilisation applied to left L4-L5 facet joint, grade III, 2 sets. Neural mobilisation: left sciatic nerve slider technique performed in supine, 3 sets of 10 repetitions, patient reported reproduction and gradual easing of left posterior thigh tension during the technique. Therapeutic exercise: 2 sets of 10 repetitions each — bird-dog exercise with emphasis on neutral lumbar spine, dead bug with contralateral arm-leg extension. Moist heat pack applied to lumbar region for 10 minutes post-manual therapy.

**Patient Response**
Immediately post-treatment, patient reported left buttock pain reduced to 1-2/10. Lumbar flexion reassessed at approximately 80% ROM. Left SLR reassessed positive at 65° (improvement from 55°). Slump test: left side still positive but symptom intensity reduced. Great toe extension strength unchanged at 4+/5 — noted for ongoing monitoring as this may reflect persistent nerve root irritation. Patient tolerated all techniques without adverse response. He reported a general sense of reduced lumbar heaviness and improved ease of movement at the end of the session.

**Recommendations**
Home exercise program reviewed and progressed: bird-dog 3 sets of 10 daily, dead bug 3 sets of 8 daily. Hip hinge technique was re-cued — patient continues to initiate with lumbar flexion rather than posterior pelvic rotation; reinforced biomechanics using a dowel along the spine. Standing desk trial at work discussed — patient to request a sit-stand converter from employer. Advised to take a 2-minute standing or walking break every 30 minutes. Patient instructed to avoid sustained lumbar flexion loading (e.g., gardening in bent-forward position) until radicular symptoms resolve further. Follow-up in 1 week. If left great toe weakness does not improve within 3 sessions, GP referral for surgical consultation review will be considered.
$n$;

-- ── ses_002 · Liam Nguyen · IT Band Syndrome · Session 2 (Mar 27) ─────────────
v_note_002 := $n$
**Chief Complaint**
Liam Nguyen, a 27-year-old recreational runner preparing for a half marathon in 6 weeks, presents for his second physiotherapy session. His chief complaint is right lateral knee pain consistent with iliotibial band friction syndrome, rated 5/10 during running and 1/10 at rest. He reports mild improvement following last session — pain onset during his midweek run occurred at the 4km mark rather than the 2km mark, which he identifies as an improvement. He has been adherent with the home exercise program but reports difficulty maintaining hip alignment during the lateral band walk exercise.

**History**
First episode of right IT band syndrome occurred 8 months ago and resolved with a 3-week running hiatus and self-directed stretching. Current flare-up began 3 weeks ago after he increased weekly mileage from 30km to 50km over a 3-week period. He had also added weekly hill repeats to his training around the same time. No prior physiotherapy for this episode. Relevant training context: currently running 4 days per week, including one long run (18km last Sunday), one tempo session, and two easy aerobic runs. He runs in road shoes with approximately 600km accumulated mileage — shoe replacement warranted.

**Findings**
Ober's test: positive right side, mild improvement from last week. Thomas test: right hip flexor tightness noted. Hip abductor strength testing: right gluteus medius 4/5, right gluteus maximus 4+/5, left side 5/5 bilaterally. Single-leg squat (right): marked contralateral pelvic drop (Trendelenburg pattern), knee progressing significantly into valgus at 60° of flexion — worse than observed last session, likely due to post-run fatigue (patient ran 8km this morning). Noble compression test: positive at 30° right knee flexion, tenderness score 7/10 (improved from 9/10 at initial assessment). TFL palpation: marked tightness and tenderness throughout right TFL from ASIS to iliotibial tract. Lateral knee joint line: no tenderness, ruling out lateral meniscus pathology. Patellofemoral compression test: negative. McMurray test: negative bilaterally.

**Treatment Provided**
Soft tissue therapy: longitudinal and cross-friction techniques applied to right TFL and proximal IT band (10 minutes). Instrument-assisted soft tissue mobilisation (IASTM) to right lateral quadriceps and IT band using Graston-technique tool, moderate pressure, 2 sets of 2 minutes. Dry needling performed to right gluteus medius (2 needles, 10-minute retention) and right TFL trigger point (1 needle, 8-minute retention) — local twitch response obtained in both sites. Therapeutic exercise (in-session): single-leg squat with biofeedback mirror, 3 sets of 8 repetitions — patient demonstrated marked improvement in hip alignment with verbal and visual cueing. Side-lying hip abduction with resistance band, 3 sets of 15 with correct gluteus medius isolation cued.

**Patient Response**
Post-treatment Noble compression test: 4/10 (down from 7/10). Ober's test showed further improvement. Patient reported significant reduction in lateral hip tightness following soft tissue work and dry needling. Single-leg squat technique markedly improved by end of session with cueing. No adverse response to dry needling; mild expected local muscle soreness anticipated over the next 24 hours. Patient is motivated and engaged with the rehabilitation process.

**Recommendations**
Running modifications: total weekly mileage to be reduced to 35km for the next 2 weeks. Hill repeats to be suspended until the 4-week mark. Long run to be capped at 14km this weekend. Warm-up protocol mandatory: 10-minute brisk walk followed by 5 minutes of dynamic hip mobility exercises before every run. Shoe replacement to be actioned within the week — recommend visiting a specialty running store for gait analysis. Home exercise program updated: clamshell with resistance band 3 sets of 20 daily, single-leg squat (bodyweight only, with focus on hip alignment) 3 sets of 8 daily, lateral band walk 3 sets of 20 steps with emphasis on maintaining upright trunk. Ice applied to lateral knee for 10 minutes post-run. Return in 1 week for reassessment and progression.
$n$;

-- ── ses_003 · Maria Reyes · Right Knee ACL Rehab (Week 8 Post-Op) · Session 2 (Mar 26) ──
v_note_003 := $n$
**Chief Complaint**
Maria Reyes, a 53-year-old high school art teacher, presents for her second physiotherapy session at 8 weeks post right knee ACL reconstruction (patellar tendon graft, February 6, 2026, performed by Dr. Hartmann at Vancouver General Hospital). She reports anterior knee discomfort of 2/10 with stair descent and mild aching in the right knee after prolonged standing, which she rates 2-3/10. She notes meaningful functional improvement over the past week — she was able to navigate the school corridor and stand for extended periods during her teaching period without significant difficulty. Morning stiffness has resolved.

**History**
ACL rupture sustained during recreational soccer in December 2025, confirmed via MRI. She underwent patellar tendon autograft reconstruction. Pre-surgical physiotherapy was completed (6 sessions focused on quadriceps activation and swelling management). Post-surgical protocol from surgical team targets return to full activities at 9-12 months; however, Maria's primary goal is return to recreational soccer. She has no history of prior knee surgery or significant lower extremity injury. Non-smoker, no relevant medical history, BMI within normal range.

**Findings**
Gait: near-normal walking gait on flat surface, mild quadriceps avoidance pattern on stairs (right knee descending). Knee effusion: trace swelling, minimal, no ballottement. ROM: right knee flexion 125° (improved from 110° last session), extension full 0° (no extension deficit). Patellar mobility: adequate mediolateral and superoinferior glide. Quadriceps strength assessment (single-leg press): right side 78% of contralateral left side at matched load — a key rehabilitation benchmark. Single-leg squat (right): able to perform to 70° with mild valgus collapse at depth — improves with verbal cueing to maintain knee alignment. Balance: single-leg stance right 18 seconds eyes open, 8 seconds eyes closed (below normative values for age/gender). Proprioception testing: minor deficit detected on right versus left during perturbation testing. No joint line tenderness. Hamstring flexibility symmetrical bilaterally.

**Treatment Provided**
Strength and neuromuscular training (35 minutes): leg press (bilateral progressed to single-leg right), 4 sets of 10 repetitions at 60% estimated 1RM — load increased by 5kg from last session. Single-leg squat off 2-inch step, 3 sets of 8 repetitions with visual biofeedback using mirror, manual cueing for valgus correction throughout. Romanian deadlift (bilateral), 3 sets of 10 at 12kg dumbbells, focusing on hamstring engagement and neutral spine. Hip strengthening: lateral band walk 3 sets of 20 steps, side-lying hip abduction 3 sets of 15. Neuromuscular control: balance board single-leg stance 3 sets of 30 seconds, perturbation training on BOSU 3 sets of 30 seconds. Patellar mobilisations: superior, inferior, and mediolateral glides, 30 repetitions each direction to maintain patellar mobility and reduce anterior knee discomfort. Ice applied to anterior knee for 10 minutes post-exercise.

**Patient Response**
Tolerated all exercises well. Anterior knee discomfort remained at 2/10 during step exercises — did not worsen. No increase in effusion following exercise session. Single-leg squat technique notably improved by end of session — valgus collapse minimal with cued performance. Patient reported feeling more confident on the BOSU by the end of the perturbation training sets. Motivated and adherent; has been completing home exercises consistently 5-6 days per week.

**Recommendations**
Home exercise program progressed: add single-leg squat off 2-inch step (bodyweight, 3 sets of 8 daily), continue bilateral Romanian deadlift with 8-10kg dumbbells, maintain lateral band walk and hip abduction. Stationary cycling 20-25 minutes 4 times per week for cardiovascular conditioning — resistance level where the effort feels moderate, no discomfort in the knee. Pool walking permitted if accessible. Absolute restriction on impact activities, cutting movements, and pivoting remains in place. Next milestone: if quadriceps strength reaches 85% symmetry (expected at approximately week 10-12), will introduce straight-line jogging protocol. Return-to-sport timeline remains on track for approximately week 14, with full return to soccer contingent on strength and hop test criteria. Follow-up in 1 week.
$n$;

-- ── ses_004 · Derek Walsh · Cervical and Upper Trapezius Tension · Session 2 (Mar 25) ──
v_note_004 := $n$
**Chief Complaint**
Derek Walsh, a 35-year-old software developer, presents for his second session with cervical spine stiffness and bilateral upper trapezius tension, rated 4/10 at rest and 6/10 at end of a workday. He reports a meaningful reduction in headache frequency since his first session one week ago — previously experiencing 2 to 3 tension headaches per week, he reports only 1 mild headache in the past 7 days. He notes his neck feels less "locked up" in the morning but stiffness returns by mid-afternoon. He has been applying the kinesiotape applied last session, which he found helpful; it has now been removed as instructed at the 3-day mark.

**History**
Onset of current symptoms approximately 4 months ago, coinciding with a workstation change to a higher desk and larger monitor. Works 8 to 10 hours per day predominantly at a computer. He had a similar episode approximately 2 years ago that resolved within 4 to 6 weeks with massage therapy and spontaneous postural improvement. No trauma, no upper extremity neurological symptoms, no dizziness or visual disturbances. No history of cervical spine imaging. No relevant medical history. Non-smoker; moderate recreational physical activity (gym 2x/week).

**Findings**
Cervical active ROM: flexion 70% (unchanged from last session), extension 60% (improved from 50%), right rotation 65° (improved from 60°), left rotation 65° (improved from 55°). Left lateral flexion slightly limited compared to right. Palpation: residual tenderness at bilateral upper trapezius (reduced from last session), right levator scapulae, and bilateral suboccipital musculature. Cervicogenic headache screen: suboccipital palpation still mildly provocative, reproducing mild occipital pressure sensation. Forward head posture: improved since initial assessment — cervical protrusion measured against wall approximately 3cm (down from 5cm). Shoulder mobility: full range bilaterally, no pain. Upper limb tension test 1 (ULTT1): negative bilaterally, confirming no peripheral neural involvement. Thoracic kyphosis: mild but improved with active postural correction.

**Treatment Provided**
Cervical joint mobilisation: C3-C4 and C5-C6 posteroanterior glides, grade III-IV, 3 sets of 60 seconds bilaterally. Upper cervical distraction: manual traction technique applied in supine, 3 sets of 30 seconds, patient reported immediate reduction in suboccipital pressure. Soft tissue therapy: suboccipital release technique using bilateral sustained pressure to rectus capitis and obliquus capitis inferior for 5 minutes. Trigger point release to right levator scapulae, 2 sustained compressions of 90 seconds each. Therapeutic exercise performed in-session: deep neck flexor activation (chin tuck + cranio-cervical flexion), 3 sets of 10 with 5-second hold. Thoracic spine manipulation performed at T3-T4 with patient consent — audible cavitation obtained bilaterally, patient reported immediate improvement in upper thoracic mobility. Fresh kinesiotape applied to thoracic region using facilitation technique.

**Patient Response**
Post-treatment cervical rotation: right 75°, left 75° (improvement bilaterally). Cervical extension improved to 75%. Suboccipital palpation: no longer reproduces headache symptoms. Patient reported the thoracic manipulation produced immediate relief of upper back tightness. Patient engaged positively with deep neck flexor exercise, noting it felt "different" from general neck exercises he has tried before. No adverse responses.

**Recommendations**
Ergonomic follow-up: patient confirmed monitor raise is in place using an adjustable stand. Additional recommendation to position keyboard and mouse closer to body to reduce shoulder elevation during typing. Home program: deep neck flexor chin tuck 3 sets of 10 with 5-second hold every 2 to 3 hours, thoracic extension over foam roller 2 sets of 1-2 minutes morning and evening, upper trapezius stretch 3 sets of 30 seconds each side twice daily. Kinesiotape to remain in place for 3 days. Advised to use a small lumbar support cushion in the car to prevent sustained thoracic flexion during commute. GP referral not indicated at this time given positive response to treatment. If headache frequency does not continue to reduce, GP review to be discussed. Follow-up in 1 week; if improvement trajectory continues, may consider moving to 2-week intervals thereafter.
$n$;

-- ── ses_006 · James Okonkwo · L4-L5 Lower Back · Session 1 (Mar 21) ──────────
v_note_006 := $n$
**Chief Complaint**
James Okonkwo presents for his initial physiotherapy assessment with a primary complaint of lower back pain with radiation into the left buttock and posterior thigh, onset approximately 6 weeks prior. He rates his pain as 5-6/10 at worst, occurring most notably during and after prolonged sitting and upon transitioning from sitting to standing. He reports difficulty tying his shoes and getting in and out of the car. Morning stiffness lasting approximately 45 to 60 minutes is present most days. He has had no physiotherapy for this episode and has been managing with over-the-counter ibuprofen (400mg as needed, approximately 4 days per week).

**History**
MRI of the lumbar spine performed in January 2025 confirms L4-L5 posterior disc protrusion with left-sided foraminal encroachment. Reporting radiologist noted moderate canal compromise. James had a prior episode of lower back pain in 2022 that resolved spontaneously over 6 to 8 weeks without formal intervention. He is a software developer working entirely remotely and estimates 9 to 10 hours per day at his desk. He does not exercise regularly and has a BMI of 27. Mild hypertension managed with lisinopril 5mg daily. No bowel or bladder symptoms have been reported. No prior spinal surgery.

**Findings**
Initial assessment findings. Standing posture: mild loss of lumbar lordosis, forward head position. Gait: antalgic, slight lean to right. Lumbar flexion: severely restricted at approximately 40% ROM, pain-limited, reports 7/10 at end range with reproduction of left buttock pain. Extension: approximately 60% ROM, discomfort 3/10 centrally. Left lateral flexion: restricted 50% with reproduction of left buttock symptoms. Right lateral flexion: restricted 70% ROM, no radiation. Left SLR: positive at 40°, strongly positive, reproduces left posterior thigh pain and mild paresthesia to the mid-calf. Right SLR: negative. Slump test: positive on left. Neurological screen: left great toe extension 4/5 (mild weakness compared to right), sensation decreased along the dorsum of left foot and left first web space, consistent with L5 nerve root involvement. Palpation: marked tenderness at L4-L5 and L5-S1 interspinous spaces, bilateral paraspinal muscle hypertonicity markedly elevated, left worse than right, left QL extremely guarded and tender.

**Treatment Provided**
Given the acute nature and neurological findings, treatment was conservative and education-focused. Patient education: explanation of disc pathology, natural history of lumbar disc herniation (positive prognosis), and importance of avoiding end-range lumbar flexion. Positioning advice: demonstrated prone lying for lumbar extension, advised to trial for 10 minutes morning and evening if tolerated. Neural mobilisation: gentle sciatic nerve slider in supine (knee extension with ankle dorsiflexion), introduced at low amplitude, 2 sets of 8 repetitions — patient tolerated with mild left posterior thigh reproduction which eased with repetition. Soft tissue: bilateral paraspinal soft tissue release, light pressure, 10 minutes. No joint mobilisation performed at this stage given acute irritability. Ice recommended for acute pain management — applied for 10 minutes post-treatment.

**Patient Response**
Patient tolerated the session well. Post-treatment reassessment: SLR improved marginally to 45°. Patient reported lumbar heaviness reduced somewhat. He was visibly anxious about the neurological findings; took time to reassure him of the favourable natural history of disc herniations with appropriate conservative management. He understood and was receptive to the advice. Left great toe weakness and sensory change discussed — advised to monitor and report any worsening.

**Recommendations**
Avoid prolonged sitting beyond 20-30 minutes; stand and walk briefly every 30 minutes. Cease ibuprofen if possible, or take with food; consider discussing with GP for a short course of a nerve pain medication such as gabapentin if radicular symptoms are affecting sleep. Pillow positioning at night: side-lying with a pillow between the knees recommended. Home program introduced: prone press-ups (if tolerated) 2 sets of 10 morning and evening, sciatic nerve sliders 2 sets of 8 morning. Avoid loading the spine in flexion (e.g., do not lift objects off the floor by bending forward). Advised to ice as needed for pain management. Return in 1 week. Prognosis discussed — majority of lumbar disc herniations with radiculopathy improve significantly within 6-12 weeks of conservative management.
$n$;

-- ── ses_007 · Maria Reyes · Right Knee ACL Rehab (Week 6 Post-Op) · Session 1 (Mar 19) ──
v_note_007 := $n$
**Chief Complaint**
Maria Reyes presents for her first physiotherapy session at this clinic, 6 weeks post right knee ACL reconstruction (patellar tendon graft, February 6, 2026). She was discharged from the hospital-based post-surgical physiotherapy program after 4 sessions and has been referred here for ongoing rehabilitation. She reports anterior knee pain rated 3/10 with stair descent and rising from a low chair. Some residual swelling is present. She is concerned about the pace of her recovery and keen to understand the expected timeline for return to recreational soccer.

**History**
ACL rupture during recreational soccer, confirmed by MRI December 2025. Patellar tendon autograft procedure performed by Dr. Hartmann (Vancouver General). Hospital-based physiotherapy initiated at 2 weeks post-op: focused on effusion management, ROM restoration, and quadriceps activation. Pre-surgical quadriceps strength was normal bilaterally. Medical history: no prior lower extremity surgery or significant injury. Non-smoker, physically active pre-injury (recreational soccer 2x/week, gym 1x/week). No relevant medical comorbidities.

**Findings**
Gait: mild quadriceps avoidance pattern present (right), reducing cadence and step length on right side. Knee effusion: mild to moderate, ballottement trace positive. ROM: right knee flexion 105° (limited compared to contralateral 140°), extension 0° (full, no deficit). Patellar mobility: slightly restricted superiorly, other directions adequate. Quadriceps strength (manual muscle test): 4/5 right, 5/5 left. Single-leg press: patient unable to isolate single-leg right confidently at this stage; bilateral test suggests approximately 60% relative load tolerance on right. Balance: single-leg stance right 10 seconds eyes open (significantly below age-normative values). Scar assessment: patellar tendon harvest site scar mildly adhered, tender to palpation along the inferior pole of patella. No signs of infection.

**Treatment Provided**
Baseline assessment session with initiation of formal strengthening program. Scar mobilisation: superior and inferior glide to patellar tendon harvest site scar, 2 minutes, tolerated. Patellar mobilisations: mediolateral, superoinferior, 30 repetitions each. Quadriceps strengthening: terminal knee extension with TheraBand (seated), 3 sets of 15; straight leg raise, 3 sets of 15; mini squat (0-40°) bilateral, 3 sets of 12. Hip strengthening: clamshell 3 sets of 15, lateral band walk 3 sets of 20 steps. Balance training: bilateral platform balance 3 sets of 30 seconds, progressing to foam surface. Patient education: comprehensive discussion of ACL rehabilitation stages, realistic return-to-sport timeline (9-12 months from surgery for safe return to cutting sports), importance of meeting strength and neuromuscular criteria before progressing to impact activities.

**Patient Response**
Patient tolerated initial strengthening well. Mild anterior knee discomfort 2-3/10 during terminal knee extension, within acceptable range. No increase in effusion post-session. Patient was initially discouraged when return-to-sport timeline was discussed (she had hoped for 6 months), but responded well to a structured explanation of the criteria-based approach and the evidence for slower rehabilitation reducing re-injury risk. She left the session feeling better informed and with clear goals to work toward.

**Recommendations**
Home exercise program established: terminal knee extension 3 sets of 15 daily, straight leg raise 3 sets of 15 daily, mini squat 3 sets of 12 daily, clamshell 3 sets of 15 daily. Stationary cycling 15-20 minutes daily on low resistance — essential for ROM restoration and cardiovascular maintenance. Ice post-exercise 10 minutes if swelling increases. Walking: flat surfaces encouraged, avoid stairs beyond necessity for now. Key milestone for next session: aim for 115-120° knee flexion ROM, reduce effusion to trace or absent. Return in 1 week.
$n$;

-- ── ses_008 · Liam Nguyen · IT Band Syndrome · Session 1 (Mar 17) ─────────────
v_note_008 := $n$
**Chief Complaint**
Liam Nguyen, a 27-year-old recreational distance runner, presents for an initial assessment of right lateral knee pain that has been limiting his running for the past 3 weeks. He describes a sharp, burning pain along the lateral aspect of the right knee that begins reliably at the 2km mark of every run and forces him to stop running or significantly slow down. Pain is rated 7/10 at worst during running, 0/10 at rest and with all activities of daily living. He has a half marathon scheduled in 9 weeks and is concerned about whether he will be able to complete it.

**History**
Prior episode of right IT band syndrome 8 months ago, self-managed with a 3-week running break and spontaneous resolution. No formal physiotherapy assessment at that time. Current episode began 3 weeks ago following a rapid increase in training volume — weekly mileage increased from 30km to 50km over 3 weeks, with the addition of weekly hill repetition workouts. He is currently running 4 days per week. He describes his running surface as predominantly road. Running shoes: approximately 600km accumulated, road trainers, no recent shoe change. No other lower limb injuries or symptoms. No relevant medical history.

**Findings**
Standing posture: mild bilateral genu valgum noted statically. Single-leg squat assessment (right): significant contralateral pelvic drop (Trendelenburg sign), excessive knee valgus progression throughout the movement, poor single-leg stability at mid-range. Hip abductor strength: right gluteus medius 3+/5 (significantly weak), right gluteus maximus 4/5, left side 5/5 bilaterally. TFL flexibility: right side notably tighter than left on modified Thomas test. Ober's test: strongly positive right side. Noble compression test (right): positive at 30°, extreme tenderness rated 9/10. Lateral knee joint line palpation: no tenderness. McMurray test: negative bilaterally. Patellofemoral compression test: negative. Foam rolling technique assessed: patient was applying direct pressure over the lateral knee joint — technique contraindicated as explained.

**Treatment Provided**
Education: comprehensive explanation of IT band syndrome pathology (compression and friction at the lateral femoral epicondyle), contributing factors (training load spike, hip abductor weakness, running mechanics), and treatment approach. Addressed patient's concern about the half marathon directly — achievable with modifications if rehabilitation is progressed appropriately. Soft tissue mobilisation: TFL and lateral quadriceps myofascial release techniques, 10 minutes. Trigger point release: right gluteus medius sustained compression (2 points, 90 seconds each) — significant tenderness noted. Therapeutic exercise introduced in session: sidelying hip abduction (basic, no resistance), 3 sets of 10 to assess technique and establish baseline. Correct foam rolling technique taught: applied to lateral thigh (proximal to lateral knee epicondyle) only.

**Patient Response**
Post-treatment Noble compression test tenderness reduced from 9/10 to 7/10. Patient responded well to education, particularly regarding the role of hip abductor weakness — he had previously believed IT band syndrome was solely a stretching and foam rolling issue. He is highly motivated to comply with the home program. He was advised to suspend running completely for 1 week to allow acute irritability to settle before resuming with a modified protocol. He was initially resistant but accepted the plan after a discussion of the risks of running through this presentation.

**Recommendations**
Running: complete rest from running for 7 days. Ice: lateral knee after any prolonged activity, 10 minutes. Home exercise program: clamshell 3 sets of 15 daily, corrected foam rolling to lateral thigh 1-2 minutes each side daily (avoiding the knee), hip flexor stretch 3 sets of 30 seconds each side. Shoe replacement recommended — visit a specialty running store for fitting within the next 2 weeks, ideally before return to running. After the 7-day rest period, begin running with 5km maximum for the first week back, on flat surfaces only. Monitor the 2km mark closely — if pain exceeds 3/10 during the test run, cease and contact the clinic. Return in 1 week for reassessment and progression of strengthening program.
$n$;

-- ── ses_009 · Derek Walsh · Cervical and Upper Trapezius · Session 1 (Mar 14) ──
v_note_009 := $n$
**Chief Complaint**
Derek Walsh, a 35-year-old software developer, presents for initial physiotherapy assessment of bilateral neck stiffness and upper trapezius tension, rated 6/10 at end of day. He reports associated tension-type headaches occurring 2 to 3 times per week for the past 3 months, rated 4-5/10 in intensity, typically originating at the base of the skull and radiating to the frontal region. Headaches last 2 to 6 hours each and are partially relieved by paracetamol. He reports that the neck stiffness is present most of the day and is significantly worse during periods of intense focus at the computer. He has not sought any prior medical consultation for this episode.

**History**
Onset of symptoms 4 months ago, coinciding with a workstation change — new desk (higher than previous), larger monitor, and change to a mechanical keyboard. Works 8 to 10 hours per day entirely from home. A similar episode occurred approximately 2 years ago and resolved over 4 to 6 weeks with massage therapy. He reports his gym routine (2x/week, resistance training) has not been affected by the neck symptoms. No trauma or mechanism of injury. No upper extremity neurological symptoms (no numbness, tingling, or weakness in the arms or hands). No dizziness, visual changes, or difficulty swallowing. No relevant medical history. Non-smoker.

**Findings**
Standing posture: marked forward head posture, estimated 5cm cervical protrusion from wall standing position. Increased thoracic kyphosis. Shoulders: mild bilateral elevation with upper trapezius dominance. Cervical active ROM: flexion 55% of normal range, extension 50% — both pain-limited with reproduction of posterior cervical tension. Right rotation: 60°, left rotation: 55°. Lateral flexion: symmetrically restricted approximately 65% bilaterally. Cervicogenic headache screen: palpation of suboccipital musculature and upper cervical joints (C1-C3) reproduces familiar headache pressure in the occipital and posterior cervical region — strongly positive. Upper limb tension test 1 (ULTT1): negative bilaterally. Shoulder abduction test: negative bilaterally, ruling out cervical radiculopathy. Palpation: extreme tenderness and palpable nodular tension in bilateral upper trapezius with multiple active trigger points. Right levator scapulae: moderate tenderness and guarding from C2 spinous process to scapular angle. Suboccipital musculature: bilateral tenderness, left greater than right.

**Treatment Provided**
Cervical joint mobilisation: C3-C4 PA glides grade II-III, 3 sets of 60 seconds, gentle amplitude given irritability. Upper cervical articulation: rotational mobilisation C1-C2 right, grade II, 2 sets of 30 seconds. Soft tissue: upper trapezius myofascial release bilateral, 8 minutes. Suboccipital inhibition technique: bilateral sustained digital pressure, 5 minutes — patient reported progressive reduction in suboccipital tension and headache during technique. Trigger point release: right levator scapulae, 1 sustained compression 90 seconds. Postural education: explanation of the relationship between forward head posture, cervical joint load (1cm of forward head position increases compressive load on the cervical spine by approximately 2-3kg), and headache generation. Postural taping: kinesiotape applied to thoracic region using inhibition technique (bilateral paraspinals, T2-T8).

**Patient Response**
Post-treatment cervical ROM: rotation improved to right 70°, left 65°. Extension improved to 65%. Patient reported significant reduction in upper trapezius tension and occipital pressure following suboccipital inhibition technique. He noted the treatment felt different from the massage therapy he had received previously and identified it as more targeted. Patient appeared genuinely engaged with the postural education and expressed motivation to address his workstation setup.

**Recommendations**
Workstation assessment: monitor must be raised to eye level (recommend using monitor stand or riser, approximately 8cm based on assessment of patient at their workstation via description). Document and laptop stand also recommended if secondary screen is used on a laptop. Home program: chin tuck exercise 3 sets of 10 with 5-second hold every 2 hours during the workday, upper trapezius stretch 3 sets of 30 seconds 2x daily, thoracic extension over foam roller 2 sets of 1 minute morning and evening. Kinesiotape: to remain in place for 3 days. Headache diary: requested to track frequency, duration, and severity for the next week. If headache frequency does not reduce within 2 weeks of treatment, GP review to rule out other contributing factors (e.g., tension-type headache, cervicogenic headache requiring imaging). Follow-up in 1 week.
$n$;

-- ── ses_010 · Priya Sharma · Bilateral Shoulder Mobility Assessment (Mar 12) ──
v_note_010 := $n$
**Chief Complaint**
Priya Sharma, a 61-year-old retired accountant, presents for an initial assessment of bilateral shoulder pain and restricted mobility, with the right side more severely affected. She describes a deep, aching pain in the right shoulder rated 5/10 at rest and 8/10 with overhead reaching, behind-the-back movements, and dressing activities. Left shoulder is mildly symptomatic at 2/10 with similar provocative movements. She reports difficulty reaching items on high shelves, fastening a bra, and combing the back of her hair. Onset was approximately 8 months ago for the right shoulder with a more recent onset (3 months ago) for the left shoulder. She has had no prior physiotherapy for this presentation.

**History**
No specific mechanism of injury for either shoulder; onset was insidious and gradual. She had a right shoulder ultrasound performed 6 months ago by her GP, which showed no rotator cuff tear but reported mild subacromial bursitis. She was advised to take ibuprofen (which she takes intermittently) and to follow up with physiotherapy — she is presenting now. Family history: mother had bilateral adhesive capsulitis in her 60s. She has type 2 diabetes managed with metformin 1000mg daily (relevant as diabetes is a known risk factor for adhesive capsulitis). No prior shoulder surgery or significant trauma. She is a recreational gardener and yoga practitioner (activity now significantly limited by her shoulder symptoms).

**Findings**
Right shoulder active ROM: flexion 105° (normal 180°), abduction 90° (normal 180°), external rotation 25° (normal 60-90°), internal rotation limited to L3 vertebral level (normal to T7-T9). Pain rated 6/10 at end range of each movement with a firm capsular end feel. Right shoulder passive ROM closely mirrors active — minimal discrepancy, consistent with true joint restriction rather than pain inhibition. Left shoulder active ROM: flexion 150°, abduction 145°, external rotation 50°, internal rotation to T10. Left shoulder passive ROM: full in all directions (unrestricted passive), suggesting the left presentation is primarily pain-related rather than capsular restriction. Impingement testing: right Neer's sign positive, right Hawkins-Kennedy positive, left Neer's mildly positive. Rotator cuff strength testing: right shoulder pain-limited throughout testing (all rotator cuff muscles 3+/5 due to pain). Left shoulder: full strength bilaterally. Biceps tendon palpation: mildly tender right shoulder. Cervical screen: cervical rotation and upper extremity tension testing negative bilaterally.

**Treatment Provided**
This initial session focused on thorough assessment, patient education, and introduction of gentle mobilisation. Joint mobilisation: right glenohumeral inferior glides grade II, 3 sets of 60 seconds — tolerated with 4/10 discomfort. Right anterior capsule stretch (posterior cuff stretching in lateral rotation), gentle grade I-II, 2 sets of 30 seconds. Left shoulder: posterior capsule stretch and circumduction 2 sets of 10 repetitions as a maintenance technique. Soft tissue: right posterior shoulder and periscapular musculature release, 8 minutes. Scapulothoracic mobilisation: right scapular mobilisation in side-lying (elevation, depression, protraction, retraction), 3 sets of 10 each direction. Exercise: scapular retraction 3 sets of 10, pendulum exercises right (Codman technique) introduced and practiced.

**Patient Response**
Post-treatment right shoulder flexion improved to 115° (from 105°). External rotation improved to 35° (from 25°). Patient reported the inferior glides produced significant relief during the technique and that the shoulder felt noticeably "freer" post-treatment, though she acknowledged this is likely temporary at this stage. She was appreciative of the thorough explanation and visibly relieved to understand the likely diagnosis and treatment pathway.

**Recommendations**
Clinical impression: right shoulder presentation is consistent with primary adhesive capsulitis (frozen shoulder), likely in the freezing-to-frozen phase, consistent with the 8-month history and capsular pattern of restriction. Left shoulder: early-stage capsulitis cannot be excluded; will monitor. Patient education provided: natural history of adhesive capsulitis explained (12-24 months total duration typical), role of physiotherapy in reducing duration and improving function, importance of gentle daily movement to prevent further contracture. Home exercise program: pendulum exercises 3 sets of 3 minutes daily, progressive shoulder flexion wall walks 3 sets of 10 daily (mark the highest point each day), internal rotation towel stretch 3 sets of 30 seconds daily (gentle sustained). Continue ibuprofen as directed by GP on a scheduled basis if tolerated, particularly 30 minutes before exercises. GP referral letter to be dictated to request consideration of a corticosteroid injection into the right glenohumeral joint (strong evidence for reducing pain in the freezing/frozen phase and facilitating physiotherapy). Follow-up in 1 week. Prognosis and realistic expectations for recovery timeline discussed at length.
$n$;


-- ═════════════════════════════════════════════════════════════════════════════
-- DATA INSERTS
-- ═════════════════════════════════════════════════════════════════════════════

-- ── Users row (matches your auth.users entry) ─────────────────────────────────
INSERT INTO users (id, email, full_name, clinic_name)
VALUES (v_user_id, 'sarah.chen@westcoastphysio.ca', 'Sarah Chen', 'West Coast Physiotherapy')
ON CONFLICT (id) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  clinic_name = EXCLUDED.clinic_name;

-- ── Patients ──────────────────────────────────────────────────────────────────
INSERT INTO patients (id, user_id, first_name, last_name, date_of_birth, email, phone, notes, created_at, updated_at) VALUES
  (v_pat_001, v_user_id, 'James', 'Okonkwo', '1985-03-14', 'james.okonkwo@email.com', '604-555-0101',
   'History of lower back pain, L4-L5 disc herniation confirmed MRI Jan 2025. Responds well to soft tissue work and neural mobilisation. Software developer, prolonged sitting is primary aggravator.',
   '2025-09-05T09:00:00Z', '2025-09-05T09:00:00Z'),

  (v_pat_002, v_user_id, 'Maria', 'Reyes', '1972-11-28', 'm.reyes@email.com', '604-555-0102',
   'Post-surgical rehab, right knee ACL reconstruction (patellar tendon graft, Feb 6 2026, Dr. Hartmann, VGH). Goal: return to recreational soccer. Currently week 8 post-op.',
   '2025-09-10T10:00:00Z', '2025-09-10T10:00:00Z'),

  (v_pat_003, v_user_id, 'Liam', 'Nguyen', '1998-07-02', 'liam.n@email.com', '604-555-0103',
   'Recreational runner, recurring right IT band syndrome. Half marathon goal. Significant right hip abductor weakness. Needs ongoing load management education.',
   '2025-10-01T11:00:00Z', '2025-10-01T11:00:00Z'),

  (v_pat_004, v_user_id, 'Priya', 'Sharma', '1965-01-19', 'priya.sharma@email.com', '604-555-0104',
   'Bilateral shoulder pain, right greater than left. Likely right adhesive capsulitis (freezing/frozen phase). Type 2 diabetes (metformin). GP referral sent for right shoulder corticosteroid injection.',
   '2025-10-15T09:30:00Z', '2025-10-15T09:30:00Z'),

  (v_pat_005, v_user_id, 'Derek', 'Walsh', '1990-05-30', NULL, '604-555-0105',
   'Cervical and upper trapezius tension with tension-type headaches. Office worker, significant forward head posture and thoracic kyphosis. Responds well to cervical mobilisation and postural taping. Prefers morning appointments.',
   '2026-01-08T08:00:00Z', '2026-01-08T08:00:00Z')

ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name  = EXCLUDED.last_name,
  notes      = EXCLUDED.notes;

-- ── Sessions ──────────────────────────────────────────────────────────────────
INSERT INTO sessions (id, user_id, patient_id, session_date, duration_minutes, status, error_message, created_at, updated_at) VALUES
  (v_ses_001, v_user_id, v_pat_001, '2026-03-28T09:00:00Z', 50, 'complete', NULL,                                         '2026-03-28T09:00:00Z', '2026-03-28T10:00:00Z'),
  (v_ses_002, v_user_id, v_pat_003, '2026-03-27T14:00:00Z', 45, 'complete', NULL,                                         '2026-03-27T14:00:00Z', '2026-03-27T15:00:00Z'),
  (v_ses_003, v_user_id, v_pat_002, '2026-03-26T10:30:00Z', 60, 'complete', NULL,                                         '2026-03-26T10:30:00Z', '2026-03-26T11:30:00Z'),
  (v_ses_004, v_user_id, v_pat_005, '2026-03-25T08:00:00Z', 45, 'complete', NULL,                                         '2026-03-25T08:00:00Z', '2026-03-25T09:00:00Z'),
  (v_ses_005, v_user_id, v_pat_004, '2026-03-24T13:00:00Z', 55, 'error',    'Transcription failed: audio file corrupted.','2026-03-24T13:00:00Z', '2026-03-24T14:00:00Z'),
  (v_ses_006, v_user_id, v_pat_001, '2026-03-21T09:00:00Z', 50, 'complete', NULL,                                         '2026-03-21T09:00:00Z', '2026-03-21T10:00:00Z'),
  (v_ses_007, v_user_id, v_pat_002, '2026-03-19T11:00:00Z', 60, 'complete', NULL,                                         '2026-03-19T11:00:00Z', '2026-03-19T12:00:00Z'),
  (v_ses_008, v_user_id, v_pat_003, '2026-03-17T15:30:00Z', 45, 'complete', NULL,                                         '2026-03-17T15:30:00Z', '2026-03-17T16:15:00Z'),
  (v_ses_009, v_user_id, v_pat_005, '2026-03-14T08:00:00Z', 45, 'complete', NULL,                                         '2026-03-14T08:00:00Z', '2026-03-14T09:00:00Z'),
  (v_ses_010, v_user_id, v_pat_004, '2026-03-12T13:30:00Z', 50, 'complete', NULL,                                         '2026-03-12T13:30:00Z', '2026-03-12T14:30:00Z');

-- ── Notes (detailed clinical summaries for all complete sessions) ─────────────
INSERT INTO notes (session_id, clinical_summary, ai_model, ai_prompt_version, confidence_flags, created_at, updated_at) VALUES

  (v_ses_001, v_note_001, 'claude-sonnet-4-20250514', 'v1.0',
   '[{"text": "positive at 55°", "reason": "Unclear whether SLR was positive at 50° or 55° — audio slightly unclear at this point in recording"}]'::jsonb,
   '2026-03-28T10:05:00Z', '2026-03-28T10:05:00Z'),

  (v_ses_002, v_note_002, 'claude-sonnet-4-20250514', 'v1.0',
   '[]'::jsonb,
   '2026-03-27T15:05:00Z', '2026-03-27T15:05:00Z'),

  (v_ses_003, v_note_003, 'claude-sonnet-4-20250514', 'v1.0',
   '[{"text": "Dr. Hartmann", "reason": "Surgeon surname may have been mispronounced — verify exact spelling with patient referral documentation"}]'::jsonb,
   '2026-03-26T11:35:00Z', '2026-03-26T11:35:00Z'),

  (v_ses_004, v_note_004, 'claude-sonnet-4-20250514', 'v1.0',
   '[]'::jsonb,
   '2026-03-25T09:05:00Z', '2026-03-25T09:05:00Z'),

  (v_ses_006, v_note_006, 'claude-sonnet-4-20250514', 'v1.0',
   '[{"text": "4/5 left great toe extension", "reason": "Neurological finding — practitioner mentioned this twice with slightly different grading, recorded as 4/5"}]'::jsonb,
   '2026-03-21T10:05:00Z', '2026-03-21T10:05:00Z'),

  (v_ses_007, v_note_007, 'claude-sonnet-4-20250514', 'v1.0',
   '[]'::jsonb,
   '2026-03-19T12:05:00Z', '2026-03-19T12:05:00Z'),

  (v_ses_008, v_note_008, 'claude-sonnet-4-20250514', 'v1.0',
   '[]'::jsonb,
   '2026-03-17T16:20:00Z', '2026-03-17T16:20:00Z'),

  (v_ses_009, v_note_009, 'claude-sonnet-4-20250514', 'v1.0',
   '[]'::jsonb,
   '2026-03-14T09:05:00Z', '2026-03-14T09:05:00Z'),

  (v_ses_010, v_note_010, 'claude-sonnet-4-20250514', 'v1.0',
   '[{"text": "25° external rotation", "reason": "ROM measurement mentioned quickly — could be 25° or 35°, recorded as 25° based on context of frozen shoulder presentation"}]'::jsonb,
   '2026-03-12T14:35:00Z', '2026-03-12T14:35:00Z')

ON CONFLICT (session_id) DO UPDATE SET
  clinical_summary   = EXCLUDED.clinical_summary,
  ai_model           = EXCLUDED.ai_model,
  ai_prompt_version  = EXCLUDED.ai_prompt_version,
  confidence_flags   = EXCLUDED.confidence_flags,
  updated_at         = now();

END $$;
