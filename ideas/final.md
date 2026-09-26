# Final: Top 3 (win-focused redo)

3 rounds, 35 subagent calls. Weights: Impact 2, Demo 2, Theme 1.5, Novelty 1.5, Feasibility 1, Research 0.5. Scores are round-3 (Judge A hackathon judge + Judge B caregiver, 1-10 weighted). Top score across rounds: 7.32 -> 7.41 -> 7.26. Per-idea detail in `round-1.md` to `round-3.md`.

Two of the three finalists are siblings (both from Rest Block). #3 comes from a different lineage.

---

## 1. Rest Block: Last Slot (R3-1): 7.26 (A 7.18 / B 7.35)

**Pitch.** A caregiver's week is a grid of care tasks, and the AI splits it into 30-60 minute chunks with one goal: free one uninterrupted rest window, not scattered minutes. Family and student volunteers claim tasks live, and the app flags the single "last slot" still blocking the window. When a student claims it, the grid lights up: "Saturday 1-4pm is yours", from 0 free hours in a row to 3.

**Strongest evidence.**
- Our survey: 66% provide 21+ hours of care per week (the starting bar).
- ~40% of caregivers say respite services would help; ~1 in 4 feel isolated ([AARP Maryland caregiving report, verified](https://www.aarp.org/states/maryland/caregiving-report/)).
- Lotsa Helping Hands and similar tools are crowded task calendars ([verified](https://lotsahelpinghands.com/)); none found that computes a rest window or flags the last blocking slot.

**Biggest risk.** Theme fit is thin (6/10 from both judges): students fill one slot in a family plan, which is less of a Day of Service event. Also, the language-match badge stretches our 68% support-group finding to task help, so drop that claim.

**2-minute demo.**
1. 0:00 Hook: 66% give 21+ hrs/week; a caregiver types "my week".
2. 0:20 AI turns it into a task grid; the goal window is outlined: Sat 1-4pm, "0 hrs free in a row".
3. 0:40 Family view: a relative claims 2 of 3 tasks; the grid shows "one task from rest".
4. 1:05 Switch to the student view: the last-slot flag, a student taps Claim.
5. 1:25 Back on the caregiver screen the window lights up: "Saturday 1-4pm is yours." Before/after bar: 0 to 3 hours.
6. 1:45 Close on the safety line (low-contact tasks, teacher-verified students).

Build: Tasks (day, slot, status, claimer) plus a Week view. Cut: auto-rescheduling, reminders, verification.

---

## 2. Rest Block Bank (R3-2): 7.26 (A 7.47 / B 7.06)

**Pitch.** A Day of Service board for many caregivers at once. Each caregiver, shown by alias, has one target rest window, and the AI breaks the chores around it into 30-60 minute tasks that can be done remotely or at the event: calls, refill requests, meal-prep batches, form help. Student teams claim tasks, family confirms, and a projected counter shows rest windows unlocked and uninterrupted hours returned.

**Strongest evidence.**
- Family caregivers average 27 hrs/week; 24% give 40+ hrs ([AARP/NAC 2025, verified](https://www.aarp.org/pri/topics/ltss/family-caregiving/family-caregiving-in-us-2025/)).
- 49.5 billion hours of family care in 2024, valued at about $1 trillion ([AARP, verified](https://www.aarp.org/press/releases/2026-03-26-AARP-Economic-Value-Of-Family-Caregiving-Report.html)).
- Nearest competitor is one-to-one volunteer respite matching ([Center for Volunteer Caregiving, verified](https://volunteercaregiving.org/programs/)); no multi-caregiver AI board with a live counter found.

**Biggest risk.** Build scope: 4 entities plus the window computation (feasibility 5-6). Cut to 2-3 demo caregivers and skip team scoring.

**2-minute demo.**
1. 0:00 Hook: 63M caregivers; show 3 aliased caregivers, each with a target rest window and 0 hours.
2. 0:20 A caregiver's backlog is split by AI into tasks (calls, refills, meal prep).
3. 0:45 Student teams claim tasks on their phones; family confirms one.
4. 1:15 Projected counter ticks up; caregiver grids flip to "yours".
5. 1:45 Big number: windows unlocked and hours returned.

---

## 3. Respite Sprint (R3-3): 7.21 (A 7.29 / B 7.12)

**Pitch.** A live Day of Service scoreboard pointed at caregiver hours instead of home visits, so no strangers enter homes. Caregivers submit aliased weekly backlogs, and the AI splits them into tasks students can do on site: batch-cook freezer meals, call to book rides, fill out forms, prep pill-organizer labels. Teams claim tasks, a chaperone taps "verified", and the scoreboard shows caregiver hours returned per team.

**Strongest evidence.**
- East Asian American dementia caregivers underuse respite; barriers include not wanting outsiders in the home ([PMC11491536, verified](https://pmc.ncbi.nlm.nih.gov/articles/PMC11491536)). This backs the no-strangers-in-homes design.
- Stigma and isolation among Chinese and Korean American dementia caregivers ([PMC13053934, verified](https://pmc.ncbi.nlm.nih.gov/articles/PMC13053934/)).
- Student respite programs exist ([Buddy Break, verified](https://archrespite.org/library/students-as-respite-volunteers-a-creative-approach-to-supporting-family-caregivers/); [EXHALE, verified](https://pmc.ncbi.nlm.nih.gov/articles/PMC11691705/)); none found with a team scoreboard and AI task split.

**Biggest risk.** Impact is a one-day burst, not ongoing relief (Judge B: 6/10). Also depends on an in-person event and chaperones; the demo must fake the room with 3 teams.

**2-minute demo.**
1. 0:00 Hook: survey stat, then one caregiver's aliased backlog.
2. 0:20 AI splits it into on-site tasks.
3. 0:40 Two student teams claim tasks on separate phones.
4. 1:05 Chaperone taps "verified"; the scoreboard climbs in real time.
5. 1:30 Caregiver view: before/after hours covered this week.
6. 1:50 Close with the no-strangers-in-homes safety line.

---

## Verdict

**Yes, the winner is better than Tag In, and it is essentially Tag In's core loop with the parts that sank it removed.** Tag In scored 5.35 in round 1, last of 8, and both judges gave it feasibility 3/10: a stress check-in, trend warning, load chart, AI split, AI-drafted ask, family-then-volunteer routing and verification cannot be built in 7 hours, and the stress percentile against our survey is unsupportable because the survey never measured stress. Its own judges said cutting it down "turns it into Care Relay" (7.32 in the same round). The winners keep what you like about Tag In (load taken off, two or three roles acting live, a visible before/after) and drop the check-in scoring. Rest Block: Last Slot is the strongest 2-minute demo (one live claim lights up a 3-hour rest window); Rest Block Bank and Respite Sprint are stronger on Day of Service theme fit and work well as the "scale" slide. My suggestion is to build Last Slot as the demo and pitch Bank as where it goes next. Caveats: the top scores are close (7.21 to 7.26), scores drifted between rounds for re-scored ideas (Rest Block 7.41 in round 2, 6.29 in round 3), and the judging was AI-simulated, so a real caregiver's reaction should override these numbers. If you want to bring back Tag In's stress check-in as a small optional screen, do it only after the Last Slot loop works end to end, and without the survey percentile.
