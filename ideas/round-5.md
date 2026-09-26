# Round 5: Money, load sharing and Tag In, revised

This round revises round 4 based on your feedback:
- Keep the Benefit Sweep direction (real money back, a counter judges can read).
- Take students off legal and benefit forms.
- Drop the language-based ideas (Visit Bridge, Portal Pal, and the translation angle everywhere).
- Go back to what Tag In was about: sharing the load, a check-in, and routing asks to family first and then volunteers.

It ran in two stages with no subagents: stage 1 generated and scored 7 candidates, and stage 2 merged and fixed the top 3. Scores use the same weights as every round (Impact 2, Demo 2, Theme 1.5, Novelty 1.5, Feasibility 1, Research 0.5, divided by 8.5). They come from one reviewer, so compare them only within this round.

**Verified** means the number was seen on the linked page. Numbers marked *(abstract only)* or *(secondary source)* are in the notes, and you should say "about" or leave them out of the pitch.

---

## Stage 1: Candidates

| # | Idea | One line | Score | I/D/T/N/F/R |
|---|---|---|---|---|
| A | **Money on the Table** (Benefit Sweep v2) | Rules plus AI find money the family is missing, family members claim the money tasks, and free professionals file | **7.88** | 8.5/8/7.5/7.5/7/9 |
| B | **Fair Share** | A load chart shows who carries what, and AI writes each sibling an ask that fits their life | **7.50** | 8/8.5/6/7/8/6.5 |
| E | **Backup Bench** | Every recurring task gets a backup in advance, and one tap ("I'm sick") hands the week to them | **7.24** | 7.5/8/6/7/8/6 |
| C | **Tag In Lite** | A weekly 3-question check-in; yellow or red automatically sends pre-drafted asks | **6.91** | 7.5/7.5/6/6/7/7.5 |
| D | **Work Shield** | Finds coverage for care that clashes with the caregiver's job, and drafts a flexible-schedule request | **6.76** | 7/6.5/6/7/7/8 |
| G | **Respite Wallet** | Tracks the respite dollars a family is owed (for example GUIDE's $2,500) and turns them into booked hours | **6.76** | 7/6.5/6.5/6.5/7/8 |
| F | **Cost Splitter** | Siblings log care expenses, AI sorts receipts and splits costs by an agreed rule | **6.47** | 6.5/7/5/6/8/7 |

**Stage 1 notes.**
- **C (Tag In Lite)** is Tag In's check-in on its own. Without somewhere to send the asks it's just a mood tracker, so it works better as the **trigger inside E**.
- **G (Respite Wallet)** is really one line item of A. Merge it into A.
- **F (Cost Splitter)** is weak alone but gives B a second axis, money as well as hours. Merge it into B.
- **D (Work Shield)** has good stats but a vague demo, and the employer letter drifts back toward forms. Cut it, but reuse its work stats in B's pitch.

---

## Stage 2: Finalists (merged and fixed)

| Rank | Idea | Absorbs | Score | I/D/T/N/F/R |
|---|---|---|---|---|
| 1 | **Money on the Table** | A + G | **8.06** | 8.5/8/8/8/7/9 |
| 2 | **Fair Share** | B + F | **7.74** | 8/8.5/7/7.5/7.5/7 |
| 3 | **Backup Bench** | E + C | **7.68** | 8/8.5/6.5/7.5/7.5/7.5 |

---

## 1. Money on the Table: 8.06

**What changed from Benefit Sweep.**
- **Students never touch legal or benefit forms.** Filing goes to free, trained professionals who already exist for this: State Health Insurance Assistance Program (SHIP) counselors and the local Area Agency on Aging. The app gets the family to them prepared.
- **Family members, not students, do the money tasks.** A sibling who lives far away can't give hours, but can make the calls, gather documents and sit in on the counselor appointment. This is Tag In's "family first" routing.
- **Students do what students can safely do.** Applying for benefits takes the caregiver's time: phone holds, appointments, gathering papers. Students cover that time with the low-contact tasks from Last Slot (groceries, meal prep, yard, pharmacy pickup), so the caregiver can go to the appointment.
- **Money turns into rest.** The counter shows dollars found and the respite hours they can buy, which ties straight back to Last Slot's rest window.

**Evidence (verified).**
- **Seniors leave $58 billion a year unclaimed.** Only **38%** of eligible adults 65+ were on SNAP in 2023, and Medicare Savings Program (MSP) participation is about **49%**. [NCOA, 2026](https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/)
- **Medicare's GUIDE dementia model offers "respite services up to $2,500 annually"** to qualifying caregivers. It started July 1, 2024 and runs 8 years. [CMS GUIDE](https://www.cms.gov/priorities/innovation/innovation-models/guide)
- **Every responding state pays family caregivers "under some circumstances"** through Medicaid home care, and **44 states allow payments to legally responsible relatives** through waivers. Waiting lists are common. [KFF, 2025](https://www.kff.org/medicaid/medicaids-home-care-support-for-family-caregivers-in-2025/)
- **The federal dependent care credit** can cover care for "a disabled spouse or dependent of any age who is incapable of self-care" who lives with the caregiver, when the care lets the caregiver work. [IRS](https://www.irs.gov/credits-deductions/individuals/child-and-dependent-care-credit-information)
- Some states add credits. **Nebraska gives up to $3,000** when caring for someone with dementia. [AARP Nebraska](https://www.aarp.org/states/nebraska/supporting-family-caregivers-in-nebraska/)
- **Caregivers spend $7,242 a year** out of pocket, which is **26% of their income**. [AARP, 2021](https://www.aarp.org/pri/topics/ltss/family-caregiving/family-caregivers-cost-survey/) **A quarter take on debt**, and **half report a negative financial impact**. [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)

**How it works.**
1. **Screen (rules, not AI).** The caregiver answers about 10 tap questions: state, age of the person, Medicare or Medicaid status, dementia diagnosis, income range, living together, and whether the caregiver works. A JSON rules table flags **likely matches**:
   - GUIDE respite
   - MSP
   - SNAP
   - Medicaid paid family caregiving
   - the dependent care credit
   - the state caregiver credit
2. **Explain and break down (AI).** For each match, AI writes:
   - a plain-English "why you likely qualify" note
   - a rough yearly dollar value, labeled "estimate"
   - a list of **money tasks**, for example "Call SHIP to book a counselor", "Find the Medicare card and last 2 bank statements", "Ask the doctor's office if they're a GUIDE participant"
3. **Route (Tag In).** The money tasks go to **family first**, sorted by what each person can do (the remote sibling gets the calls). The caregiver's **time gaps** created by appointments go to **students** as ordinary Last Slot tasks.
4. **Count.** The board shows **"$ found this year"** and **"respite hours unlocked"** (dollars ÷ the local respite hourly rate, entered by the coordinator).

**Roles.** Caregiver (screen), family (claim money tasks), students (cover the caregiver's time), coordinator or chaperone (verifies at the event).

**2-minute demo.**
1. 0:00 Hook: "$58 billion a year goes unclaimed. Dementia caregivers pay $7,242 out of pocket."
2. 0:15 The caregiver taps through the screen. Four matches appear, including "GUIDE respite: up to $2,500/yr".
3. 0:40 AI breaks each match into money tasks. Tab B (brother in another state) claims "Call SHIP" and "Ask the clinic about GUIDE".
4. 1:05 The SHIP appointment appears on Saturday 10-11am. Tab C (student) claims "Groceries + lunch prep, Sat 10-12", covering it.
5. 1:30 Board: **"$4,100 found / 90 respite hours unlocked"** (demo estimates, labeled).
6. 1:50 Close: "Family handles the paperwork, professionals file, students give the time back."

**Build (7 hrs).** Entities: Screening, Match (program, est_value, status), MoneyTask (claimer, status). Also a rules JSON for one state and one AI call (explain plus task breakdown, strict JSON). Reuse the Last Slot claim cards, grid and board. **Cut:** real eligibility engines, more than one state, document upload.

**Risks and guardrails.**
- Show "likely, confirm with a counselor" on every match.
- Program rules change every year. Check the numbers you show on the day, and write the date on the slide.
- Income answers are ranges only, and nothing sensitive goes on the public board (aliases only).

---

## 2. Fair Share: 7.74

**What it is.** It is Tag In's load chart, done properly. Every family member's contribution is logged as **hours and dollars**. A chart shows the split (for example "Mei 82%, David 11%, Anna 7%"). Then AI does the awkward part: it writes **each sibling a specific ask that fits their life**:
- The nearby brother: "Saturday rides to the clinic, 2 hrs"
- The sister across the country: "Take over the pharmacy refills and the $180/month adult-day bill"
- The sibling with no time: "Cover the respite aide 1 day a month"

Students appear as a **volunteer bar** on the same chart for low-contact tasks, so the family sees help from outside, not only from each other.

**Evidence.**
- **7 in 10 family caregivers are employed**, and **half report a negative financial impact**. [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)
- **61% of caregivers had at least one work change**: 49% came in late, left early or took time off, and 6% left work entirely. [FCA, citing NAC/AARP 2015](https://www.caregiver.org/resource/caregiver-statistics-work-and-caregiving/) *(secondary source)*
- Women who leave work to care for a parent lose about **$324,000 in lifetime wages, Social Security and pension**. [FCA, citing MetLife 2010](https://www.caregiver.org/resource/caregiver-statistics-work-and-caregiving/) *(secondary source, older study)*
- **59% of dementia caregivers report high to very high emotional stress.** [Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures)
- **Unequal division of care among siblings is linked to depressive symptoms and loneliness through caregiver burden.** [Gilligan et al., Research on Aging 2026](https://doi.org/10.1177/01640275261450640) *(abstract only)*

**Why it can win.** The before-and-after is a chart anyone can read in one second: 82/11/7 becomes 55/25/20. The AI does something people really avoid, which is writing a fair, specific ask to a sibling without starting a fight.

**2-minute demo.**
1. 0:00 Hook: "59% of dementia caregivers report high stress, and usually one sibling carries most of it."
2. 0:15 The caregiver's week (existing Last Slot data) becomes a load chart: Mei 82%.
3. 0:35 AI drafts 3 asks, each fitted to one sibling's distance, time and money.
4. 0:55 Tab B (David) accepts rides. Tab C (Anna) accepts the refills and the adult-day bill.
5. 1:20 A student claims groceries. The volunteer bar appears.
6. 1:40 The chart animates to 55/25/20 with the note "Mei gets 9 hours back this week."

**Build.** Entities: Member (distance, availability, can_pay), Contribution (hours or $, member). One AI call drafts the asks. One chart: a single stacked bar is enough. Reuse the Last Slot tasks as the hours source. **Cut:** receipts, OCR, automatic cost-splitting rules.

**Risks.**
- Family money is touchy. The caregiver approves every ask before it's sent.
- Hours should never feel like a scoreboard against a sibling. Keep the framing "share", not "blame".

---

## 3. Backup Bench: 7.68

**What it is.** Tag In's check-in comes back, but as a **trigger instead of a score**:
- Every recurring task in the caregiver's week gets a **backup** assigned ahead of time: family first, students for low-contact tasks.
- Once a week the caregiver answers **3 simple questions** (sleep, overwhelm, own health). This is not a diagnosis and gives no percentile.
- **Yellow** sends the pre-drafted asks for the next 3 days to the backups.
- **Red**, or the big **"I'm sick"** button, hands the **whole week** to the bench.

The caregiver sees one message: "You're covered until Sunday. Go to your doctor."

**Evidence (verified).**
- **31% of caregivers didn't see a doctor when they were sick or injured**, and 35% skipped routine care. [AP-NORC Long-Term Care Poll, 2018](https://www.longtermcarepoll.org/ap-norc-poll-many-caregivers-neglecting-their-own-health/)
- **20.5% of caregivers have frequent mental distress, vs 13.6% of non-caregivers.** Caregivers did worse on 13 of 19 health indicators. [CDC MMWR 2024](https://www.cdc.gov/mmwr/volumes/73/wr/mm7334a2.htm)
- **1 in 5 caregivers report poor health** because of caregiving. [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)
- **31% of dementia caregivers have depression** (pooled across 43 studies). [Collins & Kishita](https://www.cambridge.org/core/journals/ageing-and-society/article/abs/prevalence-of-depression-and-burden-among-informal-caregivers-of-people-with-dementia-a-metaanalysis/45C8A0DD5DED53978E039111FCCEB8EF)
- Caregiver burden partly or fully explains how behavior symptoms lead to **nursing home admission**. [Gaugler et al., Am J Geriatr Psychiatry](https://www.sciencedirect.com/science/article/abs/pii/S1064748112601122) *(abstract only)*

**Why it fixes Tag In.** Tag In failed on scope (feasibility 3/10) and on an unsupported stress percentile. Backup Bench keeps the check-in but drops the scoring, trend charts and percentile. Its only job is to decide when the bench goes in. The routing and task split already exist in Last Slot.

**2-minute demo.**
1. 0:00 Hook: "31% of caregivers skip the doctor even when they're sick. Nobody covers for them."
2. 0:15 Set-up: the week grid, with a small backup avatar on each task (already assigned).
3. 0:35 The caregiver taps **"I'm sick"**.
4. 0:45 Tabs B (sister) and C (student) light up at the same moment with "You're up: Tue meds pickup", "You're up: Wed dinner". Each taps Confirm.
5. 1:15 Any task whose backup doesn't confirm within the demo timer goes to the student pool (Last Slot's claim flow).
6. 1:35 The caregiver screen: "Covered until Sunday. 14 tasks, 4 people."
7. 1:50 Close on the weekly check-in screen: "Next time, yellow catches it before red."

**Build.** Add `backupId` to Task, plus a CheckIn entity (3 answers → green/yellow/red by a fixed rule) and an escalate action that re-routes tasks. Reuse the grid, claim flow and cross-tab sync. **Cut:** trends, charts, notifications outside the app.

**Risks.**
- The check-in must not look like a medical screen. Use plain wording and add a crisis line link on red.
- Backups can go stale. Show "last confirmed" on each one.

---

## Recommendation

All three finalists are pieces of the Tag In you liked, now each small enough to build:

| Tag In piece | Finalist | Reuses from Last Slot |
|---|---|---|
| Load chart | Fair Share | tasks as the hours source |
| Check-in and routing | Backup Bench | grid, claims, sync |
| Money and time back | Money on the Table | claim cards, board, grid |

- **If you add one thing to the current build, add Money on the Table.** It has the highest score, the strongest research, a board counter you already have, and a clean answer to "what do students do" (they cover the caregiver's time, never the forms).
- **For the second screen, if time allows, add Fair Share's single stacked bar.** It's the fastest visual win.
- Keep Backup Bench as the "what's next" slide.

**Caveats.**
- Scores are from one reviewer.
- The benefit dollar figures in the demo must be labeled estimates, and checked on the day.
- The sibling and nursing-home findings were confirmed from abstracts only. Say "research links..." rather than quoting numbers.
