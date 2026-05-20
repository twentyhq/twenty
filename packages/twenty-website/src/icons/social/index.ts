import type { ComponentType } from 'react';
import { DiscordIcon } from './Discord';
import { GitHubIcon } from './GitHub';
import { LinkedInIcon } from './LinkedIn';
import { XIcon } from './X';

export { DiscordIcon } from './Discord';
export { GitHubIcon } from './GitHub';
export { LinkedInIcon } from './LinkedIn';
export { XIcon } from './X';

export type SocialIconProps = { size: number; fillColor: string };

export const SOCIAL_ICONS: Record<string, ComponentType<SocialIconProps>> = {
  discord: DiscordIcon,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
};
