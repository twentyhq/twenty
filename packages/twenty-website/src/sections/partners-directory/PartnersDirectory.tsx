'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import { mediaUp, radius, semanticColor, spacing } from '@/tokens';
import {
  Body,
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { PartnerCard } from './PartnerCard';

const Header = styled.div`
  max-width: 640px;
`;

// Three cards side by side from md, with the /apps cards' spacing.
const Grid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  /* Fixed tracks: a short row keeps its cards at the row's width. */
  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Offer = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(10)} ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(14)} ${spacing(12)};
  }
`;

const OfferAction = styled.div`
  padding-top: ${spacing(2)};
`;

type PartnersDirectoryProps = {
  matchCta: ReactNode;
  partners: readonly MarketplacePartner[];
};

export function PartnersDirectory({
  matchCta,
  partners,
}: PartnersDirectoryProps) {
  const { i18n } = useLingui();

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <Header id={PARTNER_DIRECTORY_ANCHOR_ID} tabIndex={-1}>
          <SectionIntro>
            <Eyebrow>{i18n._(msg`Directory`)}</Eyebrow>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Browse the *certified partners*`)}
            </Heading>
            <Body muted size="md">
              {i18n._(
                msg`Read a profile and book a call with the partner yourself.`,
              )}
            </Body>
          </SectionIntro>
        </Header>
        {partners.length === 0 ? (
          <Offer>
            <Heading as="h3" size="sm" weight="light">
              {i18n._(msg`Let us *match* you`)}
            </Heading>
            <Body muted size="md">
              {i18n._(
                msg`Share your project in a few minutes. We pair you with a certified partner who fits.`,
              )}
            </Body>
            <OfferAction>{matchCta}</OfferAction>
          </Offer>
        ) : (
          <div>
            <Grid>
              {partners.map((partner) => (
                <PartnerCard key={partner.slug} partner={partner} />
              ))}
            </Grid>
          </div>
        )}
      </SectionStack>
    </SectionShell>
  );
}
