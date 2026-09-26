# Money on the Table: Product Blueprint

**The caregiver photographs the paperwork they already have, and the AI does every step it legally can: it reads the documents, finds likely programs, pre-fills the applications, and lists what's missing.** A person only has to check the drafts, sign, and submit.

Pod: **Healthcare & Caregiving**. The sections follow the Analog Sprint packet order, and each one maps to a rubric line:

| Rubric line | Weight | Where |
|---|---|---|
| C1 Problem & Urgency | x2 | Sections 2-3 |
| C2 Solution & AI Function | x3 | Sections 5-6 |
| C3 Prototype & User Journey | x2 | Section 6 |
| C4 Team Delivery & Participation | x3 | Section 1 |

---

## 1. Team agreement (fill in at the table)

| Role | Name | Owns |
|---|---|---|
| Research lead | ______ | Stats, caregiver interview (section 3), answering "how do you know?" |
| AI lead | ______ | The extraction prompt and the AI sentence |
| Screens lead | ______ | Drawing Screens 1-3, then building them in Base44 |
| Data lead | ______ | Fake demo documents and the one-state limits table |
| Timekeeper and demo driver | ______ | Keeps milestones on time, runs the live demo |

- **How we decide:** we talk for 2 minutes, then vote. The majority wins, and a tie goes to the owner of that part.
- **Check-ins:** at each facilitator milestone, each person says in one sentence what they finished and what's next.
- **Pitch split:** the research lead gives the problem, the AI lead gives the AI sentence, the screens lead walks through the screens, and the demo driver closes on the counter.
- **Signatures:** ______ ______ ______ ______ ______

## 2. Community profile

- **Who:** family caregivers of a parent or spouse with dementia. Usually one adult child carries most of the load while working.
- **Size:**
  - **Nearly 13 million** unpaid dementia caregivers. [Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures)
  - **63 million** family caregivers overall. [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)
- **Their situation:**
  - **7 in 10 are employed.**
  - **Half report a negative financial impact**, and **a quarter take on debt**. [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)
  - **59%** report high to very high stress. [Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures)

## 3. Problem statement (who / how / why)

> **Family caregivers of people with dementia** (who) **watch benefits their parent likely qualifies for go unclaimed, even though family caregivers already pay about $7,242 a year out of pocket (26% of their income)** (how), **because even after a screener says "you may qualify," someone still has to find the documents and fill out long government forms, and the caregiver has no time left** (why).

