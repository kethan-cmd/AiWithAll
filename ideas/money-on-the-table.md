# Money on the Table: Product Blueprint

This is the round-5 winner, slightly revised and laid out in the order of the Analog Sprint packet and the Side A chart paper. Every section maps to a rubric line:

| Rubric line | Weight |
|---|---|
| C1 Problem & Urgency | x2 |
| C2 Solution & AI Function | x3 |
| C3 Prototype & User Journey | x2 |
| C4 Team Delivery & Participation | x3 |

Pod: **Healthcare & Caregiving**. Theme: **unity, empathy, good deeds**.

---

## What changed from round 5 (small tweaks only)

1. **The caregiver is the only person the app is built for.** The main user is now the family caregiver, not the older adult or the students, so everything on screen speaks to them ("money *you* are missing").
2. **The AI job is one clear sentence** (see Screen 2). Screening stays rule-based. AI explains each match and turns it into tasks.
3. **The student role moved into the story, not the app.** On the Day of Service, students cover the caregiver's time so they can go to the counselor appointment. The app only needs a "share with family" step. That keeps the build to 3 screens.
4. **Positioning is sharper after the competitor check (below).** The competitors either screen the older adult, coordinate chores, or are paid concierge services for employees. None of them adds up money *for the caregiver* and splits the follow-up among the family.

---

## 1. Community profile (Understanding Your Community)

- **Who:** family caregivers of a parent or spouse with dementia. Usually one adult child carries most of the load while working.
- **Size:**
  - **Nearly 13 million** Americans give unpaid dementia care.
  - **63 million** Americans are family caregivers overall.
  - Sources: [Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures), [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/).
