import { useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Biggest photo we accept. Phone photos are well under this. */
const MAX_BYTES = 25 * 1024 * 1024

export interface UploadButtonProps {
  onFile: (file: File) => void
  onError?: (message: string) => void
  children: ReactNode
  /** Open the rear camera directly on phones. */
  capture?: boolean
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  className?: string
  disabled?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
}

/** A real button that opens the file picker (or camera). The file stays in
 *  memory: it is handed to onFile and never uploaded. */
export default function UploadButton({
  onFile,
  onError,
  children,
  capture,
  variant = 'default',
  className,
  disabled,
  ...aria
}: UploadButtonProps) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button
        type="button"
        variant={variant}
        disabled={disabled}
        className={cn('h-11 rounded-xl px-4 text-sm font-semibold', className)}
        onClick={() => input.current?.click()}
        {...aria}
      >
        {children}
      </Button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture={capture ? 'environment' : undefined}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0]
          e.currentTarget.value = ''
          if (!file) return
          if (file.type && !file.type.startsWith('image/')) {
            onError?.('That file is not a photo. Choose a JPG or PNG picture of the document.')
            return
          }
          if (file.size > MAX_BYTES) {
            onError?.('That photo is too large. Try a smaller photo or a screenshot.')
            return
          }
          onFile(file)
        }}
      />
    </>
  )
}
