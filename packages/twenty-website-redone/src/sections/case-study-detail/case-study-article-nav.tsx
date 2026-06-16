'use client';

import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from '@tabler/icons-react';
import { type MouseEvent, useCallback, useRef, useState } from 'react';

import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { clampProgress, useScheduledOnScroll } from '@/platform/motion';
import {
  buildSchemeContext,
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
  Z_INDEX,
} from '@/tokens';

import { type IconComponent } from '@/icons';
import { SITE_URLS } from '@/platform/site-urls';
import { ExternalLink } from '@/ui';

import { CASE_STUDY_HIGHLIGHTS_ANCHOR } from './case-study-highlights-anchor';
import { caseStudySectionId } from './case-study-section-id';

const READING_LINE_FRACTION = 0.3;
const STAT_APPEAR_FRACTION = 0.35;
const ARTICLE_TAIL_FRACTION = 0.6;
const FADE_RAMP_FRACTION = 0.06;

type SocialLink = {
  ariaLabel: MessageDescriptor;
  href: string;
  icon: IconComponent;
};

const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    ariaLabel: msg`GitHub (opens in new tab)`,
    href: SITE_URLS.github,
    icon: IconBrandGithub,
  },
  {
    ariaLabel: msg`Discord (opens in new tab)`,
    href: SITE_URLS.discord,
    icon: IconBrandDiscord,
  },
  {
    ariaLabel: msg`LinkedIn (opens in new tab)`,
    href: SITE_URLS.linkedin,
    icon: IconBrandLinkedin,
  },
  {
    ariaLabel: msg`X (opens in new tab)`,
    href: SITE_URLS.x,
    icon: IconBrandX,
  },
];

const Shell = styled.aside`
  display: none;
  flex-direction: column;
  gap: ${spacing(10)};
  opacity: var(--toc-opacity, 0);
  pointer-events: none;
  position: fixed;
  right: ${spacing(10)};
  top: 50%;
  transform: translateY(-50%);
  width: 213px;
  z-index: ${Z_INDEX.floatingNav};

  &[data-visible='true'] {
    pointer-events: auto;
  }

  ${mediaUp('lg')} {
    display: flex;
  }
`;

const Panel = styled.div`
  ${buildSchemeContext('dark')}
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(3)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  overflow: hidden;
  padding: ${spacing(5)};
  width: 100%;
`;

const Eyebrow = styled.p`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const NavBody = styled.div`
  display: flex;
  gap: ${spacing(4)};
`;

const RailTrack = styled.div`
  align-self: stretch;
  background-color: ${semanticColor.line};
  border-radius: 2px;
  flex-shrink: 0;
  position: relative;
  width: 2px;
`;

const RailFill = styled.div`
  background-color: ${color('blue')};
  border-radius: 2px;
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
  gap: ${spacing(5)};
  min-height: 0;
  min-width: 0;
`;

const NavLink = styled.a`
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  display: block;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.regular};
  line-height: 1.4;
  overflow-wrap: anywhere;
  text-decoration: none;
  transition:
    color 0.15s ease,
    font-weight 0.15s ease;

  &:hover {
    color: ${semanticColor.ink};
  }

  &[data-active='true'] {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }
`;

const NavIndex = styled.span`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.05em;
  margin-right: ${spacing(2)};
`;

const SocialRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(6)};
`;

const SocialItem = styled(ExternalLink)`
  align-items: center;
  color: ${color('black')};
  display: flex;
  flex-shrink: 0;
  transition: color 0.15s ease;

  &:hover {
    color: ${color('blue')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

export type CaseStudyArticleNavProps = {
  items: readonly MessageDescriptor[];
};

export function CaseStudyArticleNav({ items }: CaseStudyArticleNavProps) {
  const { i18n } = useLingui();
  const shellRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionCount = items.length;

  const updateFromScroll = useCallback(() => {
    if (sectionCount === 0) {
      return;
    }
    const viewportHeight = window.innerHeight;
    const readingLine = viewportHeight * READING_LINE_FRACTION;
    const rampHeight = viewportHeight * FADE_RAMP_FRACTION;

    const highlightsRect = document
      .getElementById(CASE_STUDY_HIGHLIGHTS_ANCHOR)
      ?.getBoundingClientRect();
    const lastRect = document
      .getElementById(caseStudySectionId(sectionCount - 1))
      ?.getBoundingClientRect();

    let opacity = 0;
    if (highlightsRect && lastRect) {
      const appearFactor = clampProgress(
        (viewportHeight * STAT_APPEAR_FRACTION +
          rampHeight -
          highlightsRect.top) /
          rampHeight,
      );
      const tailFactor = clampProgress(
        (lastRect.bottom - viewportHeight * ARTICLE_TAIL_FRACTION) / rampHeight,
      );
      opacity = Math.min(appearFactor, tailFactor);
    }

    shellRef.current?.style.setProperty('--toc-opacity', String(opacity));
    setVisible(opacity > 0.5);

    let nextActive = 0;
    for (let index = sectionCount - 1; index >= 0; index -= 1) {
      const rect = document
        .getElementById(caseStudySectionId(index))
        ?.getBoundingClientRect();
      if (rect && rect.top <= readingLine) {
        nextActive = index;
        break;
      }
    }
    setActiveIndex(nextActive);
  }, [sectionCount]);

  useScheduledOnScroll(updateFromScroll);

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

  const progressPercent =
    sectionCount === 0 ? 0 : ((activeIndex + 1) / sectionCount) * 100;
  const label = i18n._(msg`On this page`);

  return (
    <Shell ref={shellRef} aria-hidden={!visible} data-visible={visible}>
      <Panel>
        <Eyebrow>{label}</Eyebrow>
        <NavBody>
          <RailTrack>
            <RailFill style={{ height: `${progressPercent}%` }} />
          </RailTrack>
          <NavList aria-label={label}>
            {items.map((item, index) => {
              const targetId = caseStudySectionId(index);
              return (
                <NavLink
                  key={getMessageDescriptorSource(item)}
                  data-active={index === activeIndex}
                  href={`#${targetId}`}
                  onClick={(event) => handleNavClick(event, targetId)}
                >
                  <NavIndex>{String(index + 1).padStart(2, '0')}</NavIndex>
                  {i18n._(item)}
                </NavLink>
              );
            })}
          </NavList>
        </NavBody>
      </Panel>

      <SocialRow>
        {SOCIAL_LINKS.map((social) => {
          const IconComponent = social.icon;
          return (
            <SocialItem
              key={social.href}
              aria-label={i18n._(social.ariaLabel)}
              href={social.href}
            >
              <IconComponent aria-hidden size={20} />
            </SocialItem>
          );
        })}
      </SocialRow>
    </Shell>
  );
}
