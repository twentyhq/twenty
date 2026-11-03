import { CONDITIONAL_DISPLAY_CONTEXT_KEYS } from '@/constants/ConditionalDisplayContextKeys';
import { type ConditionalDisplayAdminContextKey } from '@/types/conditional-display/ConditionalDisplayAdminContextKey';
import { isConditionalDisplayContextKey } from '@/utils/conditional-display/isConditionalDisplayContextKey';

export const isConditionalDisplayAdminContextKey = (
  contextKey: string,
): contextKey is ConditionalDisplayAdminContextKey =>
  isConditionalDisplayContextKey(contextKey) &&
  CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey].owner === 'admin';
