import { TAG_COLORS } from '@/constants/TagColors';
import { type TagColor } from '@/types/TagColor';

export const isTagColor = (value: unknown): value is TagColor =>
  TAG_COLORS.includes(value as TagColor);
