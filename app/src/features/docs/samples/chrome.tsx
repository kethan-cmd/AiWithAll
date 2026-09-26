// Shared pieces for the fake sample documents: the SAMPLE watermark, the
// "not real" footer and the outer <svg>.

import type { ReactNode } from 'react'
import { SANS_FONT } from './sampleLayout'

export interface SampleDocProps {
  className?: string
  /** Hide from screen readers when a visible label already names the doc. */
  decorative?: boolean
}

export function DocSvg({
  width,
  height,
  label,
  className,
  decorative,
  children,
}: SampleDocProps & { width: number; height: number; label: string; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      fontFamily={SANS_FONT}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      {children}
    </svg>
  )
}

export function Watermark({ x, y, size, angle }: { x: number; y: number; size: number; angle: number }) {
  return (
    <text
      x={x}
      y={y}
      transform={`rotate(${angle} ${x} ${y})`}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={size}
      fontWeight={800}
      letterSpacing={size * 0.08}
      fill="#c0392b"
      fillOpacity={0.11}
      stroke="#c0392b"
      strokeOpacity={0.16}
      strokeWidth={2}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      SAMPLE
    </text>
  )
}

export function DemoFooter({ y, x, right, size = 11 }: { y: number; x: number; right: number; size?: number }) {
  return (
    <g fontSize={size} fill="#7a8494">
      <text x={x} y={y} fontStyle="italic">
        Demo document, not real
      </text>
      <text x={right} y={y} textAnchor="end">
        Park family sample
      </text>
    </g>
  )
}
