import { type ThemeColor } from '@ui/theme/constants/MainColorNames';

import { type ASSISTANT_AVATAR_COLORS } from '../internal/constants/assistantAvatarColors.constant';

export type AssistantAvatarColor = Extract<
  ThemeColor,
  (typeof ASSISTANT_AVATAR_COLORS)[number]
>;
