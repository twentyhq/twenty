import { IconArrowUpRight } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { color, mediaUp, semanticColor, spacing } from '@/tokens';

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

const SocialAnchor = styled.a`
  align-items: center;
  color: ${semanticColor.ink};
  column-gap: ${spacing(1)};
  display: inline-flex;

  &:hover {
    color: ${color('blue')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const Divider = styled.span`
  background-color: ${semanticColor.line};
  height: 10px;
  width: 1px;
`;

const Arrow = styled(IconArrowUpRight)`
  color: ${color('blue')};
`;

export type MenuSocialProps = {
  links: readonly MenuSocialLink[];
};

export function MenuSocial({ links }: MenuSocialProps) {
  const desktopLinks = links.filter((link) => link.showInDesktop);

  return (
    <SocialRow aria-label="Community">
      {desktopLinks.map((link, index) => {
        const IconComponent = link.icon;
        return (
          <Fragment key={link.href}>
            {index > 0 && <Divider aria-hidden />}
            <SocialAnchor
              aria-label={link.ariaLabel}
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <IconComponent aria-hidden size={16} stroke={1.6} />
              <Arrow aria-hidden size={10} stroke={2} />
            </SocialAnchor>
          </Fragment>
        );
      })}
    </SocialRow>
  );
}
