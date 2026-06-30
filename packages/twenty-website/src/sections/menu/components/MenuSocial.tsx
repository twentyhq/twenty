import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { formatCompactCount, type CommunityStats } from '@/platform/community';
import { useLocale } from '@/platform/i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

import { ExternalArrow, ExternalLink, VerticalDivider } from '@/ui';

import { type MenuSocialLink } from '../types/menu-social-link';

const SocialRow = styled.nav`
  display: none;

  ${mediaUp('md')} {
    align-items: center;
    column-gap: ${spacing(5)};
    display: grid;
    grid-auto-flow: column;
    justify-content: end;
  }
`;

const SocialItem = styled.span`
  align-items: center;
  column-gap: ${spacing(5)};
  display: flex;

  &[data-wide-only] {
    display: none;

    ${mediaUp('lg')} {
      display: flex;
    }
  }
`;

const SocialAnchor = styled(ExternalLink)`
  align-items: center;
  color: ${semanticColor.ink};
  column-gap: ${spacing(2)};
  display: grid;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  grid-auto-flow: column;
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

export type MenuSocialProps = {
  links: readonly MenuSocialLink[];
  stats: CommunityStats;
};

export function MenuSocial({ links, stats }: MenuSocialProps) {
  const { i18n } = useLingui();
  const locale = useLocale();
  const desktopLinks = links.filter((link) => link.showInDesktop);

  return (
    <SocialRow aria-label={i18n._(msg`Community`)}>
      {desktopLinks.map((link, index) => {
        const IconComponent = link.icon;
        const isWideOnly = link.statKey === 'discordMembers';
        return (
          <SocialItem
            data-wide-only={isWideOnly ? '' : undefined}
            key={link.href}
          >
            {index > 0 && <VerticalDivider aria-hidden />}
            <SocialAnchor aria-label={i18n._(link.ariaLabel)} href={link.href}>
              <IconComponent aria-hidden size={14} />
              {link.statKey
                ? formatCompactCount(stats[link.statKey], locale)
                : null}
              <ExternalArrow />
            </SocialAnchor>
          </SocialItem>
        );
      })}
    </SocialRow>
  );
}
