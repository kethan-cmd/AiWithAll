# Round 4: New research-backed ideas

> **Superseded by `round-5.md`.** Per feedback: language-based ideas dropped, students removed from benefit forms, Tag In direction revisited.

Seven new ideas. None repeats the rest-window lineage from rounds 1-3 (Last Slot, Bank, Respite Sprint). Each targets a different, measurable harm in dementia caregiving, and most can reuse parts of the Last Slot prototype (role switcher, claim cards, projector board).

**How this round differs.** Rounds 1-3 used two simulated judges. This round was scored by one reviewer with the same weights (Impact 2, Demo 2, Theme 1.5, Novelty 1.5, Feasibility 1, Research 0.5, divided by 8.5), so don't compare these scores directly with earlier rounds. Research was done by three parallel agents that opened each source. "Verified" means someone opened the page and saw the number on it. Unverified numbers are marked and should be kept out of the pitch.

## Ranking

| Rank | Idea | One line | Score | I/D/T/N/F/R |
|---|---|---|---|---|
| 1 | **Benefit Sweep** | Students help families claim unclaimed benefits; a live "$ unlocked" counter | **7.94** | 8/8/9/7/7/9 |
| 2 | **Found Fast** | One tap on "Mom is missing" turns a pre-built profile into a bilingual flyer and a 15-minute action plan | **7.76** | 8/8.5/7/7/8/8 |
| 3 | **Second Look** | Paste a suspicious text or call; AI flags scam red flags in the family's language and alerts a relative | **7.47** | 7/9/6/7/8/8 |
| 4 | **First 72 Hours** | Hospital discharge papers become an in-language checklist whose tasks flow into the Last Slot grid | **7.38** | 8/7.5/6.5/7/7/9 |
| 5 | **Pill Picture** | Photos of pill bottles become a picture-based, bilingual daily pill chart plus questions for the pharmacist | **7.06** | 7/7/8/6/7/8 |
| 6 | **Visit Bridge** | A bilingual one-page prep sheet before a doctor visit and a plain-language summary after | **7.00** | 7.5/7/6/6/8/9 |
| 7 | **Portal Pal** | Students set up patient portals and telehealth, and AI writes step-by-step guides in the family's language | **6.41** | 6/6/8/5/7/8 |

---

## 1. Benefit Sweep: 7.94

**Problem.** Older adults leave billions in benefits unclaimed, while caregivers pay for care out of their own pockets.

