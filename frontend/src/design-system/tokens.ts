// Design tokens as TypeScript constants
export const BORDER_RADIUS = {
  xs: 'rounded-lg',    // 8px
  sm: 'rounded-xl',    // 12px
  md: 'rounded-2xl',   // 16px
  full: 'rounded-full', // 9999px
} as const

export const SHADOW = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
} as const

export const TRANSITION = {
  default: 'transition-colors duration-200',
  slow: 'transition-colors duration-300',
} as const

export const MAX_WIDTH = 'max-w-6xl mx-auto px-6'
export const SECTION_PADDING = 'py-24'
export const CARD_PADDING = 'p-8'
