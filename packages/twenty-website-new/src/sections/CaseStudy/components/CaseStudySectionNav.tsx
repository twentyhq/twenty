'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBrandDiscord,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState, type MouseEvent } from 'react';

const HERO_ANCHOR_ID = 'case-study-hero';
const SECTION_ID_PREFIX = 'case-study-section';

const Shell = styled.aside<{ $visible: boolean }>`
  display: none;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  position: fixed;
  right: ${theme.spacing(10)};
  top: 50%;
  transform: translateY(-50%);
  transition: opacity 0.25s ease;
  width: 213px;
  z-index: 10;

  @media (min-width: ${theme.breakpoints.lg}px) {
    display: flex;
  }
`;

const Panel = styled.div`
  background-color: ${theme.colors.secondary.background[100]};
  border: 1px solid ${theme.colors.secondary.border[10]};
  border-radius: ${theme.radius(3)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  overflow: hidden;
  padding: ${theme.spacing(5)};
  width: 100%;
`;

const Eyebrow = styled.p`
  color: ${theme.colors.secondary.text[40]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  line-height: ${theme.lineHeight(3)};
  margin: 0;
  text-transform: uppercase;
`;

const NavBody = styled.div`
  display: flex;
  gap: ${theme.spacing(4)};
`;

const RailTrack = styled.div`
  align-self: stretch;
  background-color: ${theme.colors.secondary.border[10]};
  border-radius: 2px;
  flex-shrink: 0;
  position: relative;
  width: 2px;
`;

const RailFill = styled.div<{ $percent: number }>`
  background-color: ${theme.colors.highlight[100]};
  border-radius: 2px;
  height: ${({ $percent }) => $percent}%;
  left: 0;
  position: absolute;
  top: 0;
  transition: height 0.25s ease;
  width: 100%;
`;

const NavList = styled.nav`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${theme.spacing(5)};
  min-height: 0;
  min-width: 0;
`;

const NavLink = styled.a<{ $active: boolean }>`
  color: ${({ $active }) =>
    $active
      ? theme.colors.secondary.text[100]
      : theme.colors.secondary.text[60]};
  cursor: pointer;
  display: block;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${({ $active }) =>
    $active ? theme.font.weight.medium : theme.font.weight.regular};
  line-height: ${theme.lineHeight(4.5)};
  overflow-wrap: anywhere;
  text-decoration: none;
  transition:
    color 0.15s ease,
    font-weight 0.15s ease,
    transform 0.15s ease;

  &:hover {
    color: ${theme.colors.secondary.text[100]};
  }
`;

const NavIndex = styled.span`
  color: ${theme.colors.secondary.text[40]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.05em;
  margin-right: ${theme.spacing(2)};
  text-transform: uppercase;
`;

const SocialRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(6)};
`;

const SocialLink = styled.a`
  color: ${theme.colors.secondary.text[60]};
  display: flex;

  &:hover {
    color: ${theme.colors.secondary.text[100]};
  }
`;

type CaseStudySectionNavProps = {
  items: string[];
};

export function CaseStudySectionNav({ items }: CaseStudySectionNavProps) {
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateFromScroll = useCallback(() => {
    const hero = document.getElementById(HERO_ANCHOR_ID);
    const viewportHeight = window.innerHeight;

    const heroRect = hero?.getBoundingClientRect();

    const pastHero = heroRect ? heroRect.bottom < viewportHeight * 0.42 : true;

    const lastSectionIndex = items.length - 1;
    const lastSection =
      items.length > 0
        ? document.getElementById(`${SECTION_ID_PREFIX}-${lastSectionIndex}`)
        : null;
    const lastSectionRect = lastSection?.getBoundingClientRect();
    const withinArticle = lastSectionRect
      ? lastSectionRect.bottom > viewportHeight * 0.42
      : true;

    setVisible(pastHero && withinArticle);

    let nextActive = 0;
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const element = document.getElementById(`${SECTION_ID_PREFIX}-${index}`);
      if (!element) {
        continue;
      }
      const { top } = element.getBoundingClientRect();
      if (top <= 120) {
        nextActive = index;
        break;
      }
    }
    setActiveIndex(nextActive);
  }, [items.length]);

  useEffect(() => {
    updateFromScroll();
    window.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll);
    return () => {
      window.removeEventListener('scroll', updateFromScroll);
      window.removeEventListener('resize', updateFromScroll);
    };
  }, [updateFromScroll]);

  const progressPercent =
    items.length === 0 ? 0 : ((activeIndex + 1) / items.length) * 100;

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <Shell $visible={visible} aria-hidden={!visible}>
      <Panel>
        <Eyebrow>On this page</Eyebrow>
        <NavBody>
          <RailTrack>
            <RailFill $percent={progressPercent} />
          </RailTrack>
          <NavList aria-label="On this page">
            {items.map((item, index) => (
              <NavLink
                key={index}
                $active={index === activeIndex}
                href={`#${SECTION_ID_PREFIX}-${index}`}
                onClick={(event) =>
                  handleNavClick(event, `${SECTION_ID_PREFIX}-${index}`)
                }
              >
                <NavIndex>{String(index + 1).padStart(2, '0')}</NavIndex>
                {item}
              </NavLink>
            ))}
          </NavList>
        </NavBody>
      </Panel>

      <SocialRow>
        <SocialLink
          aria-label="Discord"
          href="https://discord.gg/twenty"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandDiscord size={20} stroke={1.5} />
        </SocialLink>
        <SocialLink
          aria-label="X"
          href="https://x.com/twentycrm"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandX size={20} stroke={1.5} />
        </SocialLink>
        <SocialLink
          aria-label="LinkedIn"
          href="https://www.linkedin.com/company/twenty"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandLinkedin size={20} stroke={1.5} />
        </SocialLink>
        <SocialLink
          aria-label="Threads"
          href="https://www.threads.net/@twentycrm"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandThreads size={20} stroke={1.5} />
        </SocialLink>
      </SocialRow>
    </Shell>
  );
}
