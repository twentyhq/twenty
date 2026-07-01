'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { isSafeHttpUrl } from './is-safe-http-url';
import { type PartnerCaseStudy } from './marketplace-partner';
import { RichText } from './rich-text';
import { CaseStudyVisual } from './CaseStudyVisual';
import {
  CloseButton,
  ModalBody,
  ModalClient,
  ModalDesc,
  ModalFoot,
  ModalHeader,
  ModalHeaderCopy,
  ModalHeaderIntro,
  ModalLink,
  ModalNav,
  ModalPanel,
  ModalRoot,
  ModalScrim,
  ModalTitle,
  ModalVisualSlot,
  NavButton,
  NavButtonPrimary,
} from './CaseStudyModal.styles';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CaseStudyModal({
  cases,
  openIndex,
  onClose,
}: {
  cases: readonly PartnerCaseStudy[];
  openIndex: number | null;
  onClose: () => void;
}) {
  const { i18n } = useLingui();
  const [index, setIndex] = useState(openIndex ?? 0);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (openIndex !== null) {
      setIndex(openIndex);
    }
  }, [openIndex]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [index, openIndex]);

  useEffect(() => {
    if (openIndex === null) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || panelRef.current === null) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [openIndex]);

  if (openIndex === null || !mounted) {
    return null;
  }

  const caseStudy = cases[index];

  if (caseStudy === undefined) {
    return null;
  }

  const imageUrl =
    caseStudy.imageUrl !== null && isSafeHttpUrl(caseStudy.imageUrl)
      ? caseStudy.imageUrl
      : null;
  const outboundLink =
    caseStudy.link !== null && isSafeHttpUrl(caseStudy.link)
      ? caseStudy.link
      : null;
  const isPreviousDisabled = index === 0;
  const isNextDisabled = index === cases.length - 1;

  const handlePrevious = () => {
    setIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setIndex((currentIndex) => Math.min(cases.length - 1, currentIndex + 1));
  };

  return createPortal(
    <ModalRoot>
      <ModalScrim aria-hidden="true" onClick={onClose} />
      <ModalPanel
        ref={panelRef}
        aria-label={i18n._(msg`Case study`)}
        aria-modal="true"
        role="dialog"
      >
        <ModalHeader>
          <CloseButton
            ref={closeButtonRef}
            aria-label={i18n._(msg`Close`)}
            onClick={onClose}
            type="button"
          >
            <IconX aria-hidden="true" size={24} stroke={1.5} />
          </CloseButton>
          <ModalHeaderIntro>
            <ModalHeaderCopy>
              <ModalClient>{caseStudy.client}</ModalClient>
              <ModalTitle>{caseStudy.title}</ModalTitle>
            </ModalHeaderCopy>
            {imageUrl !== null ? (
              <ModalVisualSlot>
                <CaseStudyVisual
                  alt={caseStudy.title}
                  imageUrl={imageUrl}
                  size="modal"
                />
              </ModalVisualSlot>
            ) : null}
          </ModalHeaderIntro>
        </ModalHeader>
        <ModalBody ref={bodyRef}>
          <ModalDesc>
            <RichText markdown={caseStudy.body} />
          </ModalDesc>
        </ModalBody>
        <ModalFoot>
          {outboundLink !== null ? (
            <ModalLink
              href={outboundLink}
              rel="noopener nofollow"
              target="_blank"
            >
              {i18n._(msg`View case study`)}
            </ModalLink>
          ) : null}
          <ModalNav>
            <NavButton
              disabled={isPreviousDisabled}
              onClick={handlePrevious}
              type="button"
            >
              {i18n._(msg`Previous`)}
            </NavButton>
            <NavButtonPrimary
              disabled={isNextDisabled}
              onClick={handleNext}
              type="button"
            >
              {i18n._(msg`Next`)}
            </NavButtonPrimary>
          </ModalNav>
        </ModalFoot>
      </ModalPanel>
    </ModalRoot>,
    document.body,
  );
}
