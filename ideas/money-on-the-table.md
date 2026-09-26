# Money on the Table: Product Blueprint (v3)

This version drops the questionnaire. **The caregiver photographs the paperwork they already have, and the AI does every step it legally can: it reads the documents, finds likely programs, pre-fills the applications, and lists what's missing.** A person only has to check the drafts, sign, and submit.

Everything is laid out in the order of the Analog Sprint packet and the Side A chart paper, and each section maps to a rubric line:

| Rubric line | Weight |
|---|---|
| C1 Problem & Urgency | x2 |
| C2 Solution & AI Function | x3 |
| C3 Prototype & User Journey | x2 |
| C4 Team Delivery & Participation | x3 |

Pod: **Healthcare & Caregiving**.

---

## What changed from v2, and why

**v2 was a survey, and NCOA already does that better.** NCOA's BenefitsCheckUp is free, searches **2,000+ programs** in every state, lets you screen for someone else, and gives a personalized eligibility report. [How BenefitsCheckUp works](https://benefitscheckup.org/article/what-is-benefitscheckup) We can't beat that on finding programs.

**The gap is what happens after the report.** NCOA runs the best screener in the country, and its own research still counts **$58 billion a year** unclaimed. [NCOA 2026](https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/) Finding the programs isn't the bottleneck. The paperwork is.

