// OCR text fixtures for a Form 1040 style summary. All values are invented.

export const TAX_CLEAN = `Form 1040 summary Tax year 2025
HELEN M PARK
Your social security number 123-45-6789
Date of birth 03/14/1945
[x] You were born before January 2, 1961
Filing status Single
1z Wages, salaries, tips 0.00
6a Social Security benefits 18,000.00
6b Taxable amount 0.00
11 Adjusted gross income 41.20`

export const TAX_NOISY = `Form 1O40 summary
HELEN M PARK
Date of blrth O3/l4/1945
[x] You were born before January 2, 1961
6a Socia1 Security benefits 18,OOO.OO`

/** Only the checkbox: a cutoff, not a birthday, so no date should come out. */
export const TAX_CHECKBOX_ONLY = `[x] You were born before January 2, 1961
Filing status Single`

export const DOB_FORMATS = [
  ['DOB: 03/14/1945', '1945-03-14'],
  ['Date of birth March 14, 1945', '1945-03-14'],
  ['Born 1945-03-14', '1945-03-14'],
  ['Birth date 14 Mar 1945', '1945-03-14'],
  ['Fecha de nacimiento 3-14-1945', '1945-03-14'],
] as const
