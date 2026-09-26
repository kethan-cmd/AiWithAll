// OCR text fixtures for a Social Security benefit letter. All values are invented.

export const SSA_CLEAN = `Social Security Benefit Notice
December 2, 2025
HELEN M PARK
1847 Alder Street
Tacoma, WA 98405
Your new benefit amount
Your Social Security benefit will increase by 2.8 percent in 2026
because of a rise in the cost of living.
Monthly Social Security benefit before deductions $1,542.00
Medicare medical insurance premium -$202.90
The amount we will pay $1,339.10
Social Security number: 123-45-6789`

export const SSA_NOISY = `Socia1 Security Benefit Notice
Decernber 2, 2025
HELEN M PARK
Your new benefit arnount
Monthly Social Security benefit before deductions $ 1,S42 . 00
Medicare medical insurance premium - $202.9O
The arnount we wi11 pay $1,339.1O
SSN 123 45 6789`

/** Label and amount split across two lines, as OCR does with table columns. */
export const SSA_SPLIT = `Your new benefit amount
Monthly benefit
$1,542.00
The amount we will pay
$1,339.10`

/** Only a paid amount, no before-deductions line. */
export const SSA_PAID_ONLY = `Starting January 2026 you will receive $1,339.10 each month.`
