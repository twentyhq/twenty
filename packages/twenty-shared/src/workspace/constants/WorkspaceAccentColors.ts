import { type TAG_COLORS } from '@/constants/TagColors';

export const WORKSPACE_ACCENT_COLORS = [
  'blue',
  'iris',
  'violet',
  'purple',
  'plum',
  'pink',
  'crimson',
  'red',
  'tomato',
  'orange',
  'grass',
  'green',
  'jade',
  'turquoise',
  'cyan',
] as const satisfies readonly (typeof TAG_COLORS)[number][];
