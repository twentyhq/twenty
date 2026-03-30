import { ArrowRightUpIcon, SOCIAL_ICONS } from '@/icons';
import type { MenuScheme, MenuSocialLinkType } from '@/sections/Menu/types';
import { theme } from '@/theme';
import { Separator } from '@base-ui/react/separator';
import { styled } from '@linaria/react';

const SocialContainer = styled.nav`
  display: none;
  max-width: 100%;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    column-gap: ${theme.spacing(5)};
    display: grid;
    grid-auto-flow: column;
    justify-content: end;
  }
`;

const SocialLinkItem = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    column-gap: ${theme.spacing(5)};
    display: grid;
    grid-auto-flow: column;

    &.discord-link {
      display: none;
    }
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    &.discord-link {
      display: grid;
    }
  }
`;

const SocialLink = styled.a`
  align-items: center;
  border-radius: ${theme.radius(1)};
  column-gap: ${theme.spacing(2)};
  display: grid;
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  grid-auto-flow: column;
  letter-spacing: 0;
  text-decoration: none;
  white-space: nowrap;

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const Divider = styled(Separator)`
  height: 10px;
  width: 0px;

  &[data-scheme='primary'] {
    border-left: 1px solid ${theme.colors.primary.border[40]};
  }

  &[data-scheme='secondary'] {
    border-left: 1px solid ${theme.colors.secondary.border[40]};
  }
`;

type SocialProps = {
  scheme: MenuScheme;
  socialLinks: MenuSocialLinkType[];
};

export function Social({ scheme, socialLinks }: SocialProps) {
  const iconFillColor =
    scheme === 'primary'
      ? theme.colors.secondary.background[100]
      : theme.colors.primary.background[100];

  return (
    <SocialContainer aria-label="Social media">
      {socialLinks
        .filter((item) => item.showInDesktop)
        .map((item, index) => {
          const IconComponent = SOCIAL_ICONS[item.icon];
          if (!IconComponent) return null;

          return (
            <SocialLinkItem key={item.href} className={item.className}>
              {index > 0 && (
                <Divider data-scheme={scheme} orientation="vertical" />
              )}
              <SocialLink
                data-scheme={scheme}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.ariaLabel}
              >
                <IconComponent
                  size={14}
                  fillColor={iconFillColor}
                  aria-hidden="true"
                />
                {item.label}
                <ArrowRightUpIcon
                  size={8}
                  strokeColor={theme.colors.highlight[100]}
                  aria-hidden="true"
                />
              </SocialLink>
            </SocialLinkItem>
          );
        })}
    </SocialContainer>
  );
}
