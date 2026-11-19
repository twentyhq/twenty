'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';

import { SITE_URLS } from '@/platform/site-urls';
import {
  buildSchemeContext,
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  Z_INDEX,
} from '@/tokens';
import { Button } from '@/ui';

// PROTOTYPE (?direction=d): copy of sections/creator-stage/CreatorApplyDock,
// pixel-identical; only the argument and the action change. One of four
// copies (apps, partners, integrators, creators): merge into one shared
// component before any PR.
const DockRoot = styled.div`
  ${buildSchemeContext('dark')}
  align-items: center;
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(3)};
  bottom: ${spacing(4)};
  box-shadow:
    inset 0 1px 0 ${color('white-10')},
    ${SHADOW.popupDark};
  display: flex;
  gap: ${spacing(4)};
  left: 50%;
  max-width: calc(100vw - ${spacing(8)});
  opacity: 0;
  padding: ${spacing(2)};
  pointer-events: none;
  position: fixed;
  transform: translate3d(-50%, ${spacing(6)}, 0);
  transition:
    opacity ${DURATION.md} ${EASING.gentle},
    transform ${DURATION.lg} ${EASING.standard},
    visibility 0s linear ${DURATION.lg};
  visibility: hidden;
  white-space: nowrap;
  z-index: ${Z_INDEX.floatingNav};

  ${mediaUp('sm')} {
    padding-left: ${spacing(4)};
  }

  &[data-visible] {
    opacity: 1;
    pointer-events: auto;
    transform: translate3d(-50%, 0, 0);
    transition-delay: 0s;
    visibility: visible;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const DockLabel = styled.p`
  color: ${semanticColor.ink};
  display: none;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  letter-spacing: -0.01em;
  white-space: nowrap;

  ${mediaUp('sm')} {
    display: block;
  }
`;

type AppsStageApplyDockProps = {
  // Defaults to the marketplace's own pitch: build an app, read the docs.
  action?: { href: string; label: string };
  label?: string;
};

// Shows whenever none of the page's primary buttons (marked
// data-apps-stage-primary) is on screen, so the action never shows twice.
export function AppsStageApplyDock({ action, label }: AppsStageApplyDockProps) {
  const { i18n } = useLingui();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const anchors = document.querySelectorAll('[data-apps-stage-primary]');
    const visibleAnchors = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visibleAnchors.add(entry.target);
        } else {
          visibleAnchors.delete(entry.target);
        }
      }
      setIsVisible(visibleAnchors.size === 0);
    });
    for (const anchor of anchors) {
      observer.observe(anchor);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <DockRoot
      aria-hidden={!isVisible}
      data-scheme="dark"
      data-visible={isVisible ? '' : undefined}
    >
      <DockLabel>{label ?? i18n._(msg`Build your own app`)}</DockLabel>
      <Button
        href={action?.href ?? SITE_URLS.docsDevelopers}
        label={action?.label ?? i18n._(msg`Read the docs`)}
        variant="filled"
      />
    </DockRoot>
  );
}
