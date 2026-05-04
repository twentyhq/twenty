import { ArrowRightUpIcon, SOCIAL_ICONS } from '@/icons';
import type { MessageDescriptor } from '@lingui/core';
import type { FooterSocialLinkType } from '@/sections/Footer/types';
import { theme } from '@/theme';
import { Separator } from '@base-ui/react/separator';
import { styled } from '@linaria/react';
import React from 'react';

const BottomGrid = styled.div`
  display: grid;
  font-size: ${theme.font.size(3)};
  gap: ${theme.spacing(6)};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto auto;
  min-width: 0;
  width: 100%;
`;

const Copyright = styled.div`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  grid-column: 1 / -1;
  grid-row: 2;
  justify-self: start;
  text-transform: uppercase;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-column: 1;
    grid-row: 1;
  }
`;

const SocialNav = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(6)};
  grid-column: 1 / -1;
  grid-row: 1;
  justify-content: start;
  max-width: 100%;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-wrap: nowrap;
    grid-column: 2;
    justify-content: flex-end;
    justify-self: end;
  }
`;

const SocialDivider = styled(Separator)`
  background-color: ${theme.colors.primary.border[40]};
  border: none;
  height: 10px;
  width: 1px;
`;

const SocialLink = styled.a`
  align-items: center;
  color: ${theme.colors.primary.text[100]};
  display: flex;
  flex-shrink: 0;
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(3)};
  line-height: 14px;
  text-decoration: none;
  white-space: nowrap;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

type BottomProps = {
  copyright: MessageDescriptor;
  links: FooterSocialLinkType[];
  renderText: (descriptor: MessageDescriptor) => string;
};

export function Bottom({ copyright, links, renderText }: BottomProps) {
  return (
    <BottomGrid>
      <Copyright>{renderText(copyright)}</Copyright>
      <SocialNav aria-label="Social media">
        {links.map((link, index) => {
          const IconComponent = SOCIAL_ICONS[link.icon];

          return (
            <React.Fragment key={link.href}>
              {index > 0 && <SocialDivider orientation="vertical" />}
              <SocialLink
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
              >
                <IconComponent
                  size={14}
                  fillColor={theme.colors.secondary.background[100]}
                  aria-hidden
                />
                {link.label ?? null}
                {link.label && (
                  <ArrowRightUpIcon
                    size={8}
                    strokeColor={theme.colors.highlight[100]}
                    aria-hidden
                  />
                )}
              </SocialLink>
            </React.Fragment>
          );
        })}
      </SocialNav>
    </BottomGrid>
  );
}
