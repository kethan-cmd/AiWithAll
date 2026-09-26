export interface FaqItem {
  id: string
  q: string
  a: string[]
}

export const FAQ: FaqItem[] = [
  {
    id: 'cost',
    q: 'What does it cost?',
    a: [
      'Nothing. The app is free, and so are the programs it points you to and the SHIP counselors who review applications with you.',
      'If anyone asks you to pay to apply for a Medicare Savings Program or Extra Help, that is a red flag.',
    ],
  },
  {
    id: 'legal-advice',
    q: 'Is this legal advice?',
    a: [
      'No. It is a paperwork helper. We show programs your parent is likely to qualify for, based on fixed rules we list on the Sources page, and we fill in drafts.',
      'The agency makes the final decision. A free State Health Insurance Assistance Program (SHIP) counselor can check everything with you before you send it.',
    ],
  },
  {
    id: 'who-submits',
    q: 'Who signs and submits the applications?',
    a: [
      'A person, always. Your parent signs, or you sign as their authorized representative if the form allows it. Then you, or a SHIP counselor with you, submit it.',
      'The app never signs, never submits, and never contacts an agency for you.',
    ],
  },
  {
    id: 'reading-wrong',
    q: 'What if the reading is wrong?',
    a: [
      'You check every fact before we use it. Each one shows the document it came from, and you can fix it or type it in yourself.',
      'Nothing goes into a draft until you tap the checkmark.',
    ],
  },
  {
    id: 'family-sees',
    q: 'Does my family see my documents?',
    a: [
      'No. Photos stay on the device you took them on and are cleared once you confirm the facts. Family members only see the shared task list: who is signing, who is calling the counselor, what is still missing.',
    ],
  },
  {
    id: 'ssn',
    q: 'Do you read Social Security or account numbers?',
    a: [
      'No. We only look for four facts: date of birth, Medicare parts, monthly income and bank balance. Social Security numbers, Medicare numbers and account numbers are never read or stored.',
      'Those fields stay blank in every draft, marked "fill by hand".',
    ],
  },
  {
    id: 'which-state',
    q: 'Which state does this work in?',
    a: [
      'Right now, Washington. Medicare Savings Program limits and forms differ by state, so we use one state\'s rules and show the date we checked them.',
      'Extra Help is a federal program with one set of limits nationwide (Alaska and Hawaii are a little higher), so that part travels with you.',
    ],
  },
  {
    id: 'why-not-screener',
    q: 'How is this different from a benefits screener?',
    a: [
      'Screeners like NCOA BenefitsCheckUp are excellent at telling you what you might get across thousands of programs. We start one step later: from the paperwork you already have, to applications filled in and ready to sign, with the rest of the work shared across your family.',
    ],
  },
]