v3 changes:
1. **Documents in, not a survey.** The caregiver snaps the Medicare card, the Social Security award letter, a bank statement and last year's tax return. AI reads the facts off them, so there is no questionnaire.
2. **Drafted applications out, not a report.** For each likely program, the app produces a **pre-filled application draft** and a **"still needed" list**.
3. **A clear line on what AI does and doesn't do.** AI reads, matches, fills and flags. **A person signs and submits.** That's either the caregiver as the parent's **authorized representative**, or a free SHIP counselor. Applications allow this: the Washington MSP form lets any adult who knows the household's situation be named authorized representative, with permission to "sign the application on your behalf." [WA HCA 13-691](https://www.hca.wa.gov/assets/free-or-low-cost/13-691.pdf)
4. **Family sharing stays.** Anything the AI can't do becomes a task a sibling can claim, for example "Get Mom's signature", "Find the 2025 tax return", "Book SHIP to review".

---

## 1. Community profile

- **Who:** family caregivers of a parent or spouse with dementia. Usually one adult child carries most of the load while working.
- **Size:**
  - **Nearly 13 million** unpaid dementia caregivers. [Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures)
  - **63 million** family caregivers overall. [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)
- **Their situation:**
  - **7 in 10 are employed.**
  - **Half report a negative financial impact**, and **a quarter take on debt**. [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)
  - **59%** report high to very high stress. [Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures)

## 2. Problem statement (who / how / why)

> **Family caregivers of people with dementia** (who) **pay an average of $7,242 a year out of pocket, 26% of their income, while benefits their parent likely qualifies for go unclaimed** (how), **because even after a screener says "you may qualify," someone still has to dig up the documents and fill out long government forms, and the caregiver has no time left to do it** (why).

**Urgency (C1).**
- **$58 billion a year** goes unclaimed. Only **38%** of eligible 65+ adults get SNAP, and Medicare Savings Program participation is about **49%**. [NCOA 2026](https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/)
- Caregivers spend **$7,242 a year**, which is **26% of their income**. [AARP 2021](https://www.aarp.org/pri/topics/ltss/family-caregiving/family-caregivers-cost-survey/)
- The forms are heavy. The Washington MSP application runs **8 sections**, asks for **every household member's Social Security number**, and requires **proof when asked** and **a signature attesting** to everything. [WA HCA 13-691](https://www.hca.wa.gov/assets/free-or-low-cost/13-691.pdf)
- There is caregiver money on the table too:
  - Medicare's GUIDE dementia model covers respite "**up to $2,500 annually**". [CMS](https://www.cms.gov/priorities/innovation/innovation-models/guide)
  - **Every responding state** pays family caregivers through Medicaid in some circumstances. [KFF 2025](https://www.kff.org/medicaid/medicaids-home-care-support-for-family-caregivers-in-2025/)

## 3. Solution Storm: top 2 side by side

| | v2: Survey version | **v3: Paperwork version (chosen)** |
|---|---|---|
| User gives | 10 tap answers | Photos of documents they already have |
| AI does | Explains matches | **Reads** the documents, **matches** programs, **fills** the application drafts |
| User gets | A list of likely programs | Pre-filled application drafts plus a "still needed" checklist |
| vs NCOA | Duplicates it | Picks up where NCOA's report stops |
| Why chosen | | It does the part people actually get stuck on |

## 4. Three must-have features (MVP box)

1. **Snap your paperwork.** Upload photos of 3-4 standard documents. AI pulls out the key facts (birth date, Medicare status, monthly income, bank balance), and the caregiver confirms each one with a tap.
2. **Drafted applications.** For each likely program (the demo uses the Medicare Savings Program and GUIDE respite), the app shows the application fields **already filled in** from the documents, with the source document next to each field and a **"still needed"** list.
3. **Hand-off and share.** The two steps AI can't do, **sign** and **submit**, become tasks along with any missing documents. Family claims them, and a **"$ in progress / $ approved"** counter tracks it all.

**Not in the MVP:** submitting to agencies, e-signatures, storing SSNs, and more than one state.

## 5. Side A: Product Blueprint

**User story.**
> As a daughter caring for my mom with dementia while working full time, I want to hand over the paperwork I already have and get applications that are ready to sign, so we actually get the help instead of just a list of maybe.

**Screen 1: Start.** "Snap your paperwork." Four big tiles: *Medicare card*, *Social Security letter*, *Bank statement*, *Tax return*. Each tile turns green when it's uploaded. The screen says "Only you can see these files."

**Screen 2: AI does its job.** A card with the extracted facts ("Age 81 · Medicare A+B · $1,640/mo Social Security · $3,200 in bank"), each with a ✓ to confirm. Below it are the matched programs, each with an **"Open draft"** button. The draft shows the real form fields filled in. The SSN field is always left blank with the note **"fill by hand."**

> **AI sentence:** The caregiver **gives** photos of their parent's paperwork → the AI **reads** the facts, **matches** likely programs and **fills in** the applications → the caregiver **gets** ready-to-sign drafts and a list of what's still missing.

**Screen 3: Next step.** "What's left." Tasks for the things only a person can do, each with who claimed it:
- Caregiver: "Sign as authorized representative"
- Brother: "Book SHIP counselor to review and submit"
- Sister: "Find 2025 tax return"

A big counter shows "**$4,100/yr in progress** (estimate)". The ✓ marks fill in as tasks are done.

**Guardrails.**
- **AI never signs or submits.** A person signs (the applicant or their authorized representative), and a person submits, ideally after a free SHIP counselor reviews it.
- **Sensitive data:**
  - SSNs and full account numbers are **never stored**. The AI masks them in what it saves, and the SSN field is always filled by hand.
  - The photos are deleted once the facts are extracted.
  - Only the caregiver's account can see documents. Family sees tasks, never the files.
- **The human checks every fact.** Each extracted value shows its source document, and the caregiver confirms it before it goes into a draft.
- **Eligibility is "likely," never promised.** Income and asset limits come from a fixed table for one state, dated on screen. AI does not decide eligibility.
- **The demo uses fake documents only.** No real family's paperwork goes into a hackathon app.

**BASE prompt** (to paste into Base44 after lunch):
> Build a mobile-first web app called "Money on the Table" for family caregivers of people with dementia. Screen 1: four upload tiles (Medicare card, Social Security award letter, bank statement, tax return) that save files to a Document entity visible only to the uploading user. Screen 2: use AI file extraction to pull out date of birth, Medicare parts, monthly income, and bank balance into a Facts entity, showing each value next to its source document with a confirm checkmark. Never store Social Security numbers or full account numbers: mask them. Compare the confirmed facts to a fixed table of income and asset limits for one state (Medicare Savings Program, GUIDE respite) and show matching programs as cards labeled "Likely match, confirm with a free counselor." Each card opens a pre-filled application draft showing form fields filled from the facts, with the SSN field always blank and marked "fill by hand," plus a "still needed" list. Screen 3: a task list (sign as authorized representative, book SHIP counselor, find missing document) with Claim buttons and claimer names stored in a Task entity, plus a large running total of estimated dollars in progress. Calm design, large buttons.

---

## Similar apps (checked online)

| App | What it does | Gap we fill |
|---|---|---|
| [NCOA BenefitsCheckUp](https://benefitscheckup.org/article/what-is-benefitscheckup) | Free survey-based screener, 2,000+ programs, works for caregivers too, gives a PDF report | Ends at the report. We start from documents and end at **ready-to-sign applications** |
| [mRelief](https://www.mrelief.com/), USA.gov Benefit Finder | Short tap-style screeners (mRelief focuses on SNAP) | Also questionnaires, and not built around a caregiver acting for a parent |
| [Nava Labs](https://www.navapbc.com/case-studies/ai-tools-public-benefits) *(not opened)*, state portals like ACCESS HRA | AI and document tools **for agency staff and navigators** | Built for caseworkers, not for the family doing the paperwork at home |
| [ianacare](https://ianacare.com/caregivers/), [Caring Village](https://caringvillage.com/blog/caregiver-tech/caregiver-apps-for-families/) | Family care apps for rides, meals, and action plans | They coordinate chores, not money or applications |
| [Wellthy](https://wellthy.com/for-employers), [Homethrive](https://homethrive.com/) | A human coordinator who handles benefits paperwork | **Only if your employer pays for it** |

**Line for judges:** "NCOA tells you what you might get. We take the paperwork you already have and hand you the applications, ready to sign."

## How this scores on the rubric

- **C1 (x2):** $58B is unclaimed *even though* a great free screener exists, which proves the paperwork is the bottleneck.
- **C2 (x3):** three strong AI verbs (read → match → fill), with a clear input (photos) and output (drafts). The guardrail line is easy to explain: "AI fills, a human signs."
- **C3 (x2):** the three screens tell a complete journey: snap → drafts → sign and share, with the counter going up.
- **C4 (x3):** clear jobs to split: 1 on fake demo documents and the limits table, 1 on the AI extraction prompt, 1 on screens, 1 on research and the pitch, and 1 as timekeeper and demo driver.

## Risks

- **Extraction mistakes** from blurry photos or unusual layouts. The confirm checkmark on every fact is the fix. Test with clean demo documents.
- **Privacy is the first question judges will ask.** Lead with it: "No SSNs stored, files deleted after reading, family never sees documents, demo uses fake paperwork."
- **Rules differ by state and change yearly.** Use one state's limits and put the date on screen.
- **Feasibility:** document upload and AI extraction are the riskiest part of the build. Check early that Base44's built-in file upload and AI extraction work for this. If extraction fails twice, fall back to the caregiver typing 4 numbers, and keep the rest of the flow.