- **Their day:**
  - **7 in 10 are employed.**
  - **Half report a negative financial impact** from caregiving, and **a quarter take on debt**. [AARP/NAC 2025](https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/)
  - **59%** of dementia caregivers report high to very high emotional stress. [Alzheimer's Association 2026](https://www.alz.org/alzheimers-dementia/facts-figures)

## 2. Problem statement (who / how / why)

> **Family caregivers of people with dementia** (who) **are paying for care out of their own pocket, averaging $7,242 a year or 26% of their income, while money they likely qualify for goes unclaimed** (how), **because the programs are scattered, confusing, and nobody has the time to chase them** (why).

**Urgency (C1).**
- Older adults leave **$58 billion a year** unclaimed. Only **38%** of eligible 65+ adults get SNAP, and Medicare Savings Program participation is about **49%**. [NCOA 2026](https://www.ncoa.org/article/the-58-billion-benefits-gap-affecting-older-adults/)
- Caregivers pay **$7,242 a year** out of pocket, **26% of their income**. [AARP 2021](https://www.aarp.org/pri/topics/ltss/family-caregiving/family-caregivers-cost-survey/)
- New money exists that many families haven't heard of:
  - Medicare's **GUIDE** dementia model pays for respite "**up to $2,500 annually**" (it began July 2024). [CMS](https://www.cms.gov/priorities/innovation/innovation-models/guide)
  - **Every responding state pays family caregivers** through Medicaid in some circumstances. [KFF 2025](https://www.kff.org/medicaid/medicaids-home-care-support-for-family-caregivers-in-2025/)

## 3. Solution Storm: top 2 side by side

| | **Money on the Table** (chosen) | Fair Share |
|---|---|---|
| User gives | 10 tap answers | Each sibling's hours and costs |
| AI does | Explains matches, turns them into tasks | Writes a fair ask for each sibling |
| User gets | $ total + task list the family splits | A load chart and sent asks |
| Urgency | $58B unclaimed, 26% of income | 59% high stress |
| Why we picked it | A number judges can see, and it helps the whole family | Kept as a feature idea: the "share" step borrows from it |

## 4. Three must-have features (MVP box)

1. **10-question money check.** Tap answers only (state, Medicare/Medicaid, dementia diagnosis, income range, living together, caregiver works). Fixed rules flag likely programs.
2. **AI money cards.** For each match: why you likely qualify, an estimated $ per year, and 2-4 concrete next steps.
3. **Share and claim.** Send the steps to family members, who claim them. A running **"$ found"** total shows at the top.

**Not in the MVP:** filing applications, document upload, more than one state, and bank or Social Security numbers.

## 5. Side A: Product Blueprint

**User story.**
> As a daughter caring for my mom with dementia while working full time, I want to find out what money and help we're missing, so I can pay for a break without draining my savings.

**Screen 1: Start.** "Find money you're missing." Ten tap questions, one per screen, with a progress bar. No typing and no ID numbers.

**Screen 2: AI does its job.** Money cards appear, for example:
- "GUIDE respite: up to $2,500/yr"
- "Medicare Savings Program: pays your mom's Part B premium"
- "Dependent care credit"

Each card has a "why you likely qualify" line and its steps.

> **AI sentence:** The caregiver **gives** their 10 answers → the AI **explains** each program they likely qualify for and **breaks it into next steps** → the caregiver **gets** a dollar total and a to-do list their family can share.

**Screen 3: Next step.** "Share with family." Tasks show who claimed them, for example:
- Brother: "Call SHIP to book a free counselor"
- Sister: "Ask Mom's clinic if it's in GUIDE"

A big counter shows **"$4,100/yr found (estimate)"**. There is also a "Book a free counselor" button that opens the SHIP locator.

**Guardrails.**
- Every card says **"Likely match, confirm with a free counselor."** The app never promises eligibility.
- **No sensitive data:** income is a range only, and the app never asks for SSN, bank or Medicare numbers.
- **The app never files anything.** Free trained counselors (SHIP, the Area Agency on Aging) do the applications.
- Dollar amounts are always labeled **estimate**, with a "rules checked on [date]" line.
- AI only explains and plans. The eligibility flags come from the fixed rules table, not the AI.

**BASE prompt** (to paste into Base44 after lunch):
> Build a mobile-first web app called "Money on the Table" for family caregivers of people with dementia. Screen 1: a 10-step tap-only questionnaire (state, person's age, has Medicare, has Medicaid, dementia diagnosis yes/no, monthly income range, lives with caregiver yes/no, caregiver works yes/no, current paid help yes/no, biggest cost area). Save answers to a Screening entity. Screen 2: use a fixed rules list to flag likely programs (GUIDE respite, Medicare Savings Program, SNAP, Medicaid paid family caregiving, dependent care tax credit, state caregiver credit). Then call the AI to write, for each match, a one-sentence plain-English reason, an estimated yearly dollar value labeled "estimate", and 2-4 next-step tasks. Show them as cards with "Likely match, confirm with a free counselor." Screen 3: a share page listing all tasks with a "Claim" button and claimer name, stored in a MoneyTask entity, plus a large running total of estimated dollars found at the top. Never ask for SSN, bank, or Medicare numbers. Keep the design calm and simple with large buttons.

---

## Similar apps (checked online)

| App | What it does | Gap we fill |
|---|---|---|
| [NCOA BenefitsCheckUp](https://benefitscheckup.org/) | Free benefit screener for seniors | Screens the older adult. It doesn't total money *for the caregiver* or split the follow-up among family |
| [USA.gov Benefit Finder](https://en.wikipedia.org/wiki/Benefits.gov), [mRelief](https://www.mrelief.com/) | General and SNAP screeners, with tap-style questions | One program or generic, and not caregiving-specific (no GUIDE respite, paid family caregiving, or caregiver credits) |
| [ianacare](https://ianacare.com/caregivers/), [Caring Village](https://caringvillage.com/blog/caregiver-tech/caregiver-apps-for-families/) | Family care apps: invite family for rides and meals, action plans, paid navigator tier | Coordinate chores, not money. They don't find or total benefits |
| [Wellthy](https://wellthy.com/for-employers), [Homethrive](https://homethrive.com/) | A human care coordinator who also handles benefits and financial aid | **Only available if your employer pays for it.** Most hourly caregivers don't have it |

**Our line for judges:** "Screeners find benefits for seniors, family apps split chores, and concierge services cost your employer money. We're the free one that finds money *for the caregiver* and lets the whole family share the work of claiming it."

## How this scores on the rubric

- **C1 (x2):** a who/how/why statement backed by $58B unclaimed and 26% of income.
- **C2 (x3):** one clear AI verb pair ("explains and breaks into next steps") with a clear input and output. The rules-first design is an easy guardrail to explain.
- **C3 (x2):** the three screens tell a complete journey: questions → money cards → family claims, with the total going up.
- **C4 (x3):** easy roles to split: 1 on the rules table, 1 on the AI prompt, 1 on screens, 1 on research and the pitch, and 1 as timekeeper and demo driver.

## Risks

- Rules change by state and by year. Use one state and check the numbers on the day.
- The $ total must stay clearly labeled as an estimate. Judges may ask "how do you know?", and the answer is "fixed public rules plus a counselor confirms."
