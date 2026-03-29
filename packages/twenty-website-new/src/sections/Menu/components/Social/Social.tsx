import { ArrowRightUpIcon } from '@/icons';
import { SOCIAL_LINKS } from '@/sections/Menu/constants/social-links';
import { theme } from '@/theme';
import { Separator } from '@base-ui/react/separator';
import { styled } from '@linaria/react';

const SocialContainer = styled.nav`
  display: none;
  max-width: 100%;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing(5)};
    justify-content: flex-end;
  }
`;

const SocialLinkItem = styled.div`
  display: none;
  flex-shrink: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(5)};

    &.discord-link {
      display: none;
    }
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    &.discord-link {
      display: flex;
    }
  }
`;

const SocialLink = styled.a`
  align-items: center;
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.primary.text[100]};
  display: flex;
  flex-shrink: 0;
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(2)};
  letter-spacing: 0;
  text-decoration: none;
  white-space: nowrap;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const Divider = styled(Separator)`
  border-left: 1px solid ${theme.colors.primary.border[40]};
  height: 10px;
  width: 0px;
`;

export function Social() {
  return (
    <SocialContainer aria-label="Social media">
      {SOCIAL_LINKS.filter((item) => item.showInDesktop).map((item, index) => (
        <SocialLinkItem key={item.href} className={item.className}>
          {index > 0 && <Divider orientation="vertical" />}
          <SocialLink
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.ariaLabel}
          >
            <item.icon
              size={14}
              fillColor={theme.colors.secondary.background[100]}
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
      ))}
    </SocialContainer>
  );
}
