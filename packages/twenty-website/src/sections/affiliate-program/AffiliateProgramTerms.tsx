import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  DURATION,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
} from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

import { AFFILIATE_PROGRAM_TERMS } from './affiliate-program-terms.data';

const TermsGrid = styled.div`
  column-gap: ${spacing(10)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: ${spacing(8)};

  ${mediaUp('md')} {
    grid-template-columns: 340px minmax(0, 1fr);
  }
`;

const TermsAside = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    align-self: start;
    position: sticky;
    top: ${spacing(24)};
  }
`;

const TermsCards = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const TermCard = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)} ${spacing(6)};
  transition: box-shadow ${DURATION.xs} ease;

  & > * + * {
    margin-top: ${spacing(2)};
  }

  &:hover {
    box-shadow: ${SHADOW.card};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const TermMarker = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  display: block;
  height: 7px;
  width: 14px;
`;

export function AffiliateProgramTerms() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="muted">
      <TermsGrid>
        <TermsAside>
          <Eyebrow>{i18n._(msg`How it works`)}</Eyebrow>
          <Heading as="h2" size="sm" weight="light">
            {i18n._(msg`From link *to payout*`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(
              msg`Share your link, we credit the signups it brings, and you get paid every month the customer stays.`,
            )}
          </Body>
        </TermsAside>
        <TermsCards>
          {AFFILIATE_PROGRAM_TERMS.map((term) => (
            <TermCard key={term.value.id}>
              <TermMarker aria-hidden />
              <Heading as="h3" size="xs" weight="light">
                {i18n._(term.value)}
              </Heading>
              <Body muted size="sm">
                {i18n._(term.label)}
              </Body>
            </TermCard>
          ))}
        </TermsCards>
      </TermsGrid>
    </SectionShell>
  );
}
