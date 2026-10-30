import { type SyntheticLikeEvent } from '@/front-component-build/internal/jsx-runtime/types/SyntheticLikeEvent';

export const isSyntheticLikeEvent = (
  event: unknown,
): event is SyntheticLikeEvent =>
  event != null && typeof event === 'object' && 'nativeEvent' in event;
