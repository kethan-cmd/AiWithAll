// OCR text fixtures for a bank statement. All values are invented.

export const BANK_CLEAN = `Evergreen Community Credit Union
Member statement
Statement period August 1 - August 31, 2026
HELEN M PARK
Account number 0012345678901
Beginning balance $3,012.44
Deposits and credits +$1,339.10
Withdrawals and debits -$1,151.54
Ending balance $3,200.00
Date Description Amount Balance
08/03 SSA TREAS 310 SOC SEC deposit 1,339.10 4,351.54
08/05 Corner Market groceries -142.18 4,209.36`

export const BANK_NOISY = `Evergreen Cornmunity Credit Union
Statement period August 1 - August 31, 2026
Beginning ba1ance $ 3,O12.44
Endlng ba1ance   $ 3,2OO.OO
08/03 SSA TREAS 310 SOC SEC 1,339.1O 4,351.54`

export const BANK_TWO_ACCOUNTS = `Checking account ending balance $1,200.00
Savings account ending balance $2,000.00`

export const BANK_AVAILABLE = `Available balance
3,200.00`