**Evidence (verified).**
- **$58 billion a year is left unclaimed** by adults 65+ who qualify for SNAP, SSI and Medicare Savings Programs but aren't enrolled. Only **38%** of eligible 65+ adults were on SNAP in 2023, and MSP participation is about **49%** (6.6M missing out). [NCOA, 2026](https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/)
- Caregivers spend **$7,242 a year** out of pocket on average, **26% of their income**. [AARP, 2021](https://www.aarp.org/pri/topics/ltss/family-caregiving/family-caregivers-cost-survey/)
- **A quarter of caregivers take on debt** because of caregiving, and 1 in 5 can't afford basic needs. [AARP/NAC Caregiving in the US 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)
- Some states add caregiver tax credits. Nebraska gives up to **$3,000 when the person has a dementia diagnosis**. [AARP Nebraska](https://www.aarp.org/states/nebraska/supporting-family-caregivers-in-nebraska/)
- Language hotlines exist but are passive: NAPCA runs Mandarin, Cantonese, Korean and Vietnamese lines. [NAPCA](https://www.napca.org/)

**Pitch.** The caregiver answers about 8 picture questions in their language: household size, income range, age, whether Medicare is in place, whether there is a dementia diagnosis, and the state. A plain **rules table** (not AI) matches them to 3-4 programs: SNAP, MSP, Extra Help and the state caregiver credit. **AI does the part people struggle with.** It explains each match in the family's language, lists the documents to gather, and drafts answers for the application fields. At the Day of Service, student pairs claim a family's application, a chaperone verifies it, and the projector shows **"$ per year unlocked"** summed across families.

**Roles.** Caregiver (picture intake), student pair (claims and prepares the application), chaperone (verifies), projector board.

**Why it can win.** It is the easiest idea for judges to count: a dollar figure goes up live. It fits "Day of Service" fully because the students do real work at the event, and nobody enters a home.

**Competitor.** NCOA BenefitsCheckUp screens people in English on the web. None found that combines in-language AI explanation, student-staffed application help and a live event counter.

**2-minute demo.**
1. 0:00 Hook: "$58 billion a year goes unclaimed by seniors who qualify."
2. 0:15 Caregiver taps through picture questions in Chinese. Result: MSP and SNAP likely, with the reasons shown in Chinese.
3. 0:45 Document checklist and AI-drafted form answers appear.
4. 1:05 Student tab: claim "Family Sunflower, MSP application". Chaperone taps Verify.
5. 1:30 Board: "$ unlocked" jumps. Use a clearly labeled estimate, for example MSP Part B premium savings per year.
6. 1:50 Close: "Every dollar here goes back to a caregiver paying 26% of their income."

**Build (7 hrs).** Entities: Family, Screening, Application (status, claimer, est_value). The rules table is a JSON file. There is one AI call for explanation, translation and field drafts. Reuse the Last Slot claim cards, chaperone verify and board. **Cut:** real submission, document upload, and more than 4 programs.

**Risks.** Eligibility rules differ by state and change every year. Show results as "likely eligible, confirm with the agency" and hard-code one state. Dollar values must be labeled estimates. Income data is sensitive: keep it as ranges and use aliases on the board.

---

## 2. Found Fast: 7.76

**Problem.** Most people with dementia wander. The first hours decide the outcome, and families lose them looking for a photo and working out what to do.

**Evidence (verified).**
- **6 in 10 people with dementia will wander at least once**, and many do so repeatedly. Most are found **within 1.5 miles**. The Alzheimer's Association advises keeping a recent close-up photo on hand, and calling **911 if the person isn't found within 15 minutes**. [Alzheimer's Association](https://www.alz.org/help-support/caregiving/stages-behaviors/wandering)
- **Up to half of people with dementia not found within 24 hours suffer serious injury or death.** Of those who died, half were within 0.5 miles of where they were last seen. [Rowe et al., BMC Geriatrics 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3141319/)
- **About 30% of Asian Americans have limited English** ([KFF](https://www.kff.org/racial-equity-and-health-policy/overview-of-health-coverage-and-care-for-individuals-with-limited-english-proficiency/)), so a caregiver may struggle to describe their parent to English-speaking police under stress.
- **Gap:** no measured rate of families that have a photo and info sheet ready. Don't claim one.

**Pitch.** Preparation happens **before** a crisis. At the Day of Service, students sit with families (or work from a form) to build a **Found Fast profile**: a recent photo, height, clothing habits, the languages the person understands, a calming phrase, medical notes, and **places they tend to go** (old home, temple, a favorite bakery). AI turns this into a bilingual profile. When the person goes missing, one big red button produces:
- a bilingual **missing-person flyer**
- a **911 script** in English for the caregiver to read aloud
- a **15-minute checklist** from the Alzheimer's Association guidance
- a list of "likely places" ranked for family to split up and check, each shown as a claimable card

**Roles.** Caregiver (red button), family members (claim search spots), student (builds profiles at the event, never searches).

**Competitors.** MedicAlert Safe & Found (a paid ID plus a hotline) and Project Lifesaver (a GPS bracelet, 4,662 rescues). Both need enrollment or hardware. Found Fast is free, in-language, and ready in minutes.

**2-minute demo.**
1. 0:00 Hook: "6 in 10 wander. Half of those not found in 24 hours are hurt or die."
2. 0:20 Show a pre-built profile for "Grandma Lin", made at the event by a student.
3. 0:40 Press "She is missing." The flyer, 911 script and checklist appear together.
4. 1:00 Family tab: three relatives claim "Temple", "Old apartment" and "Bakery".
5. 1:30 A relative taps "Found": all tabs turn green with the elapsed time (for example 23 min).
6. 1:50 Close: "Prepared on a Day of Service, used on the worst day."

**Build.** Entities: Profile, Incident, SearchSpot (claimer, status). AI is used for the flyer text, translation and the 911 script. Printing the flyer is just a browser print view. **Cut:** maps, SMS, and location tracking.

**Risks.** Never position students as searchers. The app must say "call 911 first" and must not replace 911. Photos of vulnerable people are sensitive: keep them private to the family.

---

## 3. Second Look: 7.47

**Problem.** Scams on older adults are rising fast, cognitive decline raises vulnerability before diagnosis, and some scams target Chinese-speaking communities in their language.

**Evidence (verified).**
- **Adults 60+ lost $4.885 billion in 2024**, up 43%, across 147,127 complaints with an **average loss of $83,000**. [FBI IC3 2024 Report](https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf)
- **In 2025, losses reached $7.748 billion**, up 59%, across 201,266 complaints. [FBI IC3 2025 Report](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf)
- The FBI warns of criminals **impersonating Chinese police and the Chinese Embassy** to target the US Chinese community. [FBI PSA, Jan 2024](https://www.ic3.gov/PSA/2024/PSA240103) San Francisco police reported a victim who wired $23,000 in one such scam. [SFPD, 2025](https://www.sanfranciscopolice.org/news/san-francisco-police-department-warns-chinese-community-0)
- **Financial skills decline measurably in the year before an Alzheimer's diagnosis.** [Triebel et al., Neurology 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2754335/)

**Pitch.** The older adult, or the caregiver, pastes or photographs a text, email or letter, or types what a caller said. AI returns a **red / yellow / green card in the family's language**. The card names the specific red flags ("asks for gift cards", "claims to be police from China", "says keep it secret") and gives one action: "Hang up. Call your daughter." A red result **alerts a trusted family member** in real time. At the Day of Service, students run short in-language scam role-play sessions and add the latest local scam scripts to a shared "seen this week" wall.

**Roles.** Older adult or caregiver (checks messages), family member (gets alerts), student (runs awareness sessions and adds scam examples).

**Competitor.** AARP Fraud Watch Network (English education and a helpline). We found no in-language, paste-and-check tool with a family alert.

**2-minute demo.**
1. 0:00 Hook: "$7.7 billion lost by seniors last year, up 59%."
2. 0:20 Paste a Mandarin "Chinese police" message. A red card appears in Chinese within about 3 seconds.
3. 0:50 The daughter's tab instantly shows "Mom received a likely scam. Call her."
4. 1:10 Paste a real pharmacy refill text: green, with reasons.
5. 1:30 Student tab adds this week's scam to the wall. Board: "scams caught today".
6. 1:50 Close on "a second look before the money moves."

**Build.** The simplest build of the seven: one AI call with a strict JSON output (level, flags[], action), plus Check and Alert entities, reusing the cross-tab sync. **Cut:** call interception and email integration.

**Risks.** False negatives are dangerous. The default for anything asking for money, secrecy or urgency is yellow or higher, and green always adds "when in doubt, call family". Theme fit with caregiving is weaker. Frame it as protecting the person with early dementia.

---

## 4. First 72 Hours: 7.38

**Problem.** People with dementia are readmitted to the hospital far more often, and caregivers leave the hospital with little notice and no training.

**Evidence (verified).**
- **30-day readmission: 21.5% for patients with dementia vs 14.7%** for matched patients without it, costing about $2,794 more per episode. [JAMA Netw Open 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10020873/)
- **Only 20% of family caregivers got at least 24 hours' notice** before a discharge. [AARP Home Alone Revisited, 2019](https://www.aarp.org/pri/topics/ltss/family-caregiving/home-alone-family-caregivers-providing-complex-chronic-care/)
- **20 million caregivers do medical tasks without adequate training.** Of those doing medical tasks, **82% manage medications**. [AARP, 2019](https://www.aarp.org/caregiving/medical/medical-tasks-study/)
- **62% of Asian/Pacific Islander caregivers do medical or nursing tasks, vs 52% overall.** [Young et al., Innovation in Aging 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7740272/)

**Pitch.** The caregiver photographs the discharge papers. AI extracts:
- warning signs that mean "call the doctor" (in the family's language)
- medication changes (new, stopped, changed)
- follow-up appointments
- the home tasks for the first 72 hours

The **home tasks drop straight into the Last Slot grid** as claimable cards, so family and students cover pharmacy runs, meal prep and the follow-up ride. The caregiver gets a pinned "red flags" card at the top.

**Why it matters for us.** It's a second entry point into the app we already built. Discharge is the moment families most need help and are most willing to accept it.

**2-minute demo.** Photo of sample discharge papers, then the in-language red flags card, then tasks appearing on the grid, family and a student claiming them, and finally "Home safe: 72 hours covered."

**Build.** One AI extraction call (JSON), then reuse `splitTasks` and the grid. Use a fake discharge sheet made by the team. **Cut:** EHR integration and reminders.

**Risks.** The AI must summarize and translate only, never give medical advice. Show the original text next to each extracted item. Health info needs care: use demo data only.

---

## 5. Pill Picture: 7.06

**Problem.** People with dementia take many medicines. Caregivers sort them without training, and mistakes send older adults to the emergency room.

**Evidence (verified).**
- **62% of older people with dementia have polypharmacy**, and 43% take a potentially inappropriate medication (meta-analysis of 62 studies, n=658,431). [Zhao et al., Front Pharmacol 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10483131/)
- **Adults 65+ visit emergency departments over 600,000 times a year** for adverse drug events, more than twice as often as younger people. [CDC](https://www.cdc.gov/medication-safety/data-research/facts-stats/index.html)
- **55% of caregivers do medical or nursing tasks; only 22% received training.** [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)

**Pitch.** The caregiver photographs each pill bottle. AI reads the labels and builds a **printable picture chart**: morning, noon, evening and bedtime rows, each with a pill description ("small white round"), a purpose in plain language, and the family's language next to English. It also produces a **"questions for your pharmacist" list**, for example two medicines for the same purpose. It never says "stop taking". Day of Service: student teams print and laminate charts, and label pill organizers with bilingual stickers.

**Competitors.** Medisafe, pharmacy blister packs, pill dispensers such as Hero (not verified). None is in-language or built around a printable chart for a low-tech household.

**Build.** One vision/extraction call, a MedList entity and a print layout. **Risks:** reading labels wrong. Have the caregiver confirm each row, and frame it as an aid to bring to the pharmacist.

---

## 6. Visit Bridge: 7.00

**Problem.** Language barriers in health care cause measurable harm, and relatives end up interpreting.

**Evidence (verified).**
- **28.5 million people in the US have limited English**, including **about 30% of Asian people**. Half of LEP adults hit a language barrier in health care in the past 3 years. [KFF, 2024](https://www.kff.org/racial-equity-and-health-policy/overview-of-health-coverage-and-care-for-individuals-with-limited-english-proficiency/)
- Asian Americans with limited English have **4.95 times the odds of communication problems** and 1.89 times the odds of unmet medical needs. [Jang & Kim 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6252148/)
- **49% of adverse events for LEP patients involved physical harm, vs 30%** for English speakers. [Divi et al., via BMJ](https://pmc.ncbi.nlm.nih.gov/articles/PMC1801038/)
- In consent conversations that used untrained interpreters, **92% of those interpreters were family members**. [Lee et al., JGIM 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5515780/)

**Pitch.** **Before a visit**, the caregiver speaks or types worries in their language ("Mom forgets meals, fell twice, sleeps all day"). AI builds a **one-page bilingual visit sheet** for the doctor: changes since the last visit, current medicines (from Pill Picture), and the top 3 questions. **After the visit**, the caregiver photographs the visit summary, and AI produces an in-language plain summary plus to-dos.

**Risks.** It is not a replacement for a medical interpreter, and must say so. Patients have a right to a free interpreter, and the sheet should remind them to ask for one. The demo is less dramatic than the others, and theme fit with a Day of Service is weak. It pairs best as a feature of Pill Picture or First 72 Hours.

---

## 7. Portal Pal: 6.41

**Problem.** Older, limited-English adults are cut off from patient portals and telehealth.

**Evidence (verified).**
- **Only 41.6-47.2% of limited-English adults 65+ owned smartphones, vs 62.8-75%** of those not limited in English. Portal use gaps were 12-14 points. [Permanente Journal 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC11907665/)
- Asian patients used telehealth **11.3% less** than non-Hispanic white patients, and LEP patients were 9.6% less likely to use it. [CHIS 2021-22](https://pmc.ncbi.nlm.nih.gov/articles/PMC12549173)
- **Teens aged 16-17 have the highest formal volunteering rate of any age group: 34.1%.** [AmeriCorps 2024](https://www.prnewswire.com/news-releases/americorps-the-state-of-volunteering-and-civic-life-in-america-302315771.html)

**Pitch.** Students sit with families at the event and set up portal access, telehealth and refill requests. AI writes a **step-by-step guide in the family's language** for each task they set up, so the family can repeat it alone.

**Why it ranks last.** It's valuable service, but the app part is thin and the demo is hard to make exciting. It could be offered as a station at the Benefit Sweep event.

---

## Ideas considered and dropped

- **Personalized music and memory activities.** Evidence is mixed: the Music & Memory nursing-home trial didn't significantly reduce agitation ([JAMDA 2022](https://www.jamda.com/article/S1525-8610(21)01104-X/abstract), unverified), though one meta-analysis found a medium effect ([Front Psychol 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5432607/)). It's also close to Memory Box Makers from round 1.
- **Caregiver mood check.** The stats are strong (59% of dementia caregivers report high emotional stress, per [Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures); 20.5% of caregivers have frequent mental distress vs 13.6%, per [CDC MMWR 2024](https://www.cdc.gov/mmwr/volumes/73/wr/mm7334a2.htm)), but it repeats Tag In's check-in, which scored last in round 1.

## Stats worth reusing in any pitch (all verified)

- **63 million** US family caregivers, up nearly 50% since 2015. ([AARP 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/))
- **Nearly 13 million** unpaid dementia caregivers gave **19+ billion hours** of care, worth **$446 billion+**. **7.4 million** Americans 65+ have Alzheimer's. ([Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures))
- **31%** of dementia caregivers have depression (pooled across 43 studies). ([Collins & Kishita](https://www.cambridge.org/core/journals/ageing-and-society/article/abs/prevalence-of-depression-and-burden-among-informal-caregivers-of-people-with-dementia-a-metaanalysis/45C8A0DD5DED53978E039111FCCEB8EF))
- **31%** of caregivers didn't see a doctor when they were sick or injured. ([AP-NORC 2018](https://www.longtermcarepoll.org/ap-norc-poll-many-caregivers-neglecting-their-own-health/))

## Recommendation

Last Slot is already built, so choose based on what adds the most to it with the least work:

1. **Best add-on: First 72 Hours.** It reuses the grid and task split and gives the pitch a sharper "why now" moment (21.5% vs 14.7% readmission).
2. **Best Day of Service slide or pivot: Benefit Sweep.** It has the strongest theme fit and a dollar counter judges can read. It reuses the claim, verify and board screens almost unchanged.
3. **Most emotional 2-minute demo if starting fresh: Found Fast.** It has one big button, a clear before and after, and a small build.

**Caveats.** These scores come from one reviewer, not the two-judge loop. They run a bit higher than earlier rounds and should be compared only with each other. Eligibility rules, medication reading and scam detection all involve safety or legal stakes. Each needs the "confirm with a professional" guardrails described above, even in the demo.
