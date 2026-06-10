import { IconArrowUpRight } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { formatCompactCount, type CommunityStats } from '@/platform/community';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

import { type MenuSocialLink } from './menu.data';

const SocialRow = styled.nav`
  display: none;

  ${mediaUp('md')} {
    align-items: center;
    column-gap: ${spacing(4)};
    display: flex;
    justify-content: end;
  }
`;

// The Discord chip only earns its space on wide viewports, matching the
// original behavior.
const SocialItem = styled.span`
  align-items: center;
  column-gap: ${spacing(4)};
  display: flex;

  &[data-wide-only] {
    display: none;

    ${mediaUp('lg')} {
      display: flex;
    }
  }
`;

const SocialAnchor = styled.a`
  align-items: center;
  color: ${semanticColor.ink};
  column-gap: ${spacing(2)};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: ${color('blue')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const Divider = styled.span`
  background-color: ${semanticColor.lineStrong};
  height: 10px;
  width: 1px;
`;

const Arrow = styled(IconArrowUpRight)`
  color: ${color('blue')};
`;

export type MenuSocialProps = {
  links: readonly MenuSocialLink[];
  stats: CommunityStats;
};

export function MenuSocial({ links, stats }: MenuSocialProps) {
  const desktopLinks = links.filter((link) => link.showInDesktop);

  return (
    <SocialRow aria-label="Community">
      {desktopLinks.map((link, index) => {
        const IconComponent = link.icon;
        const isWideOnly = link.statKey === 'discordMembers';
        return (
          <SocialItem
            data-wide-only={isWideOnly ? '' : undefined}
            key={link.href}
          >
            {index > 0 && <Divider aria-hidden />}
            <SocialAnchor
              aria-label={link.ariaLabel}
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <IconComponent aria-hidden size={16} stroke={1.6} />
              {link.statKey ? formatCompactCount(stats[link.statKey]) : null}
              <Arrow aria-hidden size={10} stroke={2} />
            </SocialAnchor>
          </SocialItem>
        );
      })}
    </SocialRow>
  );
}
