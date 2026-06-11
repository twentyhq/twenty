import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { getServerI18n } from '@/platform/i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

import { ExternalLink, VerticalDivider } from '@/ui';

import { FOOTER } from './footer.data';
import { LocaleSwitcher } from './locale-switcher';

const BottomGrid = styled.div`
  display: grid;
  font-size: ${fontSize(3)};
  gap: ${spacing(6)};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto auto;
  min-width: 0;
  width: 100%;
`;

const CopyrightRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(4)};
  grid-column: 1 / -1;
  grid-row: 2;
  justify-self: start;
  min-width: 0;

  ${mediaUp('md')} {
    grid-column: 1;
    grid-row: 1;
  }
`;

const Copyright = styled.div`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  text-transform: uppercase;
`;

const SocialNav = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(6)};
  grid-column: 1 / -1;
  grid-row: 1;
  justify-content: start;
  min-width: 0;

  ${mediaUp('md')} {
    flex-wrap: nowrap;
    grid-column: 2;
    justify-content: flex-end;
    justify-self: end;
  }
`;

const SocialAnchor = styled(ExternalLink)`
  align-items: center;
  color: ${semanticColor.ink};
  display: flex;
  flex-shrink: 0;

  &:hover {
    color: ${color('blue')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

export function FooterBottom() {
  const i18n = getServerI18n();
  const year = new Date().getFullYear();

  return (
    <BottomGrid>
      <CopyrightRow>
        <Copyright>{i18n._(msg`© ${year} – Twenty`)}</Copyright>
        <LocaleSwitcher />
      </CopyrightRow>
      <SocialNav aria-label="Social media">
        {FOOTER.socialLinks.map((link, index) => {
          const IconComponent = link.icon;
          return (
            <Fragment key={link.href}>
              {index > 0 && <VerticalDivider aria-hidden />}
              <SocialAnchor aria-label={link.ariaLabel} href={link.href}>
                <IconComponent aria-hidden size={16} />
              </SocialAnchor>
            </Fragment>
          );
        })}
      </SocialNav>
    </BottomGrid>
  );
}
