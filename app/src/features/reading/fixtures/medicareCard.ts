// OCR text fixtures for a Medicare card. All values are invented.

export const MEDICARE_CLEAN = `MEDICARE HEALTH INSURANCE
Name/Nombre
HELEN M PARK
Medicare Number/Número de Medicare
1EG4-TE5-MK73
Entitled to/Con derecho a Coverage starts/Cobertura empieza
HOSPITAL (PART A) 03-01-2010
MEDICAL (PART B) 03-01-2010
Demo document, not real`

export const MEDICARE_NOISY = `MED1CARE HEALTH lNSURANCE
Name/Nombre
HELEN M PARK
Medicare Number/Numero de Medicare
1EG4 TE5 MK73
Entit1ed to/Con derecho a    Coverage starts
HOSPlTAL (PART  A)   O3-01-2O10
MEDICAL  (PART 8)   03-O1-2010`

/** Only the words, as a camera sometimes catches just part of the card. */
export const MEDICARE_WORDS_ONLY = `HOSPITAL 03-01-2010
MEDICAL 03-01-2010`
