import { type MessageDescriptor } from '@lingui/core';

import { type IconComponent } from '@/icons';

export type MenuSocialLink = {
  ariaLabel: MessageDescriptor;
  href: string;
  icon: IconComponent;
  showInDesktop: boolean;
  statKey?: 'githubStars' | 'discordMembers';
};
