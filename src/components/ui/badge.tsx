import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground border-border',
        amber:   'bg-amber-100 text-amber-800 border-amber-200',
        sky:     'bg-sky-100 text-sky-800 border-sky-200',
        green:   'bg-emerald-50 text-emerald-700 border-emerald-200 normal-case tracking-normal',
        red:     'bg-red-50 text-red-700 border-red-200 normal-case tracking-normal',
        warn:    'bg-amber-50 text-amber-700 border-amber-200 normal-case tracking-normal',
        neutral: 'bg-zinc-50 text-zinc-600 border-zinc-200 normal-case tracking-normal',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
