// Base44 mode (stub for later). When this app is hosted on Base44, the
// platform's AI integration can read a document instead of on-device OCR.
// It stays off unless a Base44 SDK client is present as window.base44.
//
// How the hosted version would call it:
//
//   const { file_url } = await base44.integrations.Core.UploadFile({ file })
//   const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
//     file_url,
//     json_schema: FACT_SCHEMA, // only the four facts, never SSN or account numbers
//   })
//   // then delete the uploaded file right away, so photos are never kept
//
// or, with a prompt:
//
//   await base44.integrations.Core.InvokeLLM({
//     prompt: 'Read only: date of birth, Medicare parts, monthly Social Security
//              before deductions, ending bank balance. Never return SSNs,
//              Medicare numbers or account numbers.',
//     file_urls: [file_url],
//     response_json_schema: FACT_SCHEMA,
//   })
//
// Uploading means the photo leaves the device, so the hosted version must
// delete the file as soon as the facts are confirmed.

import type { ReadHit, ReadingProvider } from '@/contracts'
import { parse } from './parsers'

/** The JSON shape we would ask the model for. Four facts only. */
export const FACT_SCHEMA = {
  type: 'object',
  properties: {
    birth_date: { type: 'string', description: 'Date of birth, YYYY-MM-DD' },
    medicare_parts: { type: 'array', items: { type: 'string', enum: ['A', 'B', 'D'] } },
    monthly_income: { type: 'number', description: 'Monthly Social Security before deductions, dollars' },
    bank_balance: { type: 'number', description: 'Ending balance on the statement, dollars' },
  },
} as const

interface Base44Like {
  integrations?: {
    Core?: {
      UploadFile?: (a: { file: File }) => Promise<{ file_url: string }>
      ExtractDataFromUploadedFile?: (a: {
        file_url: string
        json_schema: unknown
      }) => Promise<{ status?: string; output?: Record<string, unknown> }>
    }
  }
}

function client(): Base44Like | null {
  if (typeof window === 'undefined') return null
  return ((window as unknown as { base44?: Base44Like }).base44 ?? null) || null
}

export const base44Provider: ReadingProvider = {
  mode: 'base44',
  async available() {
    const core = client()?.integrations?.Core
    return Boolean(core?.UploadFile && core?.ExtractDataFromUploadedFile)
  },
  async read(input, onProgress): Promise<ReadHit[]> {
    const core = client()?.integrations?.Core
    if (!core?.UploadFile || !core.ExtractDataFromUploadedFile || !input.file) {
      throw new Error('The hosted reader is not set up here. You can type the facts instead.')
    }
    onProgress?.({ stage: 'loading', pct: 0.1 })
    const { file_url } = await core.UploadFile({ file: input.file })
    onProgress?.({ stage: 'recognizing', pct: 0.4 })
    const res = await core.ExtractDataFromUploadedFile({ file_url, json_schema: FACT_SCHEMA })
    onProgress?.({ stage: 'parsing', pct: 0.9 })
    const out = res.output ?? {}
    // Reuse the tested parsers on a tiny labeled text, so values are checked
    // the same way as on-device reading. Confidence is medium: a person checks.
    const lines = [
      out.birth_date ? `Date of birth ${String(out.birth_date)}` : '',
      Array.isArray(out.medicare_parts) ? out.medicare_parts.map((p) => `Part ${String(p)}`).join(' ') : '',
      typeof out.monthly_income === 'number' ? `Monthly benefit $${out.monthly_income.toFixed(2)}` : '',
      typeof out.bank_balance === 'number' ? `Ending balance $${out.bank_balance.toFixed(2)}` : '',
    ].join('\n')
    onProgress?.({ stage: 'done', pct: 1 })
    return parse(input.kind, lines).map((h) => ({ ...h, confidence: 'medium' as const }))
  },
}
