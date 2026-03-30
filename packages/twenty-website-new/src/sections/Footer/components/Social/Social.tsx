import { ArrowRightUpIcon } from '@/icons';
import { SOCIAL_LINKS } from '@/sections/Footer/constants/social-links';
import { theme } from '@/theme';
import { Separator } from '@base-ui/react/separator';
import { styled } from '@linaria/react';
import React from 'react';

const SocialContainer = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(6)};
  grid-column: 1 / -1;
  grid-row: 1;
  justify-content: center;
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

const SocialItem = styled.a`
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

export function Social() {
  return (
    <SocialContainer aria-label="Social media">
      {SOCIAL_LINKS.filter((item) => item.showInDrawer).map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <SocialDivider orientation="vertical" />}
          <SocialItem
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.ariaLabel}
          >
            <item.icon
              size={14}
              fillColor={theme.colors.secondary.background[100]}
              aria-hidden
            />
            {item.label}
            {item.label != null && (
              <ArrowRightUpIcon
                size={8}
                strokeColor={theme.colors.highlight[100]}
                aria-hidden
              />
            )}
          </SocialItem>
        </React.Fragment>
      ))}
    </SocialContainer>
  );
}