**Urgency.**
- **$58 billion a year** goes unclaimed by eligible older adults across just three programs (SNAP, SSI, Medicare Savings Programs). Only **38%** of eligible 65+ adults get SNAP, and Medicare Savings Program participation is about **49%**. [NCOA 2026](https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/)
- **Extra Help** with drug costs is worth about **$5,700 a year**, according to SSA's estimate. [NCOA](https://www.ncoa.org/article/what-are-the-benefits-of-medicare-part-d-low-income-subsidy-lis/)
- Family caregivers (all conditions, not only dementia) spend **$7,242 a year** out of pocket on average, which is **26% of their income**. [AARP 2021](https://www.aarp.org/pri/topics/ltss/family-caregiving/family-caregivers-cost-survey/)
- **The forms are heavy.** The Washington MSP application runs **8 sections**, asks for **every household member's Social Security number**, and requires **proof when asked** and **a signature attesting** to everything. [WA HCA 13-691](https://www.hca.wa.gov/assets/free-or-low-cost/13-691.pdf)
- There is caregiver money on the table too. Medicare's GUIDE dementia model covers respite "**up to $2,500 annually**" through participating providers. [CMS](https://www.cms.gov/priorities/innovation/innovation-models/guide)

**Why not just use NCOA?** NCOA's BenefitsCheckUp is free, covers **2,000+ programs** and gives a report with "Apply Online" links and blank forms. [How it works](https://benefitscheckup.org/article/what-is-benefitscheckup) Yet NCOA's own research still counts $58B unclaimed. Finding the programs isn't the bottleneck. **Filling in the forms is.**

**Caregiver evidence (fill in before the pitch).** Talk to one caregiver: a parent, a grandparent, a neighbor, or a mentor who has cared for someone. Ask:
1. "Have you ever looked up help you might qualify for?"
2. "What stopped you from applying, or what was the hardest part?"
3. "If someone filled in the forms and you only had to sign, would you do it?"

> Quote: "________________________________________" (relationship: ______)

## 4. Solution Storm: top 2 side by side

| | Survey version | **Paperwork version (chosen)** |
|---|---|---|
| User gives | 10 tap answers | Photos of documents they already have |
| AI does | Explains matches | **Reads** the documents, **matches** programs, **fills** the application drafts |
| User gets | A list of likely programs | Pre-filled application drafts plus a "still needed" checklist |
| vs NCOA | Duplicates it | Fills in the blank forms NCOA links to |
| Why chosen | Easy to build, but NCOA already does it | It does the part people actually get stuck on |

## 5. Three must-have features (MVP box)

1. **Snap your paperwork.** Upload photos of 3-4 standard documents. AI pulls out the key facts (birth date, Medicare status, monthly income, bank balance), and the caregiver confirms each one with a tap.
2. **Drafted applications.** The demo drafts two real forms: the **Medicare Savings Program** and **Extra Help (SSA-1020)**. Each draft shows the fields **already filled in** from the documents, with the source document next to each field and a **"still needed"** list. GUIDE has no application, so it becomes a task: "Find a GUIDE provider."
3. **Hand-off and share.** The steps AI can't do (**sign**, **submit**, **find a GUIDE provider**) become tasks along with any missing documents. Family claims them, and a **"$ in progress"** counter tracks it all.

**Not in the MVP:** submitting to agencies, e-signatures, storing SSNs, and more than one state.

## 6. Side A: Product Blueprint

**User story.**
> As a daughter caring for my mom with dementia while working full time, I want to hand over the paperwork I already have and get applications that are ready to sign, so we actually get the help instead of just a list of maybe.

**Day of Service link:** caregiving is a good deed done every day, often alone. This app turns a scattered family into one team: each person claims a task, so no one carries the paperwork alone.

**Screen 1: Start.** "Snap your paperwork." Four big tiles: *Medicare card*, *Social Security letter*, *Bank statement*, *Tax return*. Each tile turns green when it's uploaded. The screen says "Only you can see these files."

**Screen 2: AI does its job.** A card with the extracted facts ("Age 81 · Medicare A+B · $1,640/mo Social Security · $3,200 in bank"), each with a ✓ to confirm. Below it are two program cards, **Medicare Savings Program** and **Extra Help**, each with an **"Open draft"** button. Draw one draft open beside the card: the real form fields filled in, each tagged with its source document (for example "from: SS letter"). The SSN field is always left blank with the note **"fill by hand."**

> **AI sentence:** The caregiver **gives** photos of their parent's paperwork → the AI **reads** the facts, **matches** likely programs and **fills in** the applications → the caregiver **gets** drafts to check and sign, plus a list of what's still missing.

**Screen 3: Next step.** "What's left." Tasks for the things only a person can do, each with who claimed it:
- Caregiver: "Sign both applications as authorized representative"
- Brother: "Book SHIP counselor to review and submit"
- Sister: "Find a GUIDE provider near Mom (up to $2,500/yr respite)"

Any unclaimed task shows a big **Claim** button. A big counter shows "**about $8,100/yr in progress** (estimate)". The ✓ marks fill in as tasks are done.

The counter adds up two estimates:
- **$2,435**: the 2026 Part B premium the MSP would pay, $202.90 a month × 12 ([Medicare.gov](https://www.medicare.gov/basics/costs/medicare-costs))
- **about $5,700**: SSA's estimate for Extra Help

Re-check both on the day.

**Guardrails.**
- **AI never signs or submits.** A person signs (the applicant or their authorized representative), and a person submits, ideally after a free SHIP counselor reviews it. Some forms allow a named authorized representative to "sign the application on your behalf." [WA HCA 13-691](https://www.hca.wa.gov/assets/free-or-low-cost/13-691.pdf)
- **Sensitive data:**
  - SSNs and full account numbers are **never stored**. The AI is asked for only 4 facts (birth date, Medicare parts, monthly income, bank balance), so it never pulls out an SSN or account number. The SSN field is always filled by hand.
  - Photos are deleted once the facts are confirmed.
  - Only the caregiver's account can see documents. Family sees tasks, never the files.
- **The human checks every fact.** Each extracted value shows its source document, and the caregiver confirms it before it goes into a draft.
- **Eligibility is "likely," never promised.** Matching uses fixed income and asset limits for one state, dated on screen. The AI reads and fills, but a rules table decides "likely."
- **The demo uses fake documents only.** No real family's paperwork goes into a hackathon app.

**BASE prompt** (to paste into Base44 after lunch):
> Build a mobile-first web app called "Money on the Table" for family caregivers of people with dementia. Screen 1: four upload tiles (Medicare card, Social Security award letter, bank statement, tax return) that save files to a Document entity visible only to the uploading user. Screen 2: use AI file extraction to pull out date of birth, Medicare parts, monthly income, and bank balance into a Facts entity, showing each value next to its source document with a confirm checkmark. Extract only these four fields, never Social Security numbers or account numbers. After the user confirms the facts, delete the uploaded file and its Document record. Match programs with simple rules: Medicare Savings Program and Extra Help if confirmed income and bank balance are under a fixed one-state limits table. Show matching programs as cards labeled "Likely match, confirm with a free counselor." Each card opens a pre-filled draft of about 6 key form fields filled from the facts, with the SSN field always blank and marked "fill by hand," plus a "still needed" list. Screen 3: a task list (sign as authorized representative, book SHIP counselor to review and submit, find a GUIDE provider if the caregiver checks "has a dementia diagnosis", find missing document) with Claim buttons and claimer names stored in a Task entity, plus a large running total of estimated dollars in progress. Calm design, large buttons.

---

## Similar apps (checked online)

| App | What it does | Gap we fill |
|---|---|---|
| [NCOA BenefitsCheckUp](https://benefitscheckup.org/article/what-is-benefitscheckup) | Free survey-based screener, 2,000+ programs, works for caregivers too, gives a report with "Apply Online" links and blank forms | You still fill in every field yourself. We start from documents and end at **pre-filled, ready-to-sign applications** |
| [mRelief](https://www.mrelief.com/), USA.gov Benefit Finder | Short tap-style screeners (mRelief focuses on SNAP) | Also questionnaires, and not built around a caregiver acting for a parent |
| [Nava Labs](https://www.navapbc.com/case-studies/ai-tools-public-benefits), state portals like ACCESS HRA | AI and document tools **for agency staff and navigators** | Built for caseworkers, not for the family doing the paperwork at home |
| [ianacare](https://ianacare.com/caregivers/), [Caring Village](https://caringvillage.com/blog/caregiver-tech/caregiver-apps-for-families/) | Family care apps for rides, meals, and action plans | They coordinate chores, not money or applications |
| [Wellthy](https://wellthy.com/for-employers), [Homethrive](https://homethrive.com/) | A human care coordinator, including help navigating benefits | **Only if your employer or health plan pays for it** |

**Line for judges:** "NCOA tells you what you might get. We take the paperwork you already have and hand you the applications, ready to sign."

## Risks

- **Extraction mistakes** from blurry photos or unusual layouts. The confirm checkmark on every fact is the fix. Test with clean demo documents.
- **Privacy is the first question judges will ask.** Lead with it: "No SSNs stored, files deleted after reading, family never sees documents, demo uses fake paperwork."
- **Rules differ by state and change yearly.** Use one state's limits and put the date on screen.
- **Feasibility:** document upload and AI extraction are the riskiest part of the build.
  - Check early that Base44's built-in file upload and AI extraction work, and that uploads are private and can be deleted. If not, say so honestly in the pitch and rely on fake documents.
  - If extraction fails twice, fall back to the caregiver typing 4 numbers, and keep the rest of the flow.

## Judge review

We ran a simulated judge after 3 review passes. It scored the blueprint **66/100**: C1 8, C2 7, C3 7, C4 5. Here is how each point was addressed:

| Judge fix | Status |
|---|---|
| Swap GUIDE's fake "draft" for a real second form | **Done:** the drafts are now MSP and Extra Help, and GUIDE is a "find a provider" task |
| Recompute the counter with the current Part B premium | **Done:** $2,435 + about $5,700 ≈ $8,100 |
| Fill in named roles, how we decide, and the pitch split (C4) | **Template added** in section 1. The team fills in names |
| Add one real caregiver quote (C1) | **Interview prompts added** in section 3. The team fills in the quote |

**Most likely judge question:** "How do you know the forms are what stop people? Did you talk to caregivers?" Answer it with the quote from section 3.
