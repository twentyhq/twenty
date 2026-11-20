'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import {
  color,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading } from '@/ui';

// The directory with nobody in it yet: the ruled sheet stays, so the page
// reads as a register waiting for entries, with matching as the way forward.
const Sheet = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin-top: ${spacing(10)};
  overflow: hidden;

  ${mediaUp('md')} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`;

const Offer = styled.div`
  padding: ${spacing(8)} ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(12)};
  }
`;

const CtaSlot = styled.div`
  padding-top: ${spacing(4)};
`;

const Ledger = styled.div`
  background-color: ${color('neutral')};
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
  padding: ${spacing(6)};

  ${mediaUp('md')} {
    border-left: 1px solid ${semanticColor.line};
    border-top: none;
    padding: ${spacing(8)};
  }
`;

const LedgerLines = styled.div`
  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const LedgerLine = styled.span`
  align-items: center;
  display: flex;
  gap: ${spacing(4)};

  &::before {
    border: 1px dashed ${semanticColor.lineStrong};
    border-radius: ${radius(1.5)};
    content: '';
    flex-shrink: 0;
    height: 32px;
    width: 32px;
  }

  &::after {
    background-image: linear-gradient(
      to right,
      ${semanticColor.lineStrong} 50%,
      transparent 50%
    );
    background-size: 8px 1px;
    content: '';
    flex: 1;
    height: 1px;
  }
`;

const MonoLine = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  line-height: 1.4;
  margin-top: ${spacing(6)};
  text-transform: uppercase;
`;

type PartnersStageEmptyDirectoryProps = {
  cta: ReactNode;
};

// PROTOTYPE
export function PartnersStageEmptyDirectory({
  cta,
}: PartnersStageEmptyDirectoryProps) {
  const { i18n } = useLingui();

  return (
    <Sheet>
      <Offer>
        <Heading as="h3" size="md" weight="light">
          {i18n._(msg`Let us *match* you`)}
        </Heading>
        <Body muted size="md">
          {i18n._(
            msg`Share your project in a few minutes. We pair you with a certified partner who fits.`,
          )}
        </Body>
        <CtaSlot>{cta}</CtaSlot>
      </Offer>
      <Ledger aria-hidden>
        <LedgerLines>
          <LedgerLine />
          <LedgerLine />
          <LedgerLine />
        </LedgerLines>
        <MonoLine>{i18n._(msg`No partners to show right now`)}</MonoLine>
      </Ledger>
    </Sheet>
  );
}
